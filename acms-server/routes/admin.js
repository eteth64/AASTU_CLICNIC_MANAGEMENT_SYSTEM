const express = require('express');
const {
    getAllUsers,
    createUser,
    updateUserStatus,
    updateUserRole,
    getAllStudents,
    getAnalytics
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

const router = express.Router();

router.use(protect, checkRole('admin'));

router.get('/users', getAllUsers);
router.post('/users', createUser);
router.patch('/users/:id/status', updateUserStatus);
router.patch('/users/:id/role', updateUserRole);
router.get('/students', getAllStudents);
router.get('/analytics', getAnalytics)

module.exports = router;