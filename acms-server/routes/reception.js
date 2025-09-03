const express = require('express');
const { searchStudent, createRequest, fetchAnalytics } = require('../controllers/receptionController');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

const router = express.Router();

router.use(protect, checkRole('reception'));

router.get('/students/:studentId', searchStudent);
router.post('/requests', createRequest);
router.get('/analytics', fetchAnalytics);

module.exports = router;