const mongoose = require('mongoose');

const BillItemSchema = new mongoose.Schema({
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    size: String,
    packType: String,
    quantity: { type: Number, required: true, min: 1 },  // in bottles
    mrp: { type: Number, required: true },
    itemTotal: { type: Number, default: 0 },              // auto: quantity × mrp
    isReturnable: { type: Boolean, default: false },
    returnablesOwed: { type: Number, default: 0 },         // = quantity for RGB
    bottlesPerCase: { type: Number, default: 1 }
}, { _id: false });

const ShopBillSchema = new mongoose.Schema({
    billId: { type: String, unique: true },               // e.g. BILL-001
    shopId: { type: String, required: true },
    shopName: { type: String, required: true },           // denormalized
    routeId: { type: String, default: null },
    routeName: { type: String, default: null },
    billDate: { type: Date, default: Date.now },

    items: [BillItemSchema],

    // Totals (auto)
    itemsTotal: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },

    // Payment
    paymentReceived: { type: Number, default: 0 },
    paymentMode: {
        type: String,
        enum: ['Cash', 'UPI', 'Credit'],
        default: 'Cash'
    }
}, { timestamps: true });

// Auto-calculate before save
ShopBillSchema.pre('save', function () {
    let total = 0;
    this.items.forEach(item => {
        item.itemTotal = item.quantity * item.mrp;
        item.returnablesOwed = item.isReturnable ? item.quantity : 0;
        total += item.itemTotal;
    });
    this.itemsTotal = total;
    this.grandTotal = total;
});

module.exports = mongoose.model('ShopBill', ShopBillSchema);
