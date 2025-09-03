const express = require('express');
const {
    getPendingPrescriptions,
    dispenseMedication
} = require('../controllers/nurseController');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

const router = express.Router();

router.use(protect, checkRole('nurse'));

router.get('/prescriptions', getPendingPrescriptions);
router.post('/dispense', dispenseMedication);

module.exports = router;