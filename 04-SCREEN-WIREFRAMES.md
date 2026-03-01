# 🎨 SCREEN WIREFRAMES - Beverage Inventory System

## Overview
This document provides visual wireframes for all screens in the system.

---

## 🎨 DESIGN SYSTEM

### Colors
```
Primary: #2563eb (Blue)
Success: #10b981 (Green)
Warning: #f59e0b (Amber)
Danger: #ef4444 (Red)
Background: #f9fafb (Gray 50)
Card: #ffffff (White)
Border: #e5e7eb (Gray 200)
Text Primary: #111827 (Gray 900)
Text Secondary: #6b7280 (Gray 500)
```

### Typography
```
Headings: Inter Font, Bold
Body: Inter Font, Regular
Font Sizes:
  - H1: 24px
  - H2: 20px
  - H3: 18px
  - Body: 14px
  - Small: 12px
```

### Components
- **Buttons**: Rounded corners (6px), padding (10px 20px)
- **Cards**: Shadow (small), rounded (8px), padding (20px)
- **Inputs**: Border (1px gray 300), rounded (6px), padding (8px 12px)
- **Tables**: Alternate row colors, hover effect
- **Dropdowns**: Chevron icon, searchable for long lists

---

## 📱 RESPONSIVE BREAKPOINTS

```
Mobile: < 768px (stack everything vertically)
Tablet: 768px - 1024px (2-column layout)
Desktop: > 1024px (3-column layout)
```

---

## 🏠 MAIN LAYOUT

```
┌────────────────────────────────────────────────────────────┐
│  🍹 Beverage Inventory                   👤 Manager  [☰]   │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐ │
│  │ 📦       │ 🧾       │ 🚚       │ 🏭        │ 📊       │ │
│  │Inventory │ Billing  │ Routes   │ Companies │ Reports  │ │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘ │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │                                                    │   │
│  │                MAIN CONTENT AREA                   │   │
│  │                                                    │   │
│  │                                                    │   │
│  │                                                    │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Mobile View:**
```
┌──────────────────────┐
│  🍹 BIS        [☰]   │ ← Hamburger menu
├──────────────────────┤
│                      │
│  CONTENT (stacked)   │
│                      │
│                      │
└──────────────────────┘
```

---

## 1️⃣ INVENTORY SCREENS

### Screen 1.1: Product List
```
┌────────────────────────────────────────────────────────────┐
│  PRODUCTS                                    [+ Add Product]│
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Filters & Search:                                         │
│  [All Types ▼] [All Brands ▼] 🔍 [Search products...]      │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │  Thumbsup RGB 300ml                    ✅ Returnable│   │
│  │  Brand: CSD Flavour                                 │   │
│  │  ───────────────────────────────────────────────────│   │
│  │  💰 ₹20 MRP  |  📦 24/case  |  💵 ₹300/case         │   │
│  │  ───────────────────────────────────────────────────│   │
│  │  📊 Stock: 240 bottles (10 cases)                   │   │
│  │  📦 Empties: 40 good, 5 broken                      │   │
│  │  🏭 Owe company: 320  |  🏪 Shops owe: 120          │   │
│  │  ───────────────────────────────────────────────────│   │
│  │  [View Details] [Edit]                              │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │  Sprite PET 500ml                      ❌ Non-Return│   │
│  │  Brand: CSD Flavour                                 │   │
│  │  ───────────────────────────────────────────────────│   │
│  │  💰 ₹30 MRP  |  📦 24/case  |  💵 ₹660/case         │   │
│  │  ───────────────────────────────────────────────────│   │
│  │  📊 Stock: 120 bottles (5 cases)                    │   │
│  │  ───────────────────────────────────────────────────│   │
│  │  [View Details] [Edit]                              │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  ... more products ...                                     │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Design Notes:**
- RGB products have green "✅ Returnable" badge
- PET/CAN products have gray "❌ Non-Return" badge  
- Empty stock and returnable accounts only shown for RGB
- Low stock (< 2 cases) shows amber ⚠️ warning icon

---

