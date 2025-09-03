const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Student = require('../models/Student');
const db = require('../config/database');

const getAllUsers = (req, res) => {
    User.findAll((error, results) => {
        if (error) {
            return res.status(500).json({ message: 'Server error' });
        }
        res.json(results);
    });
};

const createUser = (req, res) => {
    const { first_name, last_name, email, password, role } = req.body;

    if (!first_name || !last_name || !email || !password || !role) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    User.findByEmail(email, (error, results) => {
        if (error) {
            return res.status(500).json({ message: 'Server error' });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                return res.status(500).json({ message: 'Server error' });
            }

            User.create({ first_name, last_name, email, password: hashedPassword, role }, (error, results) => {
                if (error) {
                    return res.status(500).json({ message: 'Server error' });
                }

                res.status(201).json({ message: 'User created successfully' });
            });
        });
    });
};

const updateUserStatus = (req, res) => {
    const { id } = req.params;
    const { is_active } = req.body;



    // Validate id
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Validate is_active
    if (typeof is_active !== 'boolean') {

        return res.status(400).json({ message: 'is_active must be a boolean' });
    }



    User.updateStatus(id, is_active, (error, results) => {
        if (error) {
            return res.status(500).json({ message: 'Server error' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User status updated successfully' });
    });
};

const updateUserRole = (req, res) => {
    const { id } = req.params;
    const { role } = req.body;



    User.updateRole(id, role, (error, results) => {
        if (error) {
            return res.status(500).json({ message: 'Server error' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User role updated successfully' });
    });
};

const getAllStudents = (req, res) => {
    Student.findAll((error, results) => {
        if (error) {
            return res.status(500).json({ message: 'Server error' });
        }
        res.json(results);
    });
};


const getAnalytics = (req, res) => {
    const query = `
    SELECT
        (SELECT COUNT(*) FROM users) AS total_users,
        (SELECT COUNT(*) FROM students) AS total_students,
        (SELECT COUNT(*) FROM users WHERE role = 'doctor') AS doctors,
        (SELECT COUNT(*) FROM users WHERE role = 'reception') AS receptions,
        (SELECT COUNT(*) FROM users WHERE role = 'nurse') AS nurses,
        (SELECT COUNT(*) FROM users WHERE role = 'lab_technician') AS lab_technicians,
        (SELECT COUNT(*) FROM users WHERE role = 'pharmacy') AS pharmacists
  `;

    db.execute(query, (error, results) => {
        if (error) {
            console.error('Error fetching analytics:', error);
            return res.status(500).json({ message: 'Server error' });
        }

        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.json({});
        }
    });
};



module.exports = {
    getAllUsers,
    createUser,
    updateUserStatus,
    updateUserRole,
    getAllStudents,
    getAnalytics
};