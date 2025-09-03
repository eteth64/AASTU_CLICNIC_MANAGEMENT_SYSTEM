const ReceptionRequest = require('../models/ReceptionRequest');
const PatientHistory = require('../models/PatientHistory');
const LabOrder = require('../models/LabOrder');
const PrescriptionRequest = require('../models/PrescriptionRequest');
const PrescriptionDrug = require('../models/PrescriptionDrug');
const Inventory = require('../models/Inventory')
const db = require('../config/database');
const { fetchAnalytics } = require('./receptionController');

const getPendingAndLabResultedRequests = (req, res) => {
    // Query for pending requests
    ReceptionRequest.findAllPending((error, pendingRequests) => {
        if (error) {
            return res.status(500).json({ message: 'Server error' });
        }

        // Query for with_lab requests where lab_orders status is completed, including student details
        const labQuery = `
            SELECT rr.*, s.first_name, s.last_name, s.email
            FROM reception_requests rr
            JOIN lab_orders lo ON rr.request_id = lo.request_id
            JOIN students s ON rr.student_id = s.student_id
            WHERE rr.status = 'with_lab' AND lo.status = 'completed'
        `;



        db.execute(labQuery, [], (error, labRequests) => {
            if (error) {
                return res.status(500).json({ message: 'Server error' });
            }

            // Combine both results
            const combinedResults = [
                ...(pendingRequests || []),
                ...(labRequests || [])
            ];

            res.json(combinedResults);
        });
    });
};

const getPatientHistory = (req, res) => {
    const { requestId } = req.params;



    PatientHistory.findByRequestId(requestId, (err, historyResults) => {
        if (err) {
            return res.status(500).json({ message: 'Server error' });
        }

        res.json(

            historyResults
        );
    });

};

const createLabOrder = (req, res) => {
    const { request_id, lab_request, clinical_notes } = req.body;
    const doctor_id = req.user.user_id;

    if (!request_id || !lab_request) {
        return res.status(400).json({ message: 'Please provide request ID and lab request details' });
    }

    // Convert undefined clinical_notes to null
    const orderData = {
        request_id,
        doctor_id,
        lab_request,
        clinical_notes: clinical_notes !== undefined ? clinical_notes : null
    };

    LabOrder.create(orderData, (error, results) => {
        if (error) {
            return res.status(500).json({ message: 'Server error' });
        }

        ReceptionRequest.updateStatus(request_id, 'with_lab', (err) => {
            if (err) {
                return res.status(500).json({ message: 'Server error' });
            }

            res.status(201).json({ message: 'Lab order created successfully', orderId: results.insertId });
        });
    });
};

