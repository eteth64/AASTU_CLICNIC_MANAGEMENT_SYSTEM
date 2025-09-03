const Inventory = require('../models/Inventory');
const InventoryTransaction = require('../models/InventoryTransaction');

const getAllInventory = (req, res) => {
    Inventory.findAll((error, results) => {
        if (error) {
            return res.status(500).json({ message: 'Server error' });
        }
        res.json(results);
    });
};

const getLowStockInventory = (req, res) => {
    Inventory.findLowStock((error, results) => {
        if (error) {
            return res.status(500).json({ message: 'Server error' });
        }
        res.json(results);
    });
};

const getInventoryItem = (req, res) => {
    const { id } = req.params;

    Inventory.findById(id, (error, results) => {
        if (error) {
            return res.status(500).json({ message: 'Server error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }

        InventoryTransaction.findByInventoryId(id, (err, transactionResults) => {
            if (err) {
                return res.status(500).json({ message: 'Server error' });
            }

            res.json({
                item: results[0],
                transactions: transactionResults
            });
        });
    });
};

const createInventoryItem = (req, res) => {
    const { medicine_name, category, quantity, min_stock, dispenser_role, expiry_date } = req.body;
    const user_id = req.user.user_id;

    if (!medicine_name || !category || !quantity || !min_stock || !dispenser_role) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    Inventory.create({ medicine_name, category, quantity, min_stock, dispenser_role, expiry_date }, (error, results) => {
        if (error) {
            return res.status(500).json({ message: 'Server error' });
        }

        // Create initial transaction record
        InventoryTransaction.create({
            inventory_id: results.insertId,
            user_id,
            transaction_type: 'in',
            quantity_change: quantity,
            reason: 'Initial stock'
        }, (err) => {
            if (err) {
                return res.status(500).json({ message: 'Server error creating transaction record' });
            }

            res.status(201).json({ message: 'Inventory item created successfully', inventoryId: results.insertId });
        });
    });
};

const updateInventoryItem = (req, res) => {
    const { id } = req.params;
    const { medicine_name, category, quantity, min_stock, dispenser_role, expiry_date } = req.body;
    const user_id = req.user.user_id;


    if (!medicine_name || !category || !quantity || !min_stock || !dispenser_role) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // First get the current quantity to calculate the difference
    Inventory.findById(id, (error, results) => {
        if (error) {
            return res.status(500).json({ message: 'Server error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }

        const currentItem = results[0];
        const quantityDifference = quantity - currentItem.quantity;

        Inventory.update(id, { medicine_name, category, quantity, min_stock, dispenser_role, expiry_date }, (error, results) => {
            if (error) {
                return res.status(500).json({ message: 'Server error' });
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'Inventory item not found' });
            }

            // Create transaction record if quantity changed
            if (quantityDifference !== 0) {
                const transactionType = quantityDifference > 0 ? 'in' : 'out';
                InventoryTransaction.create({
                    inventory_id: id,
                    user_id,
                    transaction_type: transactionType,
                    quantity_change: Math.abs(quantityDifference),
                    reason: 'Manual adjustment'
                }, (err) => {
                    if (err) {
                        return res.status(500).json({ message: 'Server error creating transaction record' });
                    }
                });
            }

            res.json({ message: 'Inventory item updated successfully' });
        });
    });
};

const deleteInventoryItem = (req, res) => {
    const { id } = req.params;


    Inventory.delete(id, (error, results) => {
        if (error) {

            return res.status(500).json({ message: 'Server error' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }

        res.json({ message: 'Inventory item deleted successfully' });
    });
};

const getAllTransactions = (req, res) => {
    InventoryTransaction.findAll((error, results) => {
        if (error) {
            return res.status(500).json({ message: 'Server error' });
        }
        res.json(results);
    });
};

module.exports = {
    getAllInventory,
    getLowStockInventory,
    getInventoryItem,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    getAllTransactions
};