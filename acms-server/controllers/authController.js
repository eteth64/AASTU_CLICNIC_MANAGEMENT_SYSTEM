const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

const login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password' });
    }

    User.findByEmail(email, (error, results) => {
        if (error) {
            return res.status(500).json({ message: 'Server error' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = results[0];

        if (!user.is_active) {
            return res.status(401).json({ message: 'Account is deactivated' });
        }

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                return res.status(500).json({ message: 'Server error' });
            }

            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const token = generateToken(user.user_id);

            res.json({
                token,
                user: {
                    id: user.user_id,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    email: user.email,
                    role: user.role
                }
            });
        });
    });
};

const getMe = (req, res) => {
    res.json({
        id: req.user.user_id,
        firstName: req.user.first_name,
        lastName: req.user.last_name,
        email: req.user.email,
        role: req.user.role
    });
};

module.exports = { login, getMe };