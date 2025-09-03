const db = require('../config/database');

const Inventory = {
    create: (inventoryData, callback) => {
        const { medicine_name, category, quantity, min_stock, dispenser_role, expiry_date } = inventoryData;
        const query = 'INSERT INTO inventory (medicine_name, category, quantity, min_stock, dispenser_role, expiry_date) VALUES (?, ?, ?, ?, ?, ?)';
        db.execute(query, [medicine_name, category, quantity, min_stock, dispenser_role, expiry_date], callback);
    },

    findAll: (callback) => {
        const query = 'SELECT * FROM inventory ORDER BY medicine_name';
        db.execute(query, callback);
    },

    findById: (inventoryId, callback) => {
        const query = 'SELECT * FROM inventory WHERE inventory_id = ?';
        db.execute(query, [inventoryId], callback);
    },

    update: (inventoryId, inventoryData, callback) => {
        const { medicine_name, category, quantity, min_stock, dispenser_role, expiry_date } = inventoryData;
        const query = 'UPDATE inventory SET medicine_name = ?, category = ?, quantity = ?, min_stock = ?, dispenser_role = ?, expiry_date = ? WHERE inventory_id = ?';
        db.execute(query, [medicine_name, category, quantity, min_stock, dispenser_role, expiry_date, inventoryId], callback);
    },

    delete: (inventoryId, callback) => {
        const query = 'DELETE FROM inventory WHERE inventory_id = ?';
        db.execute(query, [inventoryId], callback);
    },

    findLowStock: (callback) => {
        const query = 'SELECT * FROM inventory WHERE quantity <= min_stock ORDER BY quantity ASC';
        db.execute(query, callback);
    }
};

module.exports = Inventory;