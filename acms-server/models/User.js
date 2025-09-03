const db = require('../config/database');

const User = {
    create: (userData, callback) => {
        const { first_name, last_name, email, password, role } = userData;
        const query = 'INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)';
        db.execute(query, [first_name, last_name, email, password, role], callback);
    },

    findByEmail: (email, callback) => {
        const query = 'SELECT * FROM users WHERE email = ?';
        db.execute(query, [email], callback);
    },

    findById: (id, callback) => {
        const query = 'SELECT * FROM users WHERE user_id = ?';
        db.execute(query, [id], callback);
    },

    findAll: (callback) => {
        const query = 'SELECT user_id, first_name, last_name, email, role, is_active FROM users';
        db.execute(query, callback);
    },

    updateStatus: (id, status, callback) => {
        const query = 'UPDATE users SET is_active = ? WHERE user_id = ?';
        db.execute(query, [status, id], callback);
    },

    updateRole: (id, role, callback) => {
        const query = 'UPDATE users SET role = ? WHERE user_id = ?';
        db.execute(query, [role, id], callback);
    }
};

module.exports = User;