const createPrescription = (req, res) => {
    const { request_id, diagnosis, prescription_details } = req.body;
    const doctor_id = req.user.user_id;



    // Validate required fields
    if (!request_id || !diagnosis || !prescription_details || !Array.isArray(prescription_details) || prescription_details.length === 0) {
        return res.status(400).json({ message: 'Please provide request ID, diagnosis, and valid prescription details' });
    }


    // Validate each prescription detail
    for (const detail of prescription_details) {
        if (!detail.inventory_id || detail.quantity == null || detail.quantity <= 0) {
            return res.status(400).json({ message: 'Each prescription detail must include a valid inventory_id and a positive quantity' });
        }
        // dosage can be undefined (maps to NULL in the database)
    }

    // Start a transaction to ensure data consistency
    db.beginTransaction((err) => {
        if (err) {
            console.error('Error starting transaction:', err);
            return res.status(500).json({ message: 'Server error' });
        }

        // Create prescription in prescription_requests
        const prescriptionData = {
            request_id,
            doctor_id,
            status: 'pending'
        };

        PrescriptionRequest.create(prescriptionData, (error, results) => {
            if (error) {
                console.error('Error creating prescription:', error);
                return db.rollback(() => {
                    res.status(500).json({ message: 'Server error' });
                });
            }

            const prescription_id = results.insertId;

            // Prepare patient history data with first medicine name as treatment
            const historyData = {
                request_id,
                doctor_id,
                diagnosis,
                treatment: prescription_details[0].medicine_name // Use first medicine name as treatment
            };

            // Update or insert patient history
            PatientHistory.completePatientHistory(historyData, (err) => {
                if (err) {
                    console.error('Error updating patient history:', err);
                    return db.rollback(() => {
                        res.status(500).json({ message: 'Server error' });
                    });
                }

                // Insert prescription drugs
                const insertDrugPromises = prescription_details.map(detail => {
                    const drugData = {
                        prescription_id,
                        inventory_id: detail.inventory_id,
                        quantity: detail.quantity,
                        dosage_instructions: detail.dosage || null
                    };

                    return new Promise((resolve, reject) => {
                        PrescriptionDrug.create(drugData, (drugErr, drugResult) => {
                            if (drugErr) {
                                reject(drugErr);
                            } else {
                                resolve(drugResult);
                            }
                        });
                    });
                });

                // Execute all drug insertions
                Promise.all(insertDrugPromises)
                    .then(() => {
                        // Update request status
                        ReceptionRequest.updateStatus(request_id, 'with_pharmacy', (updateErr) => {
                            if (updateErr) {
                                console.error('Error updating request status:', updateErr);
                                return db.rollback(() => {
                                    res.status(500).json({ message: 'Server error' });
                                });
                            }

                            // Commit transaction
                            db.commit((commitErr) => {
                                if (commitErr) {
                                    console.error('Error committing transaction:', commitErr);
                                    return db.rollback(() => {
                                        res.status(500).json({ message: 'Server error' });
                                    });
                                }

                                res.status(201).json({
                                    message: 'Prescription created successfully',
                                    prescriptionId: prescription_id
                                });
                            });
                        });
                    })
                    .catch((drugErr) => {
                        console.error('Error inserting prescription drugs:', drugErr);
                        db.rollback(() => {
                            res.status(500).json({ message: 'Server error' });
                        });
                    });
            });
        });
    });
};

const startConsultation = (req, res) => {
    const { request_id, complaint } = req.body;
    const doctor_id = req.user.user_id;

    if (!request_id || !complaint) {
        return res.status(400).json({ message: 'Please provide request ID and complaint' });
    }

    PatientHistory.startConsultation({ request_id, doctor_id, complaint }, (error, results) => {
        if (error) {
            return res.status(500).json({ message: 'Server error' });
        }

        ReceptionRequest.updateStatus(request_id, 'with_doctor', (err) => {
            if (err) {
                return res.status(500).json({ message: 'Server error' });
            }

            res.status(201).json({ message: 'Consultation started successfully', historyId: results.insertId });
        });
    });
};


// Controller: fetchLabResult
const fetchLabResult = (req, res) => {
    const { requestId } = req.params;

    // Validate requestId
    if (!requestId || isNaN(requestId)) {
        return res.status(400).json({ message: 'Invalid or missing requestId' });
    }

    LabOrder.getResultByRequestId(requestId, (error, results) => {
        if (error) {
            console.error('Error fetching lab results:', error);
            return res.status(500).json({ message: 'Server error' });
        }

        // Return empty array if no results
        res.status(200).json({
            message: 'Lab results retrieved successfully',
            data: results || []
        });
    });
};



fetchInventory = (req, res) => {
    Inventory.findAll((error, results) => {
        if (error) {
            console.error('Error fetching inventory:', error);
            return res.status(500).json({ message: 'Server error' });
        }

        res.status(200).json({
            message: 'Inventory retrieved successfully',
            data: results || []
        });
    });
};

fetchDoctorAnalytics = (req, res) => {
    ReceptionRequest.getAnalytics((error, results) => {
        if (error) {
            console.error('Error fetching analytics:', error);
            return res.status(500).json({ message: 'Server error' });
        }

        res.status(200).json(results);
    });
};

module.exports = {
    getPendingAndLabResultedRequests,
    getPatientHistory,
    createLabOrder,
    createPrescription,
    startConsultation,
    fetchLabResult,
    fetchDoctorAnalytics,
    fetchInventory
};