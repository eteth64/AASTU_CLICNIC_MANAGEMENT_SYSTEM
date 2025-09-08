const express = require('express');
const multer = require('multer');
const {
    getAllUsers,
    createUser,
    updateUserStatus,
    updateUserRole,
    getAllStudents,
    getAnalytics,
    uploadStudentsCsv
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

const router = express.Router();

// Middleware for CSV upload
const uploadMiddleware = multer({ storage: multer.memoryStorage() });

// Protect all admin routes
router.use(protect, checkRole('admin'));

// User routes
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.patch('/users/:id/status', updateUserStatus);
router.patch('/users/:id/role', updateUserRole);

// Student routes
router.get('/students', getAllStudents);
router.get('/analytics', getAnalytics);

// CSV upload route
router.post(
    "/students/upload",
    uploadMiddleware.single("file"),
    uploadStudentsCsv
);

module.exports = router;