const db = require('../config/database');

const LabResult = {
    create: (resultData, callback) => {
        const { order_id, technician_id, lab_result, technical_notes } = resultData;

        // Convert the JavaScript object to a JSON string
        const labResultJson = JSON.stringify(lab_result);

        const query = 'INSERT INTO lab_results (order_id, technician_id, lab_result, technical_notes) VALUES (?, ?, ?, ?)';
        db.execute(query, [order_id, technician_id, labResultJson, technical_notes], callback);
    },

    findByOrderId: (orderId, callback) => {
        const query = `
      SELECT lr.*, u.first_name as technician_first_name, u.last_name as technician_last_name
      FROM lab_results lr 
      JOIN users u ON lr.technician_id = u.user_id 
      WHERE lr.order_id = ?
    `;
        db.execute(query, [orderId], callback);
    },

    updateCompletedAt: (resultId, callback) => {
        const query = 'UPDATE lab_results SET completed_at = CURRENT_TIMESTAMP WHERE result_id = ?';
        db.execute(query, [resultId], callback);
    }
};

module.exports = LabResult;