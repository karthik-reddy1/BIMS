# 📱 COMPLETE WORKFLOW DOCUMENT - Beverage Inventory System

## Overview
This document describes every screen, every operation, and every user interaction in the system.

---

## 🏠 MAIN NAVIGATION

```
┌─────────────────────────────────────────────────────┐
│  🍹 Beverage Inventory System                       │
├─────────────────────────────────────────────────────┤
│  📦 Inventory   |  🏪 Billing   |  🚚 Routes        │
│  🏭 Companies   |  📊 Reports                       │
└─────────────────────────────────────────────────────┘
```

### Main Sections:
1. **Inventory** - Product management, stock levels
2. **Billing** - Create shop bills
3. **Routes** - Route bills, settlements
4. **Companies** - Supplier management, purchases
5. **Reports** - All analytics and summaries

---

## 1️⃣ INVENTORY SECTION

### Screen 1.1: Product List
```
┌─────────────────────────────────────────────────────┐
│  INVENTORY - PRODUCTS                    [+ Add Product]
├─────────────────────────────────────────────────────┤
│  Filters: [All ▼] [RGB ▼] [Brand ▼]     🔍 Search...│
├─────────────────────────────────────────────────────┤
│  Product                    Stock        Empties    │
├─────────────────────────────────────────────────────┤
│  Thumbsup RGB 300ml        240 bottles   40 good    │
│  ₹20 MRP | 24/case         10c, 0b       5 broken   │
│  [View] [Edit]                                      │
├─────────────────────────────────────────────────────┤
│  Sprite PET 500ml          120 bottles   -          │
│  ₹30 MRP | 24/case         5c, 0b                   │
│  [View] [Edit]                                      │
├─────────────────────────────────────────────────────┤
│  ... more products ...                              │
└─────────────────────────────────────────────────────┘
```

**Operations:**
- **Filter** by pack type (RGB/PET/CAN/etc) or brand
- **Search** products by name
- **[+ Add Product]** - Opens Screen 1.2
- **[View]** - Opens Screen 1.3 (read-only details)
- **[Edit]** - Opens Screen 1.4 (edit product)

---

### Screen 1.2: Add New Product
```
┌─────────────────────────────────────────────────────┐
│  ADD NEW PRODUCT                          [✕ Close] │
├─────────────────────────────────────────────────────┤
│  Basic Information                                  │
│                                                     │
│  Product ID:  [thumbsup-rgb-300ml]                  │
│  Brand:       [CSD Flavour ▼]                       │
│  Product:     [Thumbsup]                            │
│  Size:        [300ml]                               │
│  Pack Type:   [RGB ▼] RGB/PET/CAN/TTP/MTP           │
│                                                     │
│  ✅ Is Returnable (auto-checked if RGB)             │
│                                                     │
│  Pricing                                            │
│                                                     │
│  MRP:              [₹ 20]                           │
│  Bottles per Case: [24]                             │
│  Case Price:       [₹ 300]                          │
│  Per Bottle:       ₹ 12.5 (auto-calculated)         │
│                                                     │
│  [Cancel]                        [Save Product]    │
└─────────────────────────────────────────────────────┘
```

**Validation:**
- Product ID must be unique
- All fields required except "Is Returnable" (auto-set)
- Pack type from dropdown: RGB, PET, CAN, TTP, MTP

**On Save:**
- Create product in database
- Initialize stock to 0
- If RGB, initialize empty stock to 0
- Show success message
- Return to product list

---

### Screen 1.3: Product Details (View)
```
┌─────────────────────────────────────────────────────┐
│  PRODUCT DETAILS                    [Edit] [✕ Close]│
├─────────────────────────────────────────────────────┤
│  Thumbsup RGB 300ml                                 │
│  Brand: CSD Flavour | Pack: RGB | ✅ Returnable     │
│                                                     │
│  PRICING                                            │
│  MRP: ₹20 | Case: ₹300 (24 bottles)                 │
│                                                     │
│  CURRENT STOCK                                      │
│  Filled: 240 bottles (10 cases, 0 loose)            │
│  Empty Good: 40 bottles                             │
│  Empty Broken: 5 bottles                            │
│                                                     │
│  RETURNABLE ACCOUNTS                                │
│  You owe company: 320 empties                       │
│  Shops owe you: 120 empties                         │
│  Shortage: 200 empties (in circulation)             │
│                                                     │
│  [View Transactions] [Close]                        │
└─────────────────────────────────────────────────────┘
```

