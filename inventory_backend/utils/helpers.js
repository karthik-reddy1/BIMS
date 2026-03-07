const Counter = require('../models/Counter');

/**
 * Generate a sequential ID like PUR-001, BILL-023, etc.
 * @param {Model} Model - the mongoose model to count documents from
 * @param {string} prefix - e.g. 'PUR', 'BILL', 'RET', 'RB', 'PAY'
 * @param {string} field  - the ID field name e.g. 'purchaseId', 'billId'
 */
const generateId = async (Model, prefix, field) => {
    // 1. Try to atomic increment the counter
    let counter = await Counter.findByIdAndUpdate(
        prefix,
        { $inc: { seq: 1 } },
        { new: true } // Don't upsert yet, we need to check if it existed
    );

    // 2. If counter didn't exist, we must initialize it based on existing documents
    if (!counter) {
        // Fallback to counting existing documents (slow but only happens once per prefix)
        const count = await Model.countDocuments();
        counter = await Counter.create({
            _id: prefix,
            seq: count + 1
        });
    }

    const num = String(counter.seq).padStart(3, '0');
    return `${prefix}-${num}`;
};

/**
 * Update a product's returnable balance in a shop or company document.
 * Adds the entry if not present, updates emptiesOwed if it exists.
 * @param {Array} returnableProducts - the array on the parent doc
 * @param {string} productId
 * @param {string} productName
 * @param {number} delta - positive to increase, negative to decrease
 */
const updateReturnableBalance = (returnableProducts, productId, productName, delta) => {
    const existing = returnableProducts.find(r => r.productId === productId);
    if (existing) {
        existing.emptiesOwed = Math.max(0, existing.emptiesOwed + delta);
        existing.lastUpdated = new Date();
    } else if (delta > 0) {
        returnableProducts.push({
            productId,
            productName,
            emptiesOwed: delta,
            lastUpdated: new Date()
        });
    }
};

/**
 * Standard success/error response helpers
 */
const sendSuccess = (res, data, message = 'Success', status = 200) => {
    return res.status(status).json({
        success: true,
        message,
        count: Array.isArray(data) ? data.length : undefined,
        data
    });
};

const sendError = (res, message = 'Server error', status = 500) => {
    return res.status(status).json({ success: false, message });
};

module.exports = { generateId, updateReturnableBalance, sendSuccess, sendError };
