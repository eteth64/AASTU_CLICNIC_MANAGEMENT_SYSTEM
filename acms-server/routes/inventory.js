const express = require('express');
const {
    getAllInventory,
    getLowStockInventory,
    getInventoryItem,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    getAllTransactions
} = require('../controllers/inventoryController');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

const router = express.Router();

router.use(protect, checkRole('admin'));

router.get('/', getAllInventory);
router.get('/low-stock', getLowStockInventory);
router.get('/transactions', getAllTransactions);
router.get('/:id', getInventoryItem);
router.post('/', createInventoryItem);
router.put('/:id', updateInventoryItem);
router.delete('/:id', deleteInventoryItem);

module.exports = router;