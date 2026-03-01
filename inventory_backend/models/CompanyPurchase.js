const mongoose = require('mongoose');

const PurchaseItemSchema = new mongoose.Schema({
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    size: String,
    packType: String,
    cases: { type: Number, required: true, min: 1 },
    bottlesPerCase: { type: Number, required: true },
    totalBottles: { type: Number, default: 0 },   // auto: cases × bottlesPerCase
    casePrice: { type: Number, required: true },
    itemTotal: { type: Number, default: 0 },       // auto: cases × casePrice
    isReturnable: { type: Boolean, default: false },
    emptiesOwedToCompany: { type: Number, default: 0 }  // = totalBottles for RGB
}, { _id: false });

const EmptiesReturnedSchema = new mongoose.Schema({
    productId: { type: String, required: true },
    productName: String,
    goodBottles: { type: Number, default: 0, min: 0 },
    brokenBottles: { type: Number, default: 0, min: 0 },
    totalReturned: { type: Number, default: 0 }   // auto: good + broken
}, { _id: false });

const CompanyPurchaseSchema = new mongoose.Schema({
    purchaseId: { type: String, unique: true },     // auto-generated e.g. PUR-001
    companyId: { type: String, required: true },
    companyName: { type: String, required: true },  // denormalized
    purchaseDate: { type: Date, default: Date.now },

    items: [PurchaseItemSchema],
    emptiesReturned: [EmptiesReturnedSchema],

    // Bill Calculation (auto)
    productTotal: { type: Number, default: 0 },
    transportBill: { type: Number, default: 0 },
    brokenBottlePenalty: { type: Number, default: 0 },  // brokenBottles × 3
    grandTotal: { type: Number, default: 0 },

    // Payment
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Partial', 'Paid'],
        default: 'Pending'
    },
    paymentDueDate: { type: Date },
    amountPaid: { type: Number, default: 0 },
    amountDue: { type: Number, default: 0 }
}, { timestamps: true });

// Auto-calculate before save
CompanyPurchaseSchema.pre('save', function () {
    const BROKEN_PENALTY_PER_BOTTLE = 3;

    // Calculate item totals
    let productTotal = 0;
    this.items.forEach(item => {
        item.totalBottles = item.cases * item.bottlesPerCase;
        item.itemTotal = item.cases * item.casePrice;
        item.emptiesOwedToCompany = item.isReturnable ? item.totalBottles : 0;
        productTotal += item.itemTotal;
    });

    // Calculate empties returned totals + broken penalty
    let brokenTotal = 0;
    this.emptiesReturned.forEach(e => {
        e.totalReturned = e.goodBottles + e.brokenBottles;
        brokenTotal += e.brokenBottles;
    });

    this.productTotal = productTotal;
    this.brokenBottlePenalty = brokenTotal * BROKEN_PENALTY_PER_BOTTLE;
    this.grandTotal = this.productTotal + this.transportBill + this.brokenBottlePenalty;
    this.amountDue = this.grandTotal - this.amountPaid;
});

module.exports = mongoose.model('CompanyPurchase', CompanyPurchaseSchema);
