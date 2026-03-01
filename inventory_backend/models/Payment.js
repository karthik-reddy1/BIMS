const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    paymentId: { type: String, unique: true },          // e.g. PAY-001
    companyId: { type: String, required: true },
    companyName: { type: String, required: true },      // denormalized
    paymentDate: { type: Date, default: Date.now },

    purchaseIds: [{ type: String }],                    // references to CompanyPurchase

    amount: { type: Number, required: true, min: 0 },
    paymentMode: {
        type: String,
        enum: ['Cash', 'Bank Transfer', 'UPI', 'Cheque'],
        default: 'Cash'
    },
    referenceNumber: { type: String, trim: true },
    notes: { type: String, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);