### Screen 1.2: Add Product Modal
```
┌────────────────────────────────────────────┐
│  ADD NEW PRODUCT                  [✕]      │
├────────────────────────────────────────────┤
│                                            │
│  Basic Information                         │
│  ─────────────────────────────────────     │
│                                            │
│  Product ID *                              │
│  [thumbsup-rgb-300ml_____________]         │
│                                            │
│  Brand *                                   │
│  [CSD Flavour ▼________________]           │
│                                            │
│  Product Name *                            │
│  [Thumbsup____________________]            │
│                                            │
│  Size *                                    │
│  [300ml_______________________]            │
│                                            │
│  Pack Type *                               │
│  [RGB ▼] RGB | PET | CAN | TTP | MTP       │
│                                            │
│  ✅ Returnable (auto-checked for RGB)      │
│                                            │
│  Pricing                                   │
│  ─────────────────────────────────────     │
│                                            │
│  MRP (₹) *                                 │
│  [20___________________________]           │
│                                            │
│  Bottles per Case *                        │
│  [24___________________________]           │
│                                            │
│  Case Price (₹) *                          │
│  [300__________________________]           │
│                                            │
│  Per Bottle Price: ₹12.50 (auto-calc)     │
│                                            │
│  [Cancel]              [Save Product]     │
│                                            │
└────────────────────────────────────────────┘
```

**Validation Messages:**
- Required fields show red border if empty
- Product ID must be unique (check on blur)
- Numbers only for numeric fields
- Success toast on save: "✅ Product created!"

---

## 2️⃣ BILLING SCREENS

### Screen 2.1: Create Shop Bill
```
┌────────────────────────────────────────────────────────────┐
│  CREATE SHOP BILL                               [✕ Close]  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Shop *                                                    │
│  [Select Shop ▼_________________________________]          │
│   ├─ Sai Traders                                           │
│   ├─ Kumar Stores                                          │
│   └─ [+ New Shop] ← Shows inline form                      │
│                                                            │
│  Route                                                     │
│  [Route A ▼_____________________________________]          │
│   ├─ Route A - City Center                                 │
│   ├─ Route B - East Zone                                   │
│   └─ No Route / Walk-in                                    │
│                                                            │
│  Date                                                      │
│  [2026-02-09] 📅                                           │
│                                                            │
│  ───────────────────────────────────────────────────────   │
│  ITEMS                                    [+ Add Item]     │
│  ───────────────────────────────────────────────────────   │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │ Product: [Thumbsup RGB 300ml ▼________________]    │   │
│  │ Available: 240 bottles  |  MRP: ₹20             │   │
│  │                                                   │   │
│  │ Quantity: [48] bottles                           │   │
│  │ Total: ₹960                         [Remove ✕]   │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │ Product: [Sprite PET 500ml ▼__________________]    │   │
│  │ Available: 120 bottles  |  MRP: ₹30             │   │
│  │                                                   │   │
│  │ Quantity: [24] bottles                           │   │
│  │ Total: ₹720                         [Remove ✕]   │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  ───────────────────────────────────────────────────────   │
│  BILL SUMMARY                                              │
│  ───────────────────────────────────────────────────────   │
│                                                            │
│  Items Total:              ₹1,680                          │
│  ═══════════════════════════════════════                   │
│  Grand Total:              ₹1,680                          │
│                                                            │
│  Payment Mode: [Cash ▼] Cash | UPI | Credit                │
│  Amount Received: [₹1,680_________________]                │
│                                                            │
│  [Cancel]                        [Generate Bill]          │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**After clicking [+ New Shop]:**
```
┌──────────────────────────────────────┐
│  Quick Add Shop                      │
│  Shop Name *  [________________]     │
│  Owner Name   [________________]     │
│  Phone        [________________]     │
│  Route        [Route A ▼_______]     │
│  [Cancel] [Save & Continue]          │
└──────────────────────────────────────┘
```

**Success State:**
```
┌────────────────────────────────────────┐
│  ✅ Bill Created Successfully!          │
│  Bill ID: BILL-001                     │
│  Amount: ₹1,680                        │
│                                        │
│  [Print Bill] [New Bill] [View Bills]  │
└────────────────────────────────────────┘
```

---

## 3️⃣ ROUTES SCREENS

### Screen 3.1: Route Bill (Finalized State)
```
┌────────────────────────────────────────────────────────────┐
│  ROUTE BILL - Route A | 2026-02-09              [✕ Close]  │
├────────────────────────────────────────────────────────────┤
│  Status: ▶️ FINALIZED                                       │
│  Driver: Ravi  |  Vehicle: TN-01-AB-1234                   │
│                                                            │
│  ───────────────────────────────────────────────────────   │
│  SHOP BILLS ON THIS ROUTE                                  │
│  ───────────────────────────────────────────────────────   │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │  ✅ BILL-001  Sai Traders              ₹960        │   │
│  │  ───────────────────────────────────────────────── │   │
│  │  • Thumbsup RGB 300ml: 48 bottles                 │   │
│  │  • Sprite PET 500ml: 24 bottles                   │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │  ✅ BILL-002  Kumar Stores             ₹480        │   │
│  │  ───────────────────────────────────────────────── │   │
│  │  • Thumbsup RGB 300ml: 24 bottles                 │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  Total: 2 shops  |  Total Amount: ₹1,440                   │
│                                                            │
│  ───────────────────────────────────────────────────────   │
│  STOCK TO LOAD                                             │
│  ───────────────────────────────────────────────────────   │
│                                                            │
│  • Thumbsup RGB 300ml: 72 bottles (3 cases)                │
│  • Sprite PET 500ml: 24 bottles (1 case)                   │
│                                                            │
│  [Print Route Sheet]        [Complete Route Bill]         │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

