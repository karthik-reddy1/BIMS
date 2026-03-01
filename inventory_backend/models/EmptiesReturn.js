const mongoose = require('mongoose');

const ReturnItemSchema = new mongoose.Schema({
    productId: { type: String, required: true },
    productName: String,
    expectedBottles: { type: Number, default: 0 },   // from shop's running balance
    goodBottles: { type: Number, default: 0, min: 0 },
    brokenBottles: { type: Number, default: 0, min: 0 },
    totalReturned: { type: Number, default: 0 },      // auto: good + broken
    missingBottles: { type: Number, default: 0 },     // auto: expected - totalReturned
    moneyCollected: { type: Number, default: 0 }      // auto: brokenBottles × 3
}, { _id: false });

const EmptiesReturnSchema = new mongoose.Schema({
    returnId: { type: String, unique: true },          // e.g. RET-001
    shopId: { type: String, required: true },
    shopName: { type: String, required: true },        // denormalized
    routeId: { type: String, default: null },
    returnDate: { type: Date, default: Date.now },
    routeBillId: { type: String, default: null },      // if part of route settlement

    items: [ReturnItemSchema],

    totalMoneyCollected: { type: Number, default: 0 } // sum of moneyCollected
}, { timestamps: true });

// Auto-calculate before save
EmptiesReturnSchema.pre('save', function () {
    const BROKEN_RATE = 3;
    let totalMoney = 0;
    this.items.forEach(item => {
        item.totalReturned = item.goodBottles + item.brokenBottles;
        item.missingBottles = Math.max(0, item.expectedBottles - item.totalReturned);
        item.moneyCollected = item.brokenBottles * BROKEN_RATE;
        totalMoney += item.moneyCollected;
    });
    this.totalMoneyCollected = totalMoney;
});

module.exports = mongoose.model('EmptiesReturn', EmptiesReturnSchema);
