const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

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
// Add after login and getMe
const changePassword = async(req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Please provide old and new passwords' });
    }

    const user = await User.findById(req.user.user_id);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
        return res.status(401).json({ message: 'Old password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password changed successfully' });
};



// Configure Nodemailer transport
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use your email service
    auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS // Your email password or app-specific password
    }
});

const forgotPassword = async(req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Please provide an email' });
    }

    User.findByEmail(email, (err, results) => {
        if (err) {
            console.error('Error:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        const user = results[0] || null;
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate a 6-digit reset token
        const resetToken = crypto.randomInt(100000, 999999).toString();

        // Set token expiration (1 hour from now)
        const expire = new Date(Date.now() + 3600000);

        // Save reset token to database
        User.saveResetToken(user.user_id, resetToken, expire, (err, result) => {
            if (err) {
                console.error('Error saving reset token:', err);
                return res.status(500).json({ message: 'Error saving reset token' });
            }

            // Email options
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Password Reset Token',
                text: `Your password reset token is: ${resetToken}\n\nPlease use this token to reset your password. It will expire in 1 hour.`
            };

            // Send email
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending email:', error);
                    return res.status(500).json({ message: 'Error sending reset token' });
                }
                res.json({ message: 'Password reset token sent to your email' });
            });
        });
    });
};



const resetPassword = async(req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ message: 'Please provide token and new password' });
    }

    try {
        // Find user by reset token
        const user = await new Promise((resolve, reject) => {
            User.findByResetToken(token, (err, results) => {
                if (err) {
                    return reject(err);
                }
                resolve(results[0] || null);
            });
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Hash the new password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update password and clear reset token
        await new Promise((resolve, reject) => {
            User.updatePassword(user.user_id, hashedPassword, (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
        });

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Error in resetPassword:', error);
        res.status(500).json({ message: 'Error resetting password' });
    }
};

module.exports = { login, getMe, changePassword, forgotPassword, resetPassword };