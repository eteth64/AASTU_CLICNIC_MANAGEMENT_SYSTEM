const db = require('../config/database');

const ReceptionRequest = {
    create: (requestData, callback) => {
        const { student_id, receptionist_id, priority_level, initial_notes } = requestData;
        const query = 'INSERT INTO reception_requests (student_id, receptionist_id, priority_level, initial_notes) VALUES (?, ?, ?, ?)';
        db.execute(query, [student_id, receptionist_id, priority_level, initial_notes], callback);
    },

    findByStudentId: (studentId, callback) => {
        const query = `
      SELECT * 
      FROM reception_requests 
      WHERE student_id = ?
      ORDER BY created_at DESC 
      LIMIT 1
    `;
        db.execute(query, [studentId], callback);
    },

    findById: (requestId, callback) => {
        const query = `
      SELECT rr.*, s.first_name, s.last_name, s.email, s.year_of_study, s.department 
      FROM reception_requests rr 
      JOIN students s ON rr.student_id = s.student_id 
      WHERE rr.request_id = ?
    `;
        db.execute(query, [requestId], callback);
    },

    findAllPending: (callback) => {
        const query = `
      SELECT rr.*, s.first_name, s.last_name, s.email 
      FROM reception_requests rr 
      JOIN students s ON rr.student_id = s.student_id 
      WHERE rr.status = 'pending' or rr.status = 'with_doctor'
    `;
        db.execute(query, callback);
    },

    updateStatus: (requestId, status, callback) => {
        const query = 'UPDATE reception_requests SET status = ? WHERE request_id = ?';
        db.execute(query, [status, requestId], callback);
    },

    getAnalytics: (callback) => {
        const query = `
     SELECT 
    COUNT(*) AS total_requests,
    SUM(CASE WHEN rr.status = 'completed' THEN 1 ELSE 0 END) AS completed_requests,
    SUM(CASE WHEN rr.status = 'pending' THEN 1 ELSE 0 END) AS pending_requests,
    SUM(CASE WHEN rr.status = 'with_doctor' THEN 1 ELSE 0 END) AS with_doctor_requests,
    
    SUM(CASE WHEN rr.status = 'with_pharmacy' THEN 1 ELSE 0 END) AS with_pharmacy_requests,
    SUM(CASE WHEN rr.status = 'with_nurse' THEN 1 ELSE 0 END) AS with_nurse_requests,
    SUM(CASE WHEN rr.status = 'with_lab' AND lo.status != 'completed' THEN 1 ELSE 0 END) AS with_laboratory_requests,
    SUM(CASE WHEN rr.status = 'with_lab' AND lo.status = 'completed' THEN 1 ELSE 0 END) AS lab_result
FROM reception_requests rr
LEFT JOIN lab_orders lo ON rr.request_id = lo.request_id
    `;
        db.execute(query, callback);
    }
};

module.exports = ReceptionRequest;