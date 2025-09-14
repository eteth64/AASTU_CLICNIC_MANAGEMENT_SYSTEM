const db = require('../config/database');

const Student = {
    // Fetch all students
    findAll: (callback) => {
        const query = 'SELECT * FROM students';
        db.query(query, (err, results) => {
            if (err) return callback(err, null);
            callback(null, results);
        });
    },
    findById: (studentId, callback) => {
        const query = 'SELECT * FROM students WHERE student_id = ?';
        db.query(query, [studentId], (err, results) => {
            if (err) return callback(err, null);
            callback(null, results[0]);

        });
    },

    // Bulk insert for CSV upload
    bulkInsert: (students, callback) => {
        if (!students || students.length === 0) {
            return callback(null, { affectedRows: 0 });
        }

        // Build the query
        const values = students.map(s => [
            s.student_id,
            s.first_name,
            s.last_name,
            s.email,
            s.year_of_study,
            s.department
        ]);

        const query = `
            INSERT INTO students (student_id, first_name, last_name, email, year_of_study, department)
            VALUES ?
            ON DUPLICATE KEY UPDATE 
                first_name = VALUES(first_name),
                last_name = VALUES(last_name),
                email = VALUES(email),
                year_of_study = VALUES(year_of_study),
                department = VALUES(department)
        `;

        db.query(query, [values], (err, result) => {
            if (err) return callback(err, null);
            callback(null, result);
        });
    }
};

module.exports = Student;