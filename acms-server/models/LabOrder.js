const db = require('../config/database');

const LabOrder = {
    create: (orderData, callback) => {
        const { request_id, doctor_id, lab_request, clinical_notes } = orderData;
        const query = 'INSERT INTO lab_orders (request_id, doctor_id, lab_request, clinical_notes) VALUES (?, ?, ?, ?)';
        db.execute(query, [request_id, doctor_id, lab_request, clinical_notes], callback);
    },

    findById: (orderId, callback) => {
        const query = `
      SELECT lo.*, u.first_name as doctor_first_name, u.last_name as doctor_last_name,
      rr.student_id, s.first_name as student_first_name, s.last_name as student_last_name
      FROM lab_orders lo 
      JOIN users u ON lo.doctor_id = u.user_id 
      JOIN reception_requests rr ON lo.request_id = rr.request_id
      JOIN students s ON rr.student_id = s.student_id
      WHERE lo.order_id = ?
    `;
        db.execute(query, [orderId], callback);
    },

    findByRequestId: (requestId, callback) => {
        const query = `
      SELECT lo.*, u.first_name as doctor_first_name, u.last_name as doctor_last_name
      FROM lab_orders lo 
      JOIN users u ON lo.doctor_id = u.user_id 
      WHERE lo.request_id = ?
    `;
        db.execute(query, [requestId], callback);
    },

    findAllPending: (callback) => {
        const query = `
      SELECT lo.*, u.first_name as doctor_first_name, u.last_name as doctor_last_name,
      rr.student_id, s.first_name as student_first_name, s.last_name as student_last_name
      FROM lab_orders lo 
      JOIN users u ON lo.doctor_id = u.user_id 
      JOIN reception_requests rr ON lo.request_id = rr.request_id
      JOIN students s ON rr.student_id = s.student_id
      WHERE lo.status = 'pending'
    `;
        db.execute(query, callback);
    },

    updateStatus: (orderId, status, callback) => {
        const query = 'UPDATE lab_orders SET status = ? WHERE order_id = ?';
        db.execute(query, [status, orderId], callback);
    },


    getResultByRequestId: (requestId, callback) => {
        const query = `
            SELECT 
                lo.request_id,
                u.first_name AS technician_name,
                lr.lab_result,
                lr.technical_notes
            FROM lab_results lr
            JOIN lab_orders lo ON lr.order_id = lo.order_id
            LEFT JOIN users u ON lr.technician_id = u.user_id
            WHERE lo.request_id = ? AND lo.status = 'completed';
        `;
        db.execute(query, [requestId], (error, results) => {
            if (error) {
                return callback(error, null);
            }
            callback(null, results);
        });
    }
}


module.exports = LabOrder;