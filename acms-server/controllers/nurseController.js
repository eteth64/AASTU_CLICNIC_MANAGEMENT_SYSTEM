const PrescriptionRequest = require('../models/PrescriptionRequest');
const DispensingRecord = require('../models/DispensingRecord');
const Inventory = require('../models/Inventory');
const db = require('../config/database');

const getPendingPrescriptions = (req, res) => {
    PrescriptionRequest.findAllPendingForNurse((error, results) => {
        if (error) {
            console.error('Error fetching pending prescriptions:', error);
            return res.status(500).json({ message: 'Server error' });
        }


        res.status(200).json(results);
    });
};

const dispenseMedication = (req, res) => {
    const { prescription_drug_id, dispensed_quantity, notes } = req.body;
    const dispenser_id = req.user.user_id;

    // Validate input
    if (!prescription_drug_id || !dispensed_quantity || dispensed_quantity <= 0) {
        return res.status(400).json({ message: 'Please provide valid prescription drug ID and dispensed quantity' });
    }

    // Start a transaction
    db.beginTransaction((err) => {
        if (err) {
            console.error('Error starting transaction:', err);
            return res.status(500).json({ message: 'Server error' });
        }

        // Step 1: Get prescription drug details and check inventory
        const queryPrescriptionDrug = `
            SELECT pd.prescription_id, pd.inventory_id, pd.quantity AS prescribed_quantity, i.quantity AS inventory_quantity
            FROM prescription_drugs pd
            JOIN inventory i ON pd.inventory_id = i.inventory_id
            WHERE pd.prescription_drug_id = ?
        `;
        db.execute(queryPrescriptionDrug, [prescription_drug_id], (error, results) => {
            if (error) {
                console.error('Error fetching prescription drug:', error);
                return db.rollback(() => res.status(500).json({ message: 'Server error' }));
            }
            if (results.length === 0) {
                return db.rollback(() => res.status(404).json({ message: 'Prescription drug not found' }));
            }

            const { prescription_id, prescribed_quantity, inventory_quantity } = results[0];

            // Check if inventory has enough quantity
            if (inventory_quantity < dispensed_quantity) {
                return db.rollback(() => res.status(400).json({ message: 'Insufficient inventory quantity' }));
            }
            if (dispensed_quantity > prescribed_quantity) {
                return db.rollback(() => res.status(400).json({ message: 'Dispensed quantity exceeds prescribed quantity' }));
            }

            // Step 2: Update inventory quantity
            const updateInventoryQuery = 'UPDATE inventory SET quantity = quantity - ? WHERE inventory_id = ?';
            db.execute(updateInventoryQuery, [dispensed_quantity, results[0].inventory_id], (error) => {
                if (error) {
                    console.error('Error updating inventory:', error);
                    return db.rollback(() => res.status(500).json({ message: 'Server error' }));
                }

                // Step 3: Create dispensing record
                const dispensingData = { prescription_drug_id, dispenser_id, dispensed_quantity, notes };
                DispensingRecord.create(dispensingData, (error, recordResults) => {
                    if (error) {
                        console.error('Error creating dispensing record:', error);
                        return db.rollback(() => res.status(500).json({ message: 'Server error' }));
                    }

                    // Step 4: Update prescription drug status to 'dispensed'
                    const updateDrugStatusQuery = 'UPDATE prescription_drugs SET status = ? WHERE prescription_drug_id = ?';
                    db.execute(updateDrugStatusQuery, ['dispensed', prescription_drug_id], (error) => {
                        if (error) {
                            console.error('Error updating prescription drug status:', error);
                            return db.rollback(() => res.status(500).json({ message: 'Server error' }));
                        }

                        // Step 5: Check if all prescription drugs for the prescription_id are dispensed
                        const checkAllDrugsQuery = `
                            SELECT COUNT(*) AS total, 
                            SUM(CASE WHEN status = 'dispensed' THEN 1 ELSE 0 END) AS dispensed_count
                            FROM prescription_drugs
                            WHERE prescription_id = ?
                        `;
                        db.execute(checkAllDrugsQuery, [prescription_id], (error, checkResults) => {
                            if (error) {
                                console.error('Error checking prescription drugs status:', error);
                                return db.rollback(() => res.status(500).json({ message: 'Server error' }));
                            }

                            const { total, dispensed_count } = checkResults[0];
                            if (total == dispensed_count) {
                                // Step 6: Update prescription_requests and reception_requests status
                                PrescriptionRequest.updateStatus(prescription_id, 'dispensed', (error) => {
                                    if (error) {
                                        console.error('Error updating prescription request status:', error);
                                        return db.rollback(() => res.status(500).json({ message: 'Server error' }));
                                    }

                                    // Update reception_requests status to 'completed'
                                    const updateReceptionStatusQuery = `
                                        UPDATE reception_requests 
                                        SET status = 'completed' 
                                        WHERE request_id = (
                                            SELECT request_id 
                                            FROM prescription_requests 
                                            WHERE prescription_id = ?
                                        )
                                    `;
                                    db.execute(updateReceptionStatusQuery, [prescription_id], (error) => {
                                        if (error) {
                                            console.error('Error updating reception request status:', error);
                                            return db.rollback(() => res.status(500).json({ message: 'Server error' }));
                                        }

                                        // Commit transaction
                                        db.commit((commitErr) => {
                                            if (commitErr) {
                                                console.error('Error committing transaction:', commitErr);
                                                return db.rollback(() => res.status(500).json({ message: 'Server error' }));
                                            }
                                            res.status(201).json({
                                                message: 'Medication dispensed successfully',
                                                recordId: recordResults.insertId
                                            });
                                        });
                                    });
                                });
                            } else {
                                // Commit transaction without updating statuses
                                db.commit((commitErr) => {
                                    if (commitErr) {
                                        console.error('Error committing transaction:', commitErr);
                                        return db.rollback(() => res.status(500).json({ message: 'Server error' }));
                                    }
                                    res.status(201).json({
                                        message: 'Medication dispensed successfully, some drugs still pending',
                                        recordId: recordResults.insertId
                                    });
                                });
                            }
                        });
                    });
                });
            });
        });
    });
};

module.exports = {
    getPendingPrescriptions,
    dispenseMedication
};