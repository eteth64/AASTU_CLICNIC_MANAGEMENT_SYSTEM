const db = require('../config/database');

const PrescriptionDrug = {
  create: (prescriptionData, callback) => {
    const { prescription_id, inventory_id, quantity, dosage_instructions } = prescriptionData;
    const query = 'INSERT INTO prescription_drugs (prescription_id, inventory_id, quantity, dosage_instructions) VALUES (?, ?, ?, ?)';
    db.execute(query, [prescription_id, inventory_id, quantity, dosage_instructions], callback);
  },


};

module.exports = PrescriptionDrug;