### Screen 3.2: Complete Route Bill (After Driver Returns)
```
┌────────────────────────────────────────────────────────────┐
│  COMPLETE ROUTE BILL #RB-001                    [✕ Close]  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  💰 CASH SETTLEMENT                                         │
│  ───────────────────────────────────────────────────────   │
│                                                            │
│  Total Expected:    ₹1,440                                 │
│  Cash Received:     [₹1,440_______]                        │
│  Difference:        ₹0 (no alert)                          │
│                                                            │
│  ───────────────────────────────────────────────────────   │
│  📦 EMPTIES COLLECTED                                       │
│  ───────────────────────────────────────────────────────   │
│                                                            │
│  Shop: Sai Traders                                         │
│  ┌────────────────────────────────────────────────────┐   │
│  │ Thumbsup RGB 300ml                                 │   │
│  │ Expected: 48 bottles                               │   │
│  │ Good: [40___] Broken: [5___]                       │   │
│  │ Money Collected: ₹15 (auto: 5 × ₹3)                │   │
│  ├────────────────────────────────────────────────────┤   │
│  │ Sprite RGB 300ml                                   │   │
│  │ Expected: 24 bottles                               │   │
│  │ Good: [22___] Broken: [0___]                       │   │
│  │ Money Collected: ₹0                                 │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  Shop: Kumar Stores                                        │
│  ┌────────────────────────────────────────────────────┐   │
│  │ Thumbsup RGB 300ml                                 │   │
│  │ Expected: 24 bottles                               │   │
│  │ Good: [24___] Broken: [0___]                       │   │
│  │ Money Collected: ₹0                                 │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  Total Money Collected for Broken: ₹15                     │
│                                                            │
│  ───────────────────────────────────────────────────────   │
│  💵 ROUTE EXPENSES                                          │
│  ───────────────────────────────────────────────────────   │
│                                                            │
│  Total Expenditure: [₹900_________]                        │
│  (Worker pay, fuel, etc. - single field)                   │
│                                                            │
│  ═══════════════════════════════════════════════════════   │
│  NET FOR ROUTE: ₹1,440 - ₹900 = ₹540                       │
│  ═══════════════════════════════════════════════════════   │
│                                                            │
│  [Cancel]                     [Complete Route Bill]       │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Design Notes:**
- Auto-calculate money collected (broken × ₹3)
- Show expected empties from shop's balance
- Total money collected shown prominently
- Net for route = Total amount - Expenses

---

## 4️⃣ COMPANIES SCREENS

### Screen 4.1: Add Company Purchase
```
┌────────────────────────────────────────────────────────────┐
│  ADD COMPANY PURCHASE                           [✕ Close]  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Company *                                                 │
│  [Select Company ▼_________________________________]       │
│   ├─ CSD Flavour                                           │
│   ├─ Maaza Company                                         │
│   └─ [+ New Company] ← Shows inline form                   │
│                                                            │
│  Date: [2026-02-09] 📅                                     │
│                                                            │
│  ───────────────────────────────────────────────────────   │
│  ITEMS TO PURCHASE                        [+ Add Item]     │
│  ───────────────────────────────────────────────────────   │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │ Product: [Thumbsup RGB 300ml ▼________________]    │   │
│  │ Cases: [10___]  @₹300/case                        │   │
│  │ = 240 bottles                                     │   │
│  │ Total: ₹3,000                       [Remove ✕]    │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  Transport Bill: [₹500________]                            │
│                                                            │
│  ───────────────────────────────────────────────────────   │
│  EMPTIES RETURNING NOW                                     │
│  ───────────────────────────────────────────────────────   │
│  Your current stock:                                       │
│  • Thumbsup RGB 300ml: 40 good, 5 broken                   │
│  • Sprite RGB 300ml: 22 good, 0 broken                     │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │ Thumbsup RGB 300ml                                 │   │
│  │ Good Returning: [40___]                            │   │
│  │ Broken (from warehouse): [0___]                    │   │
│  │ Money for Broken: ₹0 (auto: broken × ₹3)           │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  ───────────────────────────────────────────────────────   │
│  BILL SUMMARY                                              │
│  ───────────────────────────────────────────────────────   │
│                                                            │
│  Product Total:         ₹3,000                             │
│  Transport:             ₹500                               │
│  Broken Penalty:        ₹0                                 │
│  ═══════════════════════════════                           │
│  Grand Total:           ₹3,500                             │
│                                                            │
│  Payment Due: 2026-02-16 (7 days)                          │
│                                                            │
│  [Cancel]                        [Save Purchase]          │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Design Notes:**
- Show current empty stock to help user decide how many to return
- Auto-calculate broken penalty
- Auto-set payment due date based on company terms

