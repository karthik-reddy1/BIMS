const mongoose = require('mongoose');

const ReturnableProductSchema = new mongoose.Schema({
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    emptiesOwed: { type: Number, default: 0, min: 0 },
    lastUpdated: { type: Date, default: Date.now }
}, { _id: false });

const ShopSchema = new mongoose.Schema({
    shopId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    shopName: {
        type: String,
        required: true,
        trim: true
    },
    ownerName: { type: String, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },

    // Route assignment — null if walk-in
    routeId: { type: String, default: null },
    routeName: { type: String, default: null },

    // Returnable empties tracking per product
    returnableProducts: [ReturnableProductSchema],

    // Credit balance owed by shop
    outstandingAmount: { type: Number, default: 0, min: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Shop', ShopSchema);
