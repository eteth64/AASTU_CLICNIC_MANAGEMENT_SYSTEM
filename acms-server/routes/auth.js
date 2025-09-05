const express = require('express');
const {
    login,
    getMe,
    changePassword,
    forgotPassword,
    resetPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// 🔐 Login
router.post('/login', login);

// 👤 Get current user (requires token)
router.get('/me', protect, getMe);

// 🔑 Change password (requires token)
router.put('/change-password', protect, changePassword);

// 📧 Forgot password (send reset link to email)
router.post('/forgot-password', forgotPassword);

// ♻️ Reset password (with token from email link)
router.post('/reset-password', resetPassword);

module.exports = router;