---

## 5️⃣ REPORTS SCREENS

### Screen 5.1: Profit & Loss Report
```
┌────────────────────────────────────────────────────────────┐
│  PROFIT & LOSS REPORT                        [Export PDF]  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Period: [Last 30 Days ▼]                                  │
│  Custom: From [______] To [______] [Apply]                 │
│                                                            │
│  ┌──────────────────────┬──────────────────────┐           │
│  │  💰 REVENUE          │  📊 Chart           │           │
│  ├──────────────────────┼──────────────────────┤           │
│  │  Shop Sales          │       ████████████   │           │
│  │  ₹1,25,000           │                      │           │
│  │                      │  ██ Broken           │           │
│  │  Broken Collections  │                      │           │
│  │  ₹500                │                      │           │
│  │  ─────────────────   │                      │           │
│  │  Total: ₹1,25,500    │                      │           │
│  └──────────────────────┴──────────────────────┘           │
│                                                            │
│  ┌──────────────────────┬──────────────────────┐           │
│  │  💸 EXPENSES         │  📊 Chart           │           │
│  ├──────────────────────┼──────────────────────┤           │
│  │  Purchases  ₹80,000  │  ███████████████     │           │
│  │  Transport  ₹5,000   │  █                   │           │
│  │  Broken Pay ₹300     │                      │           │
│  │  Routes     ₹12,000  │  ██                  │           │
│  │  ─────────────────   │                      │           │
│  │  Total: ₹97,300      │                      │           │
│  └──────────────────────┴──────────────────────┘           │
│                                                            │
│  ═══════════════════════════════════════════════════════   │
│  💎 PROFIT                                                 │
│  Cash Profit:      ₹28,200                                 │
│  Inventory Value:  ₹2,50,000                               │
│  ─────────────────────────────                             │
│  Total Profit:     ₹2,78,200                               │
│  ═══════════════════════════════════════════════════════   │
│                                                            │
│  [View Breakdown] [View Timeline]                          │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Design Notes:**
- Visual charts for quick understanding
- Clear separation of revenue/expenses
- Highlight total profit prominently
- Export option for PDF reports

---

### Screen 5.2: Returnables Status
```
┌────────────────────────────────────────────────────────────┐
│  RETURNABLES STATUS REPORT                   [Export PDF]  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │  📦 OVERALL STATUS                                  │   │
│  ├────────────────────────────────────────────────────┤   │
│  │                                                    │   │
│  │  Empty Stock:       250 bottles (200 good, 50 bad) │   │
│  │  Owed to Companies: 1,500 empties                  │   │
│  │  Owed by Shops:     800 empties                    │   │
│  │  ─────────────────────────────────────             │   │
│  │  ⚠️  Shortage:       450 empties (in circulation)   │   │
│  │                                                    │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  ───────────────────────────────────────────────────────   │
│  BY PRODUCT                                                │
│  ───────────────────────────────────────────────────────   │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │  Thumbsup RGB 300ml                                │   │
│  │  ───────────────────────────────────────────────   │   │
│  │  Empty Stock:       40 bottles                     │   │
│  │  Owe Company:       320 empties                    │   │
│  │  Shops Owe:         120 empties                    │   │
│  │  Shortage:          160 empties                    │   │
│  │                                                    │   │
│  │  Status: ⚠️ Shortage                                │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │  Sprite RGB 300ml                                  │   │
│  │  ───────────────────────────────────────────────   │   │
│  │  Empty Stock:       22 bottles                     │   │
│  │  Owe Company:       120 empties                    │   │
│  │  Shops Owe:         80 empties                     │   │
│  │  Shortage:          18 empties                     │   │
│  │                                                    │   │
│  │  Status: ⚠️ Shortage                                │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  ... more products ...                                     │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 📱 MOBILE RESPONSIVE EXAMPLES

