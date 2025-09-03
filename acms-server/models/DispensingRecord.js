const db = require('../config/database');

const DispensingRecord = {
    create: (recordData, callback) => {
        const { prescription_drug_id, dispenser_id, dispensed_quantity, notes } = recordData;
        const query = 'INSERT INTO dispensing_records (prescription_drug_id, dispenser_id, dispensed_quantity, notes) VALUES (?, ?, ?, ?)';
        db.execute(query, [prescription_drug_id, dispenser_id, dispensed_quantity, notes], callback);
    },

    findByPrescriptionId: (prescriptionId, callback) => {
        const query = `
      SELECT dr.*, u.first_name as dispenser_first_name, u.last_name as dispenser_last_name
      FROM dispensing_records dr 
      JOIN users u ON dr.dispenser_id = u.user_id 
      WHERE dr.prescription_id = ?
    `;
        db.execute(query, [prescriptionId], callback);
    }
};

module.exports = DispensingRecord;