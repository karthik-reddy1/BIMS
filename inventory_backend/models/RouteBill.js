const mongoose = require('mongoose');

const StockLoadedSchema = new mongoose.Schema({
    productId: { type: String, required: true },
    productName: String,
    cases: { type: Number, default: 0 },
    looseBottles: { type: Number, default: 0 },
    totalBottles: { type: Number, default: 0 }
}, { _id: false });

const EmptiesItemSchema = new mongoose.Schema({
    productId: { type: String, required: true },
    productName: String,
    goodBottles: { type: Number, default: 0 },
    brokenBottles: { type: Number, default: 0 },
    moneyCollected: { type: Number, default: 0 }  // auto: broken × 3
}, { _id: false });

const ShopEmptiesSchema = new mongoose.Schema({
    shopId: { type: String, required: true },
    shopName: String,
    items: [EmptiesItemSchema]
}, { _id: false });

const RouteBillSchema = new mongoose.Schema({
    routeBillId: { type: String, unique: true },      // e.g. RB-001
    routeId: { type: String, required: true },
    routeName: { type: String, required: true },       // denormalized
    routeDate: { type: Date, default: Date.now },
    driverName: { type: String },
    vehicleNumber: { type: String },

    shopBillIds: [{ type: String }],                   // references to ShopBill

    // Summary (auto-calculated)
    totalShops: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },

    // Stock loaded on vehicle
    stockLoaded: [StockLoadedSchema],

    // Cash settlement (manually entered)
    cashReceived: { type: Number, default: 0 },
    cashShortage: { type: Number, default: 0 },        // auto: totalAmount - cashReceived

    // Empties collected shop-wise (filled when completing route bill)
    emptiesCollected: [ShopEmptiesSchema],
    totalMoneyCollectedForBroken: { type: Number, default: 0 },

    // Single field for expenses
    routeExpenses: { type: Number, default: 0 },
    netForRoute: { type: Number, default: 0 },          // auto: totalAmount - routeExpenses

    status: {
        type: String,
        enum: ['Draft', 'Finalized', 'Completed'],
        default: 'Draft'
    },

    finalizedAt: { type: Date },
    completedAt: { type: Date }
}, { timestamps: true });

// Auto-calculate before save
RouteBillSchema.pre('save', function () {
    this.cashShortage = Math.max(0, this.totalAmount - this.cashReceived);
    this.netForRoute = this.totalAmount - this.routeExpenses;

    // Calculate total money collected for broken bottles
    let totalMoney = 0;
    if (this.emptiesCollected) {
        this.emptiesCollected.forEach(shop => {
            shop.items.forEach(item => {
                item.moneyCollected = item.brokenBottles * 3;
                totalMoney += item.moneyCollected;
            });
        });
    }
    this.totalMoneyCollectedForBroken = totalMoney;

    // Calculate stock loaded totals
    if (this.stockLoaded) {
        this.stockLoaded.forEach(s => {
            // totalBottles is set externally based on product's bottlesPerCase
        });
    }
});

module.exports = mongoose.model('RouteBill', RouteBillSchema);
