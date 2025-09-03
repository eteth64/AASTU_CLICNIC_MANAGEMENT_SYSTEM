const db = require('../config/database');

const InventoryTransaction = {
    create: (transactionData, callback) => {
        const { inventory_id, user_id, transaction_type, quantity_change, reason } = transactionData;
        const query = 'INSERT INTO inventory_transactions (inventory_id, user_id, transaction_type, quantity_change, reason) VALUES (?, ?, ?, ?, ?)';
        db.execute(query, [inventory_id, user_id, transaction_type, quantity_change, reason], callback);
    },

    findByInventoryId: (inventoryId, callback) => {
        const query = `
      SELECT it.*, u.first_name, u.last_name, i.medicine_name
      FROM inventory_transactions it 
      JOIN users u ON it.user_id = u.user_id 
      JOIN inventory i ON it.inventory_id = i.inventory_id
      WHERE it.inventory_id = ?
      ORDER BY it.created_at DESC
    `;
        db.execute(query, [inventoryId], callback);
    },

    findAll: (callback) => {
        const query = `
      SELECT it.*, u.first_name, u.last_name, i.medicine_name
      FROM inventory_transactions it 
      JOIN users u ON it.user_id = u.user_id 
      JOIN inventory i ON it.inventory_id = i.inventory_id
      ORDER BY it.created_at DESC
    `;
        db.execute(query, callback);
    }
};

module.exports = InventoryTransaction;