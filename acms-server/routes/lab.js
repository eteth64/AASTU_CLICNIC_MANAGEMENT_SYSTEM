const express = require('express');
const {
    getPendingOrders,
    getOrderDetails,
    submitLabResult
} = require('../controllers/labController');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

const router = express.Router();

router.use(protect, checkRole('lab_technician'));

router.get('/orders', getPendingOrders);
router.get('/orders/:orderId', getOrderDetails);
router.post('/results', submitLabResult);

module.exports = router;