**[View Transactions]** shows:
- All purchases where this product was bought
- All sales bills where this product was sold
- All empties returns for this product

---

### Screen 1.4: Edit Product
```
Same form as Screen 1.2, but:
- Product ID is read-only (cannot change)
- Stock values shown but not editable here
- Can update: brand, name, size, pricing
- Cannot change pack type (would break returnable logic)
```

---

### Screen 1.5: Stock Summary Dashboard
```
┌─────────────────────────────────────────────────────┐
│  INVENTORY SUMMARY                                  │
├─────────────────────────────────────────────────────┤
│  STOCK BY PACK TYPE                                 │
│  ┌──────────┬──────────┬──────────┬──────────┐      │
│  │   RGB    │   PET    │   CAN    │   TTP    │      │
│  │  15 SKUs │  22 SKUs │  8 SKUs  │  5 SKUs  │      │
│  └──────────┴──────────┴──────────┴──────────┘      │
│                                                     │
│  LOW STOCK ALERTS (< 2 cases)                       │
│  ⚠️ Thumbsup RGB 300ml - 1 case, 10 bottles          │
│  ⚠️ Fanta PET 500ml - 0 cases, 15 bottles            │
│                                                     │
│  RETURNABLES STATUS                                 │
│  Empty stock: 250 bottles (200 good, 50 broken)     │
│  Owed to companies: 1,500 empties                   │
│  Owed by shops: 800 empties                         │
│  Shortage: 450 empties (in circulation)             │
│                                                     │
│  [View Detailed Report]                             │
└─────────────────────────────────────────────────────┘
```

---

## 2️⃣ BILLING SECTION

### Screen 2.1: Create Shop Bill
```
┌─────────────────────────────────────────────────────┐
│  NEW SHOP BILL                            [✕ Close] │
├─────────────────────────────────────────────────────┤
│  Shop: [Select Shop ▼]                              │
│         - Sai Traders                               │
│         - Kumar Stores                              │
│         - [+ New Shop] ← Opens inline form          │
│                                                     │
│  Route: [Select Route ▼]                            │
│         - Route A                                   │
│         - Route B                                   │
│         - No Route / Walk-in                        │
│                                                     │
│  Date: [2026-02-09] (auto-fills today)              │
│                                                     │
│  ITEMS                                 [+ Add Item] │
│  ┌───────────────────────────────────────────────┐  │
│  │ Product: [Thumbsup RGB 300ml ▼]              │  │
│  │ Available: 240 bottles                       │  │
│  │ Quantity: [48] bottles                       │  │
│  │ MRP: ₹20 (auto-filled)                        │  │
│  │ Total: ₹960 (auto-calculated)   [Remove]     │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────┐  │
│  │ Product: [Sprite PET 500ml ▼]                │  │
│  │ Available: 120 bottles                       │  │
│  │ Quantity: [24] bottles                       │  │
│  │ MRP: ₹30                                      │  │
│  │ Total: ₹720                     [Remove]     │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  BILL SUMMARY                                       │
│  Items Total:          ₹1,680                       │
│  ═════════════════════════════════════              │
│  Grand Total:          ₹1,680                       │
│                                                     │
│  Payment: [Cash ▼] Cash/UPI/Credit                  │
│  Amount:  [₹1,680]                                  │
│                                                     │
│  [Cancel]                          [Generate Bill] │
└─────────────────────────────────────────────────────┘
```

