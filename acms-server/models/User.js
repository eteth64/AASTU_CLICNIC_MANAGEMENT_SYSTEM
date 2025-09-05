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
    findByResetToken: (token, callback) => {
        const query = 'SELECT * FROM users WHERE reset_token = ? AND reset_token_expire > NOW()';
        db.execute(query, [token], callback);
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
    },

    // ✅ NEW: Update user password
    updatePassword: (userId, hashedPassword, callback) => {
        const query = 'UPDATE users SET password = ?, reset_token = NULL, reset_token_expire = NULL WHERE user_id = ?';
        db.execute(query, [hashedPassword, userId], callback);
    },

    // ✅ NEW: Save reset token + expiry
    saveResetToken: (id, token, expire, callback) => {
        const query = 'UPDATE users SET reset_token = ?, reset_token_expire = ? WHERE user_id = ?';
        db.execute(query, [token, expire, id], callback);
    },

    // ✅ NEW: Find user by reset token
    findByResetToken: (token, callback) => {
        const query = 'SELECT * FROM users WHERE reset_token = ?';
        db.execute(query, [token], callback);
    }
};

module.exports = User;