### Mobile: Product List
```
┌──────────────────────────┐
│ 🍹 BIS           [☰]     │
├──────────────────────────┤
│ 📦 PRODUCTS              │
│ [+ Add]                  │
├──────────────────────────┤
│ 🔍 [Search...]           │
│ [Type ▼] [Brand ▼]       │
├──────────────────────────┤
│ ┌──────────────────────┐ │
│ │ Thumbsup RGB 300ml   │ │
│ │ ✅ Returnable         │ │
│ │ ₹20 | 24/case        │ │
│ │ Stock: 240 bottles   │ │
│ │ [View] [Edit]        │ │
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │ Sprite PET 500ml     │ │
│ │ ❌ Non-Return         │ │
│ │ ₹30 | 24/case        │ │
│ │ Stock: 120 bottles   │ │
│ │ [View] [Edit]        │ │
│ └──────────────────────┘ │
│                          │
└──────────────────────────┘
```

### Mobile: Create Bill
```
┌──────────────────────────┐
│ NEW BILL         [✕]     │
├──────────────────────────┤
│ Shop *                   │
│ [Select... ▼]            │
│                          │
│ Route                    │
│ [Select... ▼]            │
│                          │
│ Date: 09-Feb-2026        │
│                          │
│ ─────────────────────    │
│ ITEMS                    │
│ ─────────────────────    │
│                          │
│ Product:                 │
│ [Thumbsup... ▼]          │
│ Qty: [48] bottles        │
│ Total: ₹960   [✕]        │
│                          │
│ [+ Add Item]             │
│                          │
│ ─────────────────────    │
│ TOTAL: ₹960              │
│ ─────────────────────    │
│                          │
│ Payment: [Cash ▼]        │
│ Amount: [₹960]           │
│                          │
│ [Cancel] [Save Bill]     │
│                          │
└──────────────────────────┘
```

---

## 🎨 COMPONENT LIBRARY

### Button Styles
```
Primary:   [Save Product]    ← Blue, white text
Secondary: [Cancel]           ← Gray, dark text
Success:   [✅ Complete]      ← Green, white text
Danger:    [Delete]           ← Red, white text
Link:      View Details       ← Blue text, no background
```

### Form Elements
```
Input:     [________________]
Select:    [Option ▼________]
Checkbox:  ☑ Checked  ☐ Unchecked
Radio:     ⦿ Selected  ○ Unselected
Date:      [2026-02-09] 📅
Number:    [48_____] +/-
```

### Cards
```
┌────────────────────────┐
│  Card Title            │
│  ──────────────────    │
│  Content here          │
│  [Action Button]       │
└────────────────────────┘
```

### Badges
```
✅ Returnable   ❌ Non-Return
🟢 Completed    🟡 Pending    🔴 Overdue
⚠️  Low Stock    ⚡ Urgent
```

### Alerts/Toasts
```
Success: ✅ Operation completed successfully!
Warning: ⚠️  Low stock alert
Error:   ❌ Operation failed. Please try again.
Info:    ℹ️  New update available
```

---

## 🎯 INTERACTION PATTERNS

### Dropdown with Search
```
[Search products... ▼_______________]
  🔍 Search results:
  ├─ Thumbsup RGB 300ml
  ├─ Thumbsup PET 500ml
  └─ Thumbsup CAN 200ml
```

### Inline Form (New Shop/Company)
```
Main Form:
  Shop: [+ New Shop] ← Click here
  
  ↓ Expands inline
  
  ┌─────────────────────────┐
  │ Quick Add Shop          │
  │ Name: [_______________] │
  │ Phone: [______________] │
  │ [Cancel] [Save]         │
  └─────────────────────────┘
  
  ↓ On save, closes and selects
  
  Shop: [New Shop Name ▼]
```

### Loading States
```
[⏳ Loading products...]
[🔄 Saving...]
[📊 Generating report...]
```

### Empty States
```
┌────────────────────────┐
│   📭                   │
│   No products found    │
│   [+ Add First Product]│
└────────────────────────┘
```

---

**All screens designed for intuitive, efficient workflow! ✅**
