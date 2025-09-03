const express = require('express');
const {
    getPendingPrescriptions,
    dispenseMedication,
    getInventoryItem
} = require('../controllers/pharmacyController');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

const router = express.Router();

router.use(protect, checkRole('pharmacy'));

router.get('/prescriptions', getPendingPrescriptions);
router.get('/inventory/:id', getInventoryItem);
router.post('/dispense', dispenseMedication);

module.exports = router;