**[+ New Shop]** inline form:
```
┌─────────────────────────────────────┐
│  Quick Add Shop                     │
│  Shop Name:  [_____________]        │
│  Owner:      [_____________]        │
│  Phone:      [_____________]        │
│  Route:      [Route A ▼]            │
│  [Cancel] [Save & Continue]         │
└─────────────────────────────────────┘
```

**[+ Add Item]** - Adds another product row

**Validation:**
- Shop is required
- Route optional (can be "No Route")
- At least 1 item required
- Quantity cannot exceed available stock
- Payment amount must match grand total (or less if credit)

**On [Generate Bill]:**
1. Create `shop_bill` document
2. Update `products.filledStock` (decrease)
3. Update `products.returnableAccounts.shopsOwed` (increase for RGB items)
4. Update `shops.returnableProducts.emptiesOwed` (increase for RGB items)
5. Generate Bill ID (e.g., BILL-001)
6. Show success: "Bill BILL-001 created successfully"
7. Option to: [Print Bill] [Create Another] [View All Bills]

---

### Screen 2.2: Shop Bills List
```
┌─────────────────────────────────────────────────────┐
│  SHOP BILLS                            [+ New Bill] │
├─────────────────────────────────────────────────────┤
│  Filters: [All Shops ▼] [All Routes ▼] [Date Range]│
├─────────────────────────────────────────────────────┤
│  Bill ID    Shop           Route    Amount   Date  │
├─────────────────────────────────────────────────────┤
│  BILL-001   Sai Traders    A        ₹1,680   02-Feb│
│  [View] [Print]                                     │
├─────────────────────────────────────────────────────┤
│  BILL-002   Kumar Stores   B        ₹480     02-Feb│
│  [View] [Print]                                     │
├─────────────────────────────────────────────────────┤
│  ... more bills ...                                 │
└─────────────────────────────────────────────────────┘
```

---

## 3️⃣ ROUTES SECTION

### Screen 3.1: Routes Overview
```
┌─────────────────────────────────────────────────────┐
│  ROUTES                              [+ Create Route]│
├─────────────────────────────────────────────────────┤
│  Active Routes: 10 | Vehicles: 3-4                  │
├─────────────────────────────────────────────────────┤
│  Route       Shops    Last Run    Action            │
├─────────────────────────────────────────────────────┤
│  Route A     5        Yesterday    [View Details]   │
│                                    [Today's Bill]   │
├─────────────────────────────────────────────────────┤
│  Route B     7        2 days ago   [View Details]   │
│                                    [Today's Bill]   │
├─────────────────────────────────────────────────────┤
│  ... more routes ...                                │
└─────────────────────────────────────────────────────┘
```

**[View Details]** - Shows route configuration, shops list
**[Today's Bill]** - Opens Screen 3.2

---

### Screen 3.2: Create/Manage Route Bill
```
┌─────────────────────────────────────────────────────┐
│  ROUTE BILL - Route A | 2026-02-09        [✕ Close] │
├─────────────────────────────────────────────────────┤
│  Status: ⏸ Draft                                     │
│  Driver: [Ravi ▼]  Vehicle: [TN-01-AB-1234 ▼]      │
│                                                     │
│  SHOP BILLS ON THIS ROUTE                           │
│  ┌─────────────────────────────────────────────┐    │
│  │ ✅ BILL-001  Sai Traders       ₹960         │    │
│  │    Thumbsup RGB 300ml: 48 bottles          │    │
│  │    Sprite PET 500ml: 24 bottles            │    │
│  ├─────────────────────────────────────────────┤    │
│  │ ✅ BILL-002  Kumar Stores      ₹480         │    │
│  │    Thumbsup RGB 300ml: 24 bottles          │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  Total Bills: 2 | Total Amount: ₹1,440              │
│                                                     │
│  STOCK TO LOAD (auto-calculated from bills)         │
│  - Thumbsup RGB 300ml: 72 bottles (3c, 0b)          │
│  - Sprite PET 500ml: 24 bottles (1c, 0b)            │
│                                                     │
│  [Finalize Route Bill] (locks bills, ready to send) │
└─────────────────────────────────────────────────────┘
```

**On [Finalize]:**
- Status: Draft → Finalized
- Creates `route_bill` document with status "Finalized"
- Workers load stock based on this list
- Driver takes route bill printout

---

### Screen 3.3: Complete Route Bill (After Driver Returns)
```
┌─────────────────────────────────────────────────────┐
│  ROUTE BILL #RB-001 - Route A | 2026-02-09          │
├─────────────────────────────────────────────────────┤
│  Status: ▶️ Finalized → Complete                      │
│                                                     │
│  💰 CASH SETTLEMENT                                  │
│  Total Expected: ₹1,440 (from bills)                │
│  Cash Received:  [₹1,440] ← Enter manually          │
│  Difference:     ₹0 (auto-calculated, no alert)     │
│                                                     │
│  📦 EMPTIES COLLECTED (Enter shop-wise)              │
│                                                     │
│  Shop: Sai Traders                                  │
│  ┌───────────────────────────────────────────────┐  │
│  │ Thumbsup RGB 300ml                           │  │
│  │ Expected: 48 (from previous bills)           │  │
│  │ Good: [40]  Broken: [5]                      │  │
│  │ Money Collected: ₹15 (auto: 5 × ₹3)          │  │
│  ├───────────────────────────────────────────────┤  │
│  │ Sprite RGB 300ml                             │  │
│  │ Expected: 24                                 │  │
│  │ Good: [22]  Broken: [0]                      │  │
│  │ Money Collected: ₹0                           │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  Shop: Kumar Stores                                 │
│  ┌───────────────────────────────────────────────┐  │
│  │ Thumbsup RGB 300ml                           │  │
│  │ Expected: 24                                 │  │
│  │ Good: [24]  Broken: [0]                      │  │
│  │ Money Collected: ₹0                           │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  Total Money Collected for Broken: ₹15              │
│                                                     │
│  💵 ROUTE EXPENSES                                   │
│  Total Expenditure: [₹900] ← Single field           │
│  (Worker pay, fuel, etc. - no breakdown)            │
│                                                     │
│  NET FOR ROUTE: ₹1,440 - ₹900 = ₹540                │
│                                                     │
│  [Cancel]                     [Complete Route Bill] │
└─────────────────────────────────────────────────────┘
```

**On [Complete Route Bill]:**
1. Update `route_bill` status: Finalized → Completed
2. For each shop's empties:
   - Create `empties_return` document
   - Update `products.emptyStock.good` (+good bottles)
   - Update `shops.returnableProducts.emptiesOwed` (decrease)
   - Update `products.returnableAccounts.shopsOwed` (decrease)
3. Save route expenses
4. Generate route bill summary report
5. Show success message

---

### Screen 3.4: Route Bill Summary (After Completion)
```
┌─────────────────────────────────────────────────────┐
│  ROUTE BILL #RB-001 SUMMARY                         │
│  Route A | 2026-02-09 | Driver: Ravi                │
├─────────────────────────────────────────────────────┤
│  SHOP BILLS                                         │
│  2 bills | Total: ₹1,440                            │
│                                                     │
│  CASH SETTLEMENT                                    │
│  Expected: ₹1,440                                   │
│  Received: ₹1,440 ✅                                 │
│                                                     │
│  EMPTIES COLLECTED                                  │
│  - Thumbsup RGB 300ml: 86 bottles (84 good, 2 broken)│
│  - Sprite RGB 300ml: 22 bottles (22 good, 0 broken) │
│  Money Collected: ₹15                               │
│                                                     │
│  EXPENSES                                           │
│  Total: ₹900                                        │
│                                                     │
│  NET PROFIT                                         │
│  ₹1,440 - ₹900 = ₹540                               │
│                                                     │
│  [Print] [Close]                                    │
└─────────────────────────────────────────────────────┘
```

---

## 4️⃣ COMPANIES SECTION

### Screen 4.1: Companies List
```
┌─────────────────────────────────────────────────────┐
│  COMPANIES                          [+ Add Company] │
├─────────────────────────────────────────────────────┤
│  Company           Outstanding    Returnables       │
├─────────────────────────────────────────────────────┤
│  CSD Flavour       ₹5,000         320 empties       │
│  [View] [Add Purchase]                              │
├─────────────────────────────────────────────────────┤
│  Maaza Company     ₹2,500         180 empties       │
│  [View] [Add Purchase]                              │
├─────────────────────────────────────────────────────┤
│  ... more companies ...                             │
└─────────────────────────────────────────────────────┘
```

**[Add Purchase]** - Opens Screen 4.2

---

### Screen 4.2: Add Company Purchase
```
┌─────────────────────────────────────────────────────┐
│  ADD COMPANY PURCHASE                     [✕ Close] │
├─────────────────────────────────────────────────────┤
│  Company: [Select Company ▼]                        │
│           - CSD Flavour                             │
│           - Maaza Company                           │
│           - [+ New Company] ← Opens inline form     │
│                                                     │
│  Date: [2026-02-09]                                 │
│                                                     │
│  ITEMS TO PURCHASE                    [+ Add Item]  │
│  ┌───────────────────────────────────────────────┐  │
│  │ Product: [Thumbsup RGB 300ml ▼]              │  │
│  │ Cases: [10]                                  │  │
│  │ Bottles/Case: 24 (auto-filled)               │  │
│  │ Total Bottles: 240 (auto-calculated)         │  │
│  │ Case Price: ₹300 (auto-filled)                │  │
│  │ Total: ₹3,000 (auto-calculated) [Remove]     │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  Transport Bill: [₹500]                             │
│                                                     │
│  EMPTIES RETURNING NOW (in same truck)              │
│  Your current empty stock available:                │
│  - Thumbsup RGB 300ml: 40 good, 5 broken            │
│  - Sprite RGB 300ml: 22 good, 0 broken              │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │ Thumbsup RGB 300ml                           │  │
│  │ Good Returning: [40]                         │  │
│  │ Broken from Warehouse: [0]                   │  │
│  │ Money for Broken: ₹0 (auto: broken × ₹3)     │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  BILL SUMMARY                                       │
│  Product Total:         ₹3,000                      │
│  Transport:             ₹500                        │
│  Broken Penalty:        ₹0                          │
│  ═════════════════════════════════════              │
│  Grand Total:           ₹3,500                      │
│                                                     │
│  Payment Due: 2026-02-16 (7 days)                   │
│                                                     │
│  [Cancel]                        [Save Purchase]   │
└─────────────────────────────────────────────────────┘
```

**[+ New Company]** inline form:
```
┌─────────────────────────────────────┐
│  Quick Add Company                  │
│  Company Name: [_____________]      │
│  Contact:      [_____________]      │
│  Phone:        [_____________]      │
│  Payment Terms: [7] days            │
│  [Cancel] [Save & Continue]         │
└─────────────────────────────────────┘
```

**On [Save Purchase]:**
1. Create `company_purchase` document
2. Update `products.filledStock` (increase - items purchased)
3. Update `products.emptyStock.good` (decrease - empties returned)
4. Update `products.returnableAccounts.companyOwed` (net change)
5. Update `companies.returnableProducts.emptiesOwed` (net change)
6. Update `companies.outstandingAmount` (increase)
7. Show success: "Purchase PUR-001 saved"

---

### Screen 4.3: Company Details
```
┌─────────────────────────────────────────────────────┐
│  COMPANY DETAILS - CSD Flavour                      │
├─────────────────────────────────────────────────────┤
│  Contact: Manager Name | Phone: 9876543210          │
│  Payment Terms: 7 days                              │
│                                                     │
│  RETURNABLE BALANCES                                │
│  - Thumbsup RGB 300ml: 320 empties owed             │
│  - Sprite RGB 300ml: 120 empties owed               │
│  Total: 440 empties you owe to company              │
│                                                     │
│  OUTSTANDING PAYMENTS                               │
│  Total Outstanding: ₹5,000                          │
│  [View Bills] [Make Payment]                        │
│                                                     │
│  PURCHASE HISTORY                                   │
│  PUR-001  2026-02-01  ₹3,500  Pending               │
│  PUR-002  2026-02-08  ₹1,800  Paid                  │
│  [View All Purchases]                               │
│                                                     │
│  [Close]                                            │
└─────────────────────────────────────────────────────┘
```

---

## 5️⃣ REPORTS SECTION

### Screen 5.1: Reports Dashboard
```
┌─────────────────────────────────────────────────────┐
│  REPORTS & ANALYTICS                                │
├─────────────────────────────────────────────────────┤
│  Quick Stats (Today)                                │
│  Sales: ₹12,500 | Purchases: ₹8,000 | Profit: ₹4,500│
│                                                     │
│  AVAILABLE REPORTS                                  │
│                                                     │
│  📦 Inventory Report                                │
│     Current stock levels, low stock alerts          │
│     [View Report]                                   │
│                                                     │
│  💰 Sales Report                                    │
│     Shop bills, route-wise sales, daily/monthly     │
│     [View Report]                                   │
│                                                     │
│  📊 Profit & Loss                                   │
│     Revenue vs expenses, net profit                 │
│     [View Report]                                   │
│                                                     │
│  🔄 Returnables Status                              │
│     Empty stock, company/shop balances, shortages   │
│     [View Report]                                   │
│                                                     │
│  🚚 Route Performance                               │
│     Route-wise revenue, expenses, efficiency        │
│     [View Report]                                   │
│                                                     │
│  🏭 Company Statement                               │
│     Purchase history, outstanding amounts           │
│     [View Report]                                   │
│                                                     │
│  🏪 Shop Statement                                  │
│     Purchase history, returnable balances           │
│     [View Report]                                   │
└─────────────────────────────────────────────────────┘
```

---

### Screen 5.2: Inventory Report
```
┌─────────────────────────────────────────────────────┐
│  INVENTORY REPORT                     [Export PDF]  │
├─────────────────────────────────────────────────────┤
│  Date: 2026-02-09                                   │
│                                                     │
│  STOCK SUMMARY                                      │
│  Total Products: 50 SKUs                            │
│  Total Value: ₹2,50,000 (at MRP)                    │
│                                                     │
│  BY PACK TYPE                                       │
│  RGB: 15 SKUs (₹80,000)                             │
│  PET: 22 SKUs (₹1,20,000)                           │
│  CAN: 8 SKUs (₹35,000)                              │
│  TTP: 5 SKUs (₹15,000)                              │
│                                                     │
│  DETAILED STOCK                                     │
│  Product              Stock         Value           │
│  Thumbsup RGB 300ml   240 bottles   ₹4,800          │
│  Sprite PET 500ml     120 bottles   ₹3,600          │
│  ... all products ...                               │
│                                                     │
│  LOW STOCK ALERTS (< 2 cases)                       │
│  ⚠️ Fanta PET 500ml    15 bottles                    │
│  ⚠️ Coke RGB 300ml     30 bottles                    │
│                                                     │
│  RETURNABLES                                        │
│  Empty Stock: 250 bottles (200 good, 50 broken)     │
│  Owed to Companies: 1,500 empties                   │
│  Owed by Shops: 800 empties                         │
│  Shortage: 450 empties                              │
└─────────────────────────────────────────────────────┘
```

---

### Screen 5.3: Profit & Loss Report
```
┌─────────────────────────────────────────────────────┐
│  PROFIT & LOSS REPORT                [Export PDF]   │
├─────────────────────────────────────────────────────┤
│  Period: [Last 30 Days ▼] From: [__] To: [__]      │
│                                                     │
│  REVENUE (Money IN)                                 │
│  Shop Sales:              ₹1,25,000                 │
│  Broken Bottle Collections: ₹500                    │
│  ────────────────────────                           │
│  Total Revenue:           ₹1,25,500                 │
│                                                     │
│  EXPENSES (Money OUT)                               │
│  Company Purchases:       ₹80,000                   │
│  Transport Bills:         ₹5,000                    │
│  Broken Bottle Payments:  ₹300                      │
│  Route Expenses:          ₹12,000                   │
│  ────────────────────────                           │
│  Total Expenses:          ₹97,300                   │
│                                                     │
│  PROFIT                                             │
│  Cash Profit:             ₹28,200                   │
│  + Inventory Value:       ₹2,50,000                 │
│  ════════════════════════                           │
│  Total Profit:            ₹2,78,200                 │
│                                                     │
│  BREAKDOWN BY CATEGORY                              │
│  [View Chart] [View Details]                        │
└─────────────────────────────────────────────────────┘
```

---

### Screen 5.4: Shop Statement
```
┌─────────────────────────────────────────────────────┐
│  SHOP STATEMENT - Sai Traders         [Export PDF] │
├─────────────────────────────────────────────────────┤
│  Period: [Last 30 Days ▼]                           │
│                                                     │
│  PURCHASE SUMMARY                                   │
│  Total Bills: 15                                    │
│  Total Amount: ₹45,000                              │
│                                                     │
│  RETURNABLE BALANCES                                │
│  - Thumbsup RGB 300ml: 39 empties owed              │
│  - Sprite RGB 300ml: 12 empties owed                │
│  Total: 51 empties owed                             │
│                                                     │
│  TRANSACTION HISTORY                                │
│  Date       Type         Details          Balance   │
│  02-Feb     Bill #001    Sold 48          +48       │
│  05-Feb     Return #001  Returned 45      3         │
│  05-Feb     Bill #002    Sold 36          +36 = 39  │
│  08-Feb     Return #002  Returned 30      9         │
│  ... more transactions ...                          │
│                                                     │
│  BROKEN BOTTLE MONEY COLLECTED                      │
│  Total: ₹150 (50 broken bottles)                    │
│                                                     │
│  [Print Statement]                                  │
└─────────────────────────────────────────────────────┘
```

---

## 🔄 COMPLETE USER JOURNEYS

### Journey 1: Daily Operations

**Morning (9 AM) - Stock Purchase:**
1. Go to Companies → CSD Flavour → [Add Purchase]
2. Add items, enter empties returning, save
3. System updates inventory automatically

**Morning (10 AM) - Create Route Bills:**
1. Go to Billing → Create bills for shops on Route A
2. Tag all bills with "Route A"
3. Go to Routes → Route A → [Today's Bill]
4. Review shop bills, finalize route bill
5. Workers load stock as per route bill

**Evening (5 PM) - Route Settlement:**
1. Go to Routes → Route A → Complete route bill
2. Enter cash received (no verification needed)
3. Enter empties collected (shop-wise)
4. Enter route expenses
5. Save - system updates all balances

---

### Journey 2: Walk-in Customer

1. Billing → [+ New Bill]
2. Select shop or create new shop
3. Route: "No Route / Walk-in"
4. Add items, generate bill
5. Print and hand to customer
6. When customer returns empties later:
   - Shops → Shop name → [Record Return]
   - Enter empties, collect money for broken

---

### Journey 3: Month-End Reports

1. Reports → Profit & Loss
2. Set period: Last month
3. Review revenue, expenses, profit
4. Export PDF for records
5. Reports → Returnables Status
6. Check if empties are in balance
7. Reports → Company Statement
8. Check outstanding payments
9. Make payments if needed

---

## 🎯 KEY UI/UX PRINCIPLES

1. **Inline Creation**: Add company/shop without leaving current screen
2. **Auto-calculations**: All totals, balances calculated automatically
3. **Smart Defaults**: Today's date, expected empties auto-filled
4. **Validation**: Prevent invalid operations (negative stock, etc.)
5. **No Manual Stock Edits**: Stock changes only through bills/purchases
6. **No Alerts for Cash**: Manager handles cash differences manually
7. **Mobile Responsive**: All screens work on phone for on-the-go access
8. **Print Options**: Every bill/report can be printed

---

**This workflow covers 100% of daily operations! ✅**
