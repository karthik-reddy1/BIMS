const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  // Basic Info
  productId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  brand: {
    type: String,
    required: true,
    trim: true
  },
  productName: {
    type: String,
    required: true,
    trim: true
  },
  size: {
    type: String,
    required: true,
    trim: true
  },
  packType: {
    type: String,
    required: true,
    enum: ['RGB', 'PET', 'CAN', 'TTP', 'MTP'],
    uppercase: true
  },
  isReturnable: {
    type: Boolean,
    default: false
  },

  // Pricing
  mrp: {
    type: Number,
    required: true,
    min: 0
  },
  bottlesPerCase: {
    type: Number,
    required: true,
    min: 1
  },
  casePrice: {
    type: Number,
    required: true,
    min: 0
  },
  perBottlePrice: {
    type: Number,
    default: 0
  },

  // Stock Tracking
  filledStock: {
    cases: {
      type: Number,
      default: 0,
      min: 0
    },
    looseBottles: {
      type: Number,
      default: 0,
      min: 0
    },
    totalBottles: {
      type: Number,
      default: 0,
      min: 0
    }
  },

  // Empty Stock (RGB ONLY)
  emptyStock: {
    good: {
      type: Number,
      default: 0,
      min: 0
    },
    broken: {
      type: Number,
      default: 0,
      min: 0
    },
    total: {
      type: Number,
      default: 0,
      min: 0
    }
  },

  // Returnable Accounts (RGB ONLY)
  returnableAccounts: {
    companyOwed: {
      type: Number,
      default: 0,
      min: 0
    },
    shopsOwed: {
      type: Number,
      default: 0,
      min: 0
    }
  }
}, {
  timestamps: true
});

// Pre-save middleware to auto-calculate fields
ProductSchema.pre('save', async function() {
  // Auto-set isReturnable based on packType
  this.isReturnable = this.packType === 'RGB';

  // Calculate per bottle price
  this.perBottlePrice = this.casePrice / this.bottlesPerCase;

  // Calculate total bottles
  this.filledStock.totalBottles = 
    (this.filledStock.cases * this.bottlesPerCase) + this.filledStock.looseBottles;

  // Calculate empty stock total
  this.emptyStock.total = this.emptyStock.good + this.emptyStock.broken;

  // If not returnable, reset returnable fields to 0
  if (!this.isReturnable) {
    this.emptyStock.good = 0;
    this.emptyStock.broken = 0;
    this.emptyStock.total = 0;
    this.returnableAccounts.companyOwed = 0;
    this.returnableAccounts.shopsOwed = 0;
  }
});

// Virtual for shortage calculation
ProductSchema.virtual('shortage').get(function() {
  if (!this.isReturnable) return 0;
  return this.returnableAccounts.companyOwed - 
         (this.emptyStock.good + this.returnableAccounts.shopsOwed);
});

// Ensure virtuals are included in JSON
ProductSchema.set('toJSON', { virtuals: true });
ProductSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', ProductSchema);