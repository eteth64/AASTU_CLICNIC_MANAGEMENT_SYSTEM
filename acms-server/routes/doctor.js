const express = require('express');
const {
    getPendingAndLabResultedRequests,
    getPatientHistory,
    createLabOrder,
    createPrescription,
    startConsultation,
    fetchLabResult,
    fetchInventory,
    fetchDoctorAnalytics
} = require('../controllers/doctorController');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

const router = express.Router();

router.use(protect, checkRole('doctor'));

// Get all pending and lab resulted submitted requests  
router.get('/requests', getPendingAndLabResultedRequests);

// get patient history by requestId
router.get('/requests/:requestId', getPatientHistory);

// Create a lab order for a patient
router.post('/lab-orders', createLabOrder);

// Create a prescription for a patient
router.post('/prescriptions', createPrescription);

// Start a consultation and add to patient history
router.post('/start-consultation', startConsultation);

// fetch lab result
router.get('/lab-results/:requestId', fetchLabResult);


// fetch inventory 

router.get('/inventory', fetchInventory);


router.get('/analytics', fetchDoctorAnalytics);
module.exports = router;