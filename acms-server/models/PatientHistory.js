const db = require('../config/database');


const PatientHistory = {
    create: (historyData, callback) => {
        const { request_id, doctor_id, complaint, diagnosis, treatment } = historyData;
        const query = 'INSERT INTO patient_histories (request_id, doctor_id, complaint, diagnosis, treatment) VALUES (?, ?, ?, ?, ?)';
        db.execute(query, [request_id, doctor_id, complaint, diagnosis, treatment], callback);
    },


    startConsultation: (historyData, callback) => {
        const { request_id, doctor_id, complaint } = historyData;
        const params = [
            request_id ? request_id : null,
            doctor_id ? doctor_id : null,
            complaint ? complaint : null
        ];
        const query = `
        INSERT INTO patient_histories (request_id, doctor_id, complaint)
        VALUES (?, ?, ?)
    `;
        db.execute(query, params, callback);
    },

    completePatientHistory: (historyData, callback) => {
        const { request_id, doctor_id, diagnosis, treatment } = historyData;
        const params = [
            diagnosis ? diagnosis : null,
            treatment ? treatment : null,
            request_id ? request_id : null,
            doctor_id ? doctor_id : null
        ];
        const query = `
        UPDATE patient_histories
        SET diagnosis = ?, treatment = ?
        WHERE request_id = ? AND doctor_id = ?
    `;
        db.execute(query, params, callback);
    },

    findByRequestId: (requestId, callback) => {
        const query = `
      SELECT ph.*, u.first_name as doctor_first_name, u.last_name as doctor_last_name 
      FROM patient_histories ph 
      JOIN users u ON ph.doctor_id = u.user_id 
      WHERE ph.request_id = ?
    `;
        db.execute(query, [requestId], callback);
    },

    findByStudentId: (studentId, callback) => {
        const query = `
      SELECT ph.*, rr.student_id, u.first_name as doctor_first_name, u.last_name as doctor_last_name 
      FROM patient_histories ph 
      JOIN reception_requests rr ON ph.request_id = rr.request_id 
      JOIN users u ON ph.doctor_id = u.user_id 
      WHERE rr.student_id = ?
    `;
        db.execute(query, [studentId], callback);
    }
};

module.exports = PatientHistory;