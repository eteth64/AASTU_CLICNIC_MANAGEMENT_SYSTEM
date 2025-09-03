const db = require('../config/database');

const Student = {
    findById: (studentId, callback) => {
        const query = 'SELECT * FROM students WHERE student_id = ?';
        db.execute(query, [studentId], callback);
    },

    findAll: (callback) => {
        const query = 'SELECT * FROM students';
        db.execute(query, callback);
    }
};

module.exports = Student;