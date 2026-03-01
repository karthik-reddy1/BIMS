const mongoose = require('mongoose');

const ReturnableProductSchema = new mongoose.Schema({
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    emptiesOwed: { type: Number, default: 0, min: 0 },
    lastUpdated: { type: Date, default: Date.now }
}, { _id: false });

const CompanySchema = new mongoose.Schema({
    companyId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    companyName: {
        type: String,
        required: true,
        trim: true
    },
    contactPerson: { type: String, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    paymentTerms: { type: Number, default: 7, min: 0 }, // days

    // Returnable tracking per product
    returnableProducts: [ReturnableProductSchema],

    // Total outstanding amount owed to company
    outstandingAmount: { type: Number, default: 0, min: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Company', CompanySchema);
