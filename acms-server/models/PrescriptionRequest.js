const db = require('../config/database');

const PrescriptionRequest = {
    create: (prescriptionData, callback) => {
        const { request_id, doctor_id } = prescriptionData;
        const query = 'INSERT INTO prescription_requests (request_id, doctor_id) VALUES (?, ?)';
        db.execute(query, [request_id, doctor_id], callback);
    },

    findById: (prescriptionId, callback) => {
        const query = `
      SELECT pr.*, u.first_name as doctor_first_name, u.last_name as doctor_last_name,
      rr.student_id, s.first_name as student_first_name, s.last_name as student_last_name
      FROM prescription_requests pr 
      JOIN users u ON pr.doctor_id = u.user_id 
      JOIN reception_requests rr ON pr.request_id = rr.request_id
      JOIN students s ON rr.student_id = s.student_id
      WHERE pr.prescription_id = ?
    `;
        db.execute(query, [prescriptionId], callback);
    },

    findByRequestId: (requestId, callback) => {
        const query = `
      SELECT pr.*, u.first_name as doctor_first_name, u.last_name as doctor_last_name
      FROM prescription_requests pr 
      JOIN users u ON pr.doctor_id = u.user_id 
      WHERE pr.request_id = ?
    `;
        db.execute(query, [requestId], callback);
    },

    findAllPendingForPharmacy: (callback) => {
        const query = `
        SELECT 
            pr.prescription_id,
            pr.request_id,
            pr.doctor_id,
            pd.status,
            pr.created_at,
            u.first_name AS doctor_first_name,
            u.last_name AS doctor_last_name,
            rr.student_id,
            s.first_name AS student_first_name,
            s.last_name AS student_last_name,
            pd.prescription_drug_id,
            pd.inventory_id,
            pd.quantity,
            pd.dosage_instructions,
            i.medicine_name
        FROM prescription_requests pr
        JOIN users u ON pr.doctor_id = u.user_id
        JOIN reception_requests rr ON pr.request_id = rr.request_id
        JOIN students s ON rr.student_id = s.student_id
        JOIN prescription_drugs pd ON pr.prescription_id = pd.prescription_id
        JOIN inventory i ON pd.inventory_id = i.inventory_id
        WHERE pd.status = 'pending'
        AND i.dispenser_role = 'pharmacy'
    `;
        db.execute(query, callback);
    },
    findAllPendingForNurse: (callback) => {
        const query = `
        SELECT 
            pr.prescription_id,
            pr.request_id,
            pr.doctor_id,
            pd.status,
            pr.created_at,
            u.first_name AS doctor_first_name,
            u.last_name AS doctor_last_name,
            rr.student_id,
            s.first_name AS student_first_name,
            s.last_name AS student_last_name,
            pd.prescription_drug_id,
            pd.inventory_id,
            pd.quantity,
            pd.dosage_instructions,
            i.medicine_name
        FROM prescription_requests pr
        JOIN users u ON pr.doctor_id = u.user_id
        JOIN reception_requests rr ON pr.request_id = rr.request_id
        JOIN students s ON rr.student_id = s.student_id
        JOIN prescription_drugs pd ON pr.prescription_id = pd.prescription_id
        JOIN inventory i ON pd.inventory_id = i.inventory_id
        WHERE pd.status = 'pending'
        AND i.dispenser_role = 'nurse'
    `;
        db.execute(query, callback);
    },

    updateStatus: (prescriptionId, status, callback) => {
        const query = 'UPDATE prescription_requests SET status = ? WHERE prescription_id = ?';
        db.execute(query, [status, prescriptionId], callback);
    }
};

module.exports = PrescriptionRequest;