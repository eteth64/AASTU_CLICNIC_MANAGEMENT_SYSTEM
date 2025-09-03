const LabOrder = require('../models/LabOrder');
const LabResult = require('../models/LabResult');

const getPendingOrders = (req, res) => {
    LabOrder.findAllPending((error, results) => {
        if (error) {
            return res.status(500).json({ message: 'Server error' });
        }
        res.json(results);
    });
};

const getOrderDetails = (req, res) => {
    const { orderId } = req.params;

    LabOrder.findById(orderId, (error, orderResults) => {
        if (error) {
            return res.status(500).json({ message: 'Server error' });
        }

        if (orderResults.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        LabResult.findByOrderId(orderId, (err, resultResults) => {
            if (err) {
                return res.status(500).json({ message: 'Server error' });
            }

            res.json({
                order: orderResults[0],
                results: resultResults
            });
        });
    });
};

const submitLabResult = (req, res) => {
    const { order_id, lab_result, technical_notes } = req.body;
    const technician_id = req.user.user_id;

    // Validate required fields
    if (!order_id || !lab_result) {
        return res.status(400).json({ message: 'Please provide order ID and lab result' });
    }

    // Prepare lab result data, handling optional technical_notes
    const resultData = {
        order_id,
        technician_id,
        lab_result,
        technical_notes: technical_notes !== undefined ? technical_notes : null // Convert undefined to null
    };

    LabResult.create(resultData, (error, results) => {
        if (error) {
            console.error('Error creating lab result:', error);
            return res.status(500).json({ message: 'Server error' });
        }

        // Update lab order status to 'completed'
        LabOrder.updateStatus(order_id, 'completed', (err) => {
            if (err) {
                console.error('Error updating lab order status:', err);
                return res.status(500).json({ message: 'Server error' });
            }

            // Update completed_at timestamp for the lab result
            LabResult.updateCompletedAt(results.insertId, (updateErr) => {
                if (updateErr) {
                    console.error('Error updating completed_at:', updateErr);
                    return res.status(500).json({ message: 'Server error' });
                }

                res.status(201).json({
                    message: 'Lab result submitted successfully',
                    resultId: results.insertId
                });
            });
        });
    });
};

module.exports = {
    getPendingOrders,
    getOrderDetails,
    submitLabResult
};