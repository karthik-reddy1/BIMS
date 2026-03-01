# 🗄️ COMPLETE DATABASE SCHEMA - Beverage Inventory System

## Overview
This document defines all MongoDB collections and their structure for the beverage inventory and billing system.

---

## 1️⃣ PRODUCTS COLLECTION

**Collection Name:** `products`

**Purpose:** Master catalog of all beverages (PET, RGB, CAN, TTP, MTP)

```javascript
{
  _id: ObjectId("..."),
  
  // Basic Info
  productId: "thumbsup-rgb-300ml",        // Unique identifier
  brand: "CSD Flavour",                   // Brand/Company name
  productName: "Thumbsup",                // Product name
  size: "300ml",                          // Size
  packType: "RGB",                        // RGB, PET, CAN, TTP, MTP
  isReturnable: true,                     // Auto: true if RGB, false otherwise
  
  // Pricing
  mrp: 20,                                // Maximum Retail Price
  bottlesPerCase: 24,                     // Bottles in one case
  casePrice: 300,                         // Price per case
  perBottlePrice: 12.5,                   // Auto-calculated: casePrice / bottlesPerCase
  
  // Stock Tracking
  filledStock: {
    cases: 10,                            // Full cases
    looseBottles: 15,                     // Individual bottles
    totalBottles: 255                     // Auto-calculated: (cases × bottlesPerCase) + looseBottles
  },
  
  // Empty Stock (RGB ONLY)
  emptyStock: {
    good: 80,                             // Usable empty bottles
    broken: 5,                            // Damaged bottles (discarded, money collected from shops)
    total: 85                             // Auto-calculated: good + broken
  },
  
  // Returnable Accounts (RGB ONLY)
  returnableAccounts: {
    companyOwed: 240,                     // Total empties you owe to company (running balance)
    shopsOwed: 120                        // Total empties all shops owe to you (running balance)
  },
  
  // Metadata
  createdAt: ISODate("2026-02-01T10:00:00Z"),
  updatedAt: ISODate("2026-02-09T15:30:00Z")
}
```

**Indexes:**
- `productId`: unique
- `packType`: non-unique
- `brand`: non-unique
- `isReturnable`: non-unique

**Business Rules:**
- `isReturnable` is auto-set to `true` if `packType === "RGB"`, else `false`
- `emptyStock` fields are only used if `isReturnable === true`
- `returnableAccounts` fields are only used if `isReturnable === true`
- All calculations happen via MongoDB pre-save hooks

---

## 2️⃣ COMPANIES COLLECTION

**Collection Name:** `companies`

**Purpose:** Supplier/dealer companies you buy stock from

```javascript
{
  _id: ObjectId("..."),
  
  // Basic Info
  companyId: "CSD-001",                   // Unique identifier
  companyName: "CSD Flavour (Coca-Cola)", // Company name
  contactPerson: "Manager Name",           // Optional
  phone: "9876543210",                    // Optional
  address: "Company Address",             // Optional
  paymentTerms: 7,                        // Payment due in X days (default: 7)
  
  // Returnable Tracking (per product)
  returnableProducts: [
    {
      productId: "thumbsup-rgb-300ml",
      productName: "Thumbsup 300ml RGB",  // For display
      emptiesOwed: 240,                   // Running balance (you owe company)
      lastUpdated: ISODate("2026-02-08T14:00:00Z")
    },
    {
      productId: "sprite-rgb-300ml",
      productName: "Sprite 300ml RGB",
      emptiesOwed: 120,
      lastUpdated: ISODate("2026-02-08T14:00:00Z")
    }
  ],
  
  // Payment Tracking
  outstandingAmount: 5000,                // Total money you owe to company
  
  // Metadata
  createdAt: ISODate("2026-01-01T10:00:00Z"),
  updatedAt: ISODate("2026-02-09T15:30:00Z")
}
```

**Indexes:**
- `companyId`: unique
- `companyName`: non-unique

**Business Rules:**
- `emptiesOwed` increases when you buy stock
- `emptiesOwed` decreases when you return empties or pay for broken bottles
- `outstandingAmount` increases with new purchases
- `outstandingAmount` decreases with payments

---

## 3️⃣ SHOPS COLLECTION

**Collection Name:** `shops`

**Purpose:** Customer shops you sell to

```javascript
{
  _id: ObjectId("..."),
  
  // Basic Info
  shopId: "SHOP-001",                     // Unique identifier
  shopName: "Sai Traders",                // Shop name
  ownerName: "Mr. Sai Kumar",             // Optional
  phone: "9123456789",                    // Optional
  address: "Shop Address, City",          // Optional
  
  // Route Assignment
  routeId: "ROUTE-A",                     // Can be null for "No Route"
  routeName: "Route A - City Center",     // For display
  
  // Returnable Tracking (per product)
  returnableProducts: [
    {
      productId: "thumbsup-rgb-300ml",
      productName: "Thumbsup 300ml RGB",  // For display
      emptiesOwed: 48,                    // Running balance (shop owes you)
      lastUpdated: ISODate("2026-02-08T16:00:00Z")
    },
    {
      productId: "sprite-rgb-300ml",
      productName: "Sprite 300ml RGB",
      emptiesOwed: 24,
      lastUpdated: ISODate("2026-02-08T16:00:00Z")
    }
  ],
  
  // Payment Tracking (if credit sales allowed)
  outstandingAmount: 0,                   // Money shop owes you
  
  // Metadata
  createdAt: ISODate("2026-01-15T10:00:00Z"),
  updatedAt: ISODate("2026-02-09T15:30:00Z")
}
```

**Indexes:**
- `shopId`: unique
- `shopName`: non-unique
- `routeId`: non-unique

**Business Rules:**
- `emptiesOwed` increases when shop buys from you
- `emptiesOwed` decreases when shop returns empties or pays for broken bottles
- `routeId` can be null (for "No Route" / walk-in customers)

---

## 4️⃣ ROUTES COLLECTION

**Collection Name:** `routes`

**Purpose:** Delivery routes organization

```javascript
{
  _id: ObjectId("..."),
  
  // Basic Info
  routeId: "ROUTE-A",                     // Unique identifier
  routeName: "Route A - City Center",     // Route name
  
  // Route Details
  shopIds: [                              // Array of shop IDs on this route
    "SHOP-001",
    "SHOP-002", 
    "SHOP-003"
  ],
  schedule: "Monday, Wednesday, Friday",  // Optional schedule
  
  // Vehicle/Driver Info (optional)
  vehicleNumber: "TN-01-AB-1234",
  driverName: "Ravi",
  driverPhone: "9988776655",
  
  // Metadata
  createdAt: ISODate("2026-01-01T10:00:00Z"),
  updatedAt: ISODate("2026-02-09T15:30:00Z")
}
```

**Indexes:**
- `routeId`: unique
- `routeName`: non-unique

**Business Rules:**
- Routes can have multiple shops
- Same route is covered every 3 days (not enforced by system)
- 10 routes total, 3-4 vehicles available

---

## 5️⃣ COMPANY PURCHASES COLLECTION

**Collection Name:** `company_purchases`

**Purpose:** Records of stock purchased from companies

```javascript
{
  _id: ObjectId("..."),
  
  // Purchase Info
  purchaseId: "PUR-001",                  // Unique identifier (auto-generated)
  companyId: "CSD-001",
  companyName: "CSD Flavour",             // Denormalized for display
  purchaseDate: ISODate("2026-02-01T10:00:00Z"),
  
  // Items Purchased
  items: [
    {
      productId: "thumbsup-rgb-300ml",
      productName: "Thumbsup",            // For display
      size: "300ml",
      packType: "RGB",
      cases: 10,
      bottlesPerCase: 24,
      totalBottles: 240,                  // Auto-calculated: cases × bottlesPerCase
      casePrice: 300,
      itemTotal: 3000,                    // Auto-calculated: cases × casePrice
      isReturnable: true,
      emptiesOwedToCompany: 240           // For RGB only, equals totalBottles
    },
    {
      productId: "sprite-pet-500ml",
      productName: "Sprite",
      size: "500ml",
      packType: "PET",
      cases: 5,
      bottlesPerCase: 24,
      totalBottles: 120,
      casePrice: 660,
      itemTotal: 3300,
      isReturnable: false,
      emptiesOwedToCompany: 0             // PET doesn't need returns
    }
  ],
  
  // Empties Returned in This Transaction
  emptiesReturned: [
    {
      productId: "thumbsup-rgb-300ml",
      productName: "Thumbsup 300ml RGB",
      goodBottles: 40,                    // Physically returned
      brokenBottles: 5,                   // Paid ₹3 each instead of returning
      totalReturned: 45                   // Auto-calculated: good + broken
    },
    {
      productId: "sprite-rgb-300ml",
      productName: "Sprite 300ml RGB",
      goodBottles: 22,
      brokenBottles: 0,
      totalReturned: 22
    }
  ],
  
  // Bill Calculation
  productTotal: 6300,                     // Auto-calculated: sum of item totals
  transportBill: 500,                     // Manually entered
  brokenBottlePenalty: 15,                // Auto-calculated: sum of (brokenBottles × ₹3)
  grandTotal: 6815,                       // Auto-calculated: productTotal + transportBill + brokenBottlePenalty
  
  // Payment Tracking
  paymentStatus: "Pending",               // Pending, Partial, Paid
  paymentDueDate: ISODate("2026-02-08T23:59:59Z"), // purchaseDate + paymentTerms
  amountPaid: 0,
  amountDue: 6815,                        // Auto-calculated: grandTotal - amountPaid
  
  // Metadata
  createdAt: ISODate("2026-02-01T10:30:00Z"),
  updatedAt: ISODate("2026-02-09T15:30:00Z")
}
```

**Indexes:**
- `purchaseId`: unique
- `companyId`: non-unique
- `purchaseDate`: non-unique
- `paymentStatus`: non-unique

**Business Rules:**
- Creating this document automatically:
  - Increases product `filledStock`
  - Decreases product `emptyStock` (empties returned)
  - Updates company `returnableProducts` balances
  - Updates product `returnableAccounts.companyOwed`
- All money calculations are auto-calculated via pre-save hooks
- Broken bottle penalty = ₹3 per bottle (constant)

---

## 6️⃣ SHOP BILLS COLLECTION

**Collection Name:** `shop_bills`

**Purpose:** Sales bills to shops

```javascript
{
  _id: ObjectId("..."),
  
  // Bill Info
  billId: "BILL-001",                     // Unique identifier (auto-generated)
  shopId: "SHOP-001",
  shopName: "Sai Traders",                // Denormalized for display
  routeId: "ROUTE-A",                     // Can be null for "No Route"
  routeName: "Route A - City Center",     // For display
  billDate: ISODate("2026-02-02T10:00:00Z"),
  
  // Items Sold
  items: [
    {
      productId: "thumbsup-rgb-300ml",
      productName: "Thumbsup",            // For display
      size: "300ml",
      packType: "RGB",
      quantity: 48,                       // In bottles
      mrp: 20,
      itemTotal: 960,                     // Auto-calculated: quantity × mrp
      isReturnable: true,
      returnablesOwed: 48                 // For RGB, equals quantity
    },
    {
      productId: "sprite-pet-500ml",
      productName: "Sprite",
      size: "500ml",
      packType: "PET",
      quantity: 24,
      mrp: 30,
      itemTotal: 720,
      isReturnable: false,
      returnablesOwed: 0
    }
  ],
  
  // Bill Calculation
  itemsTotal: 1680,                       // Auto-calculated: sum of item totals
  grandTotal: 1680,                       // Same as itemsTotal (no penalties in initial bill)
  
  // Payment
  paymentReceived: 1680,
  paymentMode: "Cash",                    // Cash, UPI, Credit
  
  // Metadata
  createdAt: ISODate("2026-02-02T10:30:00Z"),
  updatedAt: ISODate("2026-02-09T15:30:00Z")
}
```

**Indexes:**
- `billId`: unique
- `shopId`: non-unique
- `routeId`: non-unique
- `billDate`: non-unique

**Business Rules:**
- Creating this document automatically:
  - Decreases product `filledStock`
  - Updates shop `returnableProducts` balances (increases empties owed)
  - Updates product `returnableAccounts.shopsOwed`
- Initial bill does NOT include empties collection
- Empties are handled separately (see EMPTIES RETURNS collection)

---

## 7️⃣ EMPTIES RETURNS COLLECTION

**Collection Name:** `empties_returns`

**Purpose:** Track when shops return empty bottles (separate from billing)

```javascript
{
  _id: ObjectId("..."),
  
  // Return Info
  returnId: "RET-001",                    // Unique identifier (auto-generated)
  shopId: "SHOP-001",
  shopName: "Sai Traders",                // Denormalized for display
  routeId: "ROUTE-A",                     // Optional, can be null
  returnDate: ISODate("2026-02-02T16:00:00Z"),
  
  // Related to Route Bill (if part of route settlement)
  routeBillId: "RB-001",                  // Optional, if entered during route settlement
  
  // Empties Returned
  items: [
    {
      productId: "thumbsup-rgb-300ml",
      productName: "Thumbsup 300ml RGB",
      expectedBottles: 48,                // From shop's returnable balance
      goodBottles: 40,                    // Actually returned (good condition)
      brokenBottles: 5,                   // Returned broken (shop pays ₹3 each)
      totalReturned: 45,                  // Auto-calculated: good + broken
      missingBottles: 3,                  // Auto-calculated: expected - totalReturned
      moneyCollected: 15                  // Auto-calculated: brokenBottles × ₹3 (NOT called "penalty")
    },
    {
      productId: "sprite-rgb-300ml",
      productName: "Sprite 300ml RGB",
      expectedBottles: 24,
      goodBottles: 22,
      brokenBottles: 0,
      totalReturned: 22,
      missingBottles: 2,
      moneyCollected: 0
    }
  ],
  
  // Summary
  totalMoneyCollected: 15,                // Sum of all moneyCollected (for company payment later)
  
  // Metadata
  createdAt: ISODate("2026-02-02T16:30:00Z"),
  updatedAt: ISODate("2026-02-09T15:30:00Z")
}
```

**Indexes:**
- `returnId`: unique
- `shopId`: non-unique
- `returnDate`: non-unique
- `routeBillId`: non-unique

**Business Rules:**
- Creating this document automatically:
  - Increases product `emptyStock.good` (good bottles added to inventory)
  - Does NOT add broken bottles to inventory (discarded, money collected)
  - Updates shop `returnableProducts` balances (decreases empties owed)
  - Updates product `returnableAccounts.shopsOwed`
- Money collected for broken bottles is tracked to know what to pay company later
- NOT called "penalty" - called "money collected for broken bottles"

---

## 8️⃣ ROUTE BILLS COLLECTION

**Collection Name:** `route_bills`

**Purpose:** Daily route summaries (groups shop bills)

```javascript
{
  _id: ObjectId("..."),
  
  // Route Bill Info
  routeBillId: "RB-001",                  // Unique identifier (auto-generated)
  routeId: "ROUTE-A",
  routeName: "Route A - City Center",     // Denormalized for display
  routeDate: ISODate("2026-02-05T00:00:00Z"),
  driverName: "Ravi",                     // Optional
  vehicleNumber: "TN-01-AB-1234",         // Optional
  
  // Shop Bills on This Route
  shopBillIds: [                          // References to shop_bills collection
    "BILL-001",
    "BILL-002",
    "BILL-003"
  ],
  
  // Summary
  totalShops: 3,                          // Auto-calculated: shopBillIds.length
  totalAmount: 5000,                      // Auto-calculated: sum of all shop bills
  
  // Cash Settlement (manually entered, no verification)
  cashReceived: 4950,                     // What driver actually gave you
  cashShortage: 50,                       // Auto-calculated: totalAmount - cashReceived (for info only)
  
  // Stock Loaded on Vehicle (for reference)
  stockLoaded: [
    {
      productId: "thumbsup-rgb-300ml",
      productName: "Thumbsup 300ml",
      cases: 5,
      looseBottles: 10,
      totalBottles: 130                   // Auto-calculated
    },
    {
      productId: "sprite-pet-500ml",
      productName: "Sprite 500ml",
      cases: 3,
      looseBottles: 0,
      totalBottles: 72
    }
  ],
  
  // Empties Collected Summary (shop-wise, entered manually)
  emptiesCollected: [
    {
      shopId: "SHOP-001",
      shopName: "Sai Traders",
      items: [
        {
          productId: "thumbsup-rgb-300ml",
          productName: "Thumbsup 300ml RGB",
          goodBottles: 40,
          brokenBottles: 5,
          moneyCollected: 15              // 5 × ₹3
        },
        {
          productId: "sprite-rgb-300ml",
          productName: "Sprite 300ml RGB",
          goodBottles: 22,
          brokenBottles: 0,
          moneyCollected: 0
        }
      ]
    },
    {
      shopId: "SHOP-002",
      shopName: "Kumar Stores",
      items: [
        {
          productId: "thumbsup-rgb-300ml",
          productName: "Thumbsup 300ml RGB",
          goodBottles: 24,
          brokenBottles: 0,
          moneyCollected: 0
        }
      ]
    }
  ],
  
  totalMoneyCollectedForBroken: 15,       // Sum of all moneyCollected
  
  // Route Expenses (single field, no breakdown)
  routeExpenses: 900,                     // Total expenditure (worker pay, fuel, etc.)
  
  // Net Calculation
  netForRoute: 4100,                      // Auto-calculated: totalAmount - routeExpenses
  
  // Status
  status: "Completed",                    // Draft, Finalized, Completed
  
  // Metadata
  createdAt: ISODate("2026-02-05T09:00:00Z"),
  finalizedAt: ISODate("2026-02-05T09:30:00Z"),
  completedAt: ISODate("2026-02-05T17:00:00Z"),
  updatedAt: ISODate("2026-02-09T15:30:00Z")
}
```

**Indexes:**
- `routeBillId`: unique
- `routeId`: non-unique
- `routeDate`: non-unique
- `status`: non-unique

**Business Rules:**
- Status flow: Draft → Finalized (before sending) → Completed (after driver returns)
- Creating empties entries here also creates `empties_returns` documents (linked via routeBillId)
- Cash shortage is just informational, no system action
- Route expenses affect profit reports

---

## 9️⃣ PAYMENTS COLLECTION (Optional - for tracking)

**Collection Name:** `payments`

**Purpose:** Track payments to companies

```javascript
{
  _id: ObjectId("..."),
  
  paymentId: "PAY-001",
  companyId: "CSD-001",
  companyName: "CSD Flavour",
  paymentDate: ISODate("2026-02-08T14:00:00Z"),
  
  // Bills Being Paid
  purchaseIds: ["PUR-001", "PUR-002"],    // References to company_purchases
  
  amount: 5300,
  paymentMode: "Bank Transfer",           // Cash, Bank Transfer, UPI, Cheque
  referenceNumber: "TXN123456",           // Optional
  
  notes: "Payment for bills PUR-001, PUR-002",
  
  createdAt: ISODate("2026-02-08T14:30:00Z")
}
```

---

## 📊 SUMMARY OF COLLECTIONS

| Collection | Purpose | Key Relationships |
|------------|---------|-------------------|
| `products` | Product master catalog | Referenced by all bills/purchases |
| `companies` | Supplier companies | Referenced by `company_purchases` |
| `shops` | Customer shops | Referenced by `shop_bills`, `empties_returns` |
| `routes` | Delivery routes | Referenced by `shop_bills`, `route_bills` |
| `company_purchases` | Stock purchases from companies | Updates `products`, `companies` |
| `shop_bills` | Sales bills to shops | Updates `products`, `shops` |
| `empties_returns` | Shop empties returns | Updates `products`, `shops` |
| `route_bills` | Daily route summaries | References `shop_bills`, creates `empties_returns` |
| `payments` | Payments to companies | References `company_purchases` |

---

## 🔄 DATA FLOW DIAGRAMS

### Purchase Flow:
```
Create company_purchase
  ↓
Update products.filledStock (+)
Update products.emptyStock (-)
Update products.returnableAccounts.companyOwed (+)
Update companies.returnableProducts.emptiesOwed (+)
Update companies.outstandingAmount (+)
```

### Sale Flow:
```
Create shop_bill
  ↓
Update products.filledStock (-)
Update products.returnableAccounts.shopsOwed (+)
Update shops.returnableProducts.emptiesOwed (+)
```

### Empties Return Flow:
```
Create empties_return
  ↓
Update products.emptyStock.good (+)
Update products.returnableAccounts.shopsOwed (-)
Update shops.returnableProducts.emptiesOwed (-)
```

### Route Bill Flow:
```
Create route_bill (Finalized)
  ↓
Group shop_bills by routeId
Calculate totals

Complete route_bill
  ↓
Create empties_return documents for each shop
Update all related collections
```

---

## 🎯 KEY DESIGN DECISIONS

1. **Denormalization**: Company names, shop names, product names stored in bills for historical accuracy
2. **Running Balances**: Company and shop returnable balances never reset to zero
3. **No Cascade Deletes**: Deleting a product/shop/company doesn't delete related bills (data integrity)
4. **Money Collected vs Penalty**: Broken bottle money is "collected" not "penalty" (terminology matters for company payment)
5. **Separate Empties Collection**: Empties returns are separate from bills (timeline mismatch solution)
6. **Route Bill Status**: Three states (Draft, Finalized, Completed) for workflow control

---

**This schema is production-ready and supports all business workflows! ✅**
