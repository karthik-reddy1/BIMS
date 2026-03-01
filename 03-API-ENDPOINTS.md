# 🔌 API ENDPOINTS SPECIFICATION - Beverage Inventory System

## Base URL
```
http://localhost:5000/api
```

---

## 📦 PRODUCTS API

### GET /products
Get all products with optional filters

**Query Parameters:**
- `packType` (optional): Filter by pack type (RGB, PET, CAN, TTP, MTP)
- `brand` (optional): Filter by brand name
- `isReturnable` (optional): true/false

**Response:**
```json
{
  "success": true,
  "count": 50,
  "data": [
    {
      "productId": "thumbsup-rgb-300ml",
      "brand": "CSD Flavour",
      "productName": "Thumbsup",
      "size": "300ml",
      "packType": "RGB",
      "isReturnable": true,
      "mrp": 20,
      "bottlesPerCase": 24,
      "casePrice": 300,
      "perBottlePrice": 12.5,
      "filledStock": {
        "cases": 10,
        "looseBottles": 15,
        "totalBottles": 255
      },
      "emptyStock": {
        "good": 80,
        "broken": 5,
        "total": 85
      },
      "returnableAccounts": {
        "companyOwed": 240,
        "shopsOwed": 120
      }
    }
  ]
}
```

---

### POST /products
Create new product

**Request Body:**
```json
{
  "productId": "thumbsup-rgb-300ml",
  "brand": "CSD Flavour",
  "productName": "Thumbsup",
  "size": "300ml",
  "packType": "RGB",
  "mrp": 20,
  "bottlesPerCase": 24,
  "casePrice": 300
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": { /* full product object */ }
}
```

---

### GET /products/:productId
Get single product by ID

**Response:**
```json
{
  "success": true,
  "data": { /* product object */ }
}
```

---

### PUT /products/:productId
Update product details

**Request Body:**
```json
{
  "mrp": 22,
  "casePrice": 320
}
```

---

### DELETE /products/:productId
Delete product

**Response:**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

### GET /products/summary/stock
Get inventory summary

**Response:**
```json
{
  "success": true,
  "data": {
    "totalProducts": 50,
    "byPackType": {
      "RGB": 15,
      "PET": 22,
      "CAN": 8,
      "TTP": 5
    },
    "lowStock": [
      {
        "productId": "fanta-pet-500ml",
        "productName": "CSD Flavour Fanta 500ml",
        "cases": 0,
        "bottles": 15
      }
    ],
    "returnables": {
      "totalEmptiesInStock": 250,
      "totalOwedToCompanies": 1500,
      "totalOwedByShops": 800,
      "shortage": 450
    }
  }
}
```

---

## 🏭 COMPANIES API

### GET /companies
Get all companies

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "companyId": "CSD-001",
      "companyName": "CSD Flavour",
      "contactPerson": "Manager Name",
      "phone": "9876543210",
      "paymentTerms": 7,
      "returnableProducts": [
        {
          "productId": "thumbsup-rgb-300ml",
          "productName": "Thumbsup 300ml RGB",
          "emptiesOwed": 240
        }
      ],
      "outstandingAmount": 5000
    }
  ]
}
```

---

### POST /companies
Create new company

**Request Body:**
```json
{
  "companyId": "CSD-001",
  "companyName": "CSD Flavour",
  "contactPerson": "Manager Name",
  "phone": "9876543210",
  "paymentTerms": 7
}
```

---

### GET /companies/:companyId
Get company details with full returnable balances

---

### PUT /companies/:companyId
Update company details

---

### DELETE /companies/:companyId
Delete company

---

## 🏪 SHOPS API

### GET /shops
Get all shops

**Query Parameters:**
- `routeId` (optional): Filter by route

**Response:**
```json
{
  "success": true,
  "count": 25,
  "data": [
    {
      "shopId": "SHOP-001",
      "shopName": "Sai Traders",
      "ownerName": "Mr. Sai Kumar",
      "phone": "9123456789",
      "routeId": "ROUTE-A",
      "routeName": "Route A - City Center",
      "returnableProducts": [
        {
          "productId": "thumbsup-rgb-300ml",
          "productName": "Thumbsup 300ml RGB",
          "emptiesOwed": 48
        }
      ],
      "outstandingAmount": 0
    }
  ]
}
```

---

### POST /shops
Create new shop

**Request Body:**
```json
{
  "shopId": "SHOP-001",
  "shopName": "Sai Traders",
  "ownerName": "Mr. Sai Kumar",
  "phone": "9123456789",
  "routeId": "ROUTE-A"
}
```

---

### GET /shops/:shopId
Get shop details

---

### PUT /shops/:shopId
Update shop details

---

### DELETE /shops/:shopId
Delete shop

---

### GET /shops/route/:routeId
Get all shops on a specific route

---

## 🚚 ROUTES API

### GET /routes
Get all routes

**Response:**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "routeId": "ROUTE-A",
      "routeName": "Route A - City Center",
      "shopIds": ["SHOP-001", "SHOP-002", "SHOP-003"],
      "schedule": "Monday, Wednesday, Friday",
      "vehicleNumber": "TN-01-AB-1234",
      "driverName": "Ravi"
    }
  ]
}
```

---

### POST /routes
Create new route

**Request Body:**
```json
{
  "routeId": "ROUTE-A",
  "routeName": "Route A - City Center",
  "shopIds": ["SHOP-001", "SHOP-002"],
  "schedule": "Monday, Wednesday, Friday",
  "vehicleNumber": "TN-01-AB-1234",
  "driverName": "Ravi",
  "driverPhone": "9988776655"
}
```

---

### GET /routes/:routeId
Get route details with shops

---

### PUT /routes/:routeId
Update route

---

### DELETE /routes/:routeId
Delete route

---

## 📝 COMPANY PURCHASES API

### POST /purchases
Create new purchase from company

**Request Body:**
```json
{
  "companyId": "CSD-001",
  "purchaseDate": "2026-02-09T10:00:00Z",
  "items": [
    {
      "productId": "thumbsup-rgb-300ml",
      "cases": 10
    }
  ],
  "transportBill": 500,
  "emptiesReturned": [
    {
      "productId": "thumbsup-rgb-300ml",
      "goodBottles": 40,
      "brokenBottles": 5
    }
  ]
}
```

**What system does automatically:**
1. Fetches product details (bottlesPerCase, casePrice, etc.)
2. Calculates totals
3. Updates product filled stock (+)
4. Updates product empty stock (-)
5. Updates company returnable balances
6. Updates product returnable accounts
7. Generates purchase ID (PUR-001, PUR-002, etc.)

**Response:**
```json
{
  "success": true,
  "message": "Purchase PUR-001 created successfully",
  "data": {
    "purchaseId": "PUR-001",
    "companyId": "CSD-001",
    "companyName": "CSD Flavour",
    "purchaseDate": "2026-02-09T10:00:00Z",
    "items": [
      {
        "productId": "thumbsup-rgb-300ml",
        "productName": "Thumbsup",
        "cases": 10,
        "bottlesPerCase": 24,
        "totalBottles": 240,
        "casePrice": 300,
        "itemTotal": 3000,
        "emptiesOwedToCompany": 240
      }
    ],
    "emptiesReturned": [
      {
        "productId": "thumbsup-rgb-300ml",
        "goodBottles": 40,
        "brokenBottles": 5,
        "totalReturned": 45
      }
    ],
    "productTotal": 3000,
    "transportBill": 500,
    "brokenBottlePenalty": 15,
    "grandTotal": 3515,
    "paymentStatus": "Pending",
    "paymentDueDate": "2026-02-16T23:59:59Z",
    "amountDue": 3515
  }
}
```

---

### GET /purchases
Get all purchases

**Query Parameters:**
- `companyId` (optional): Filter by company
- `status` (optional): Pending, Partial, Paid
- `from` (optional): Start date
- `to` (optional): End date

**Response:**
```json
{
  "success": true,
  "count": 10,
  "data": [ /* array of purchase objects */ ]
}
```

---

### GET /purchases/:purchaseId
Get purchase details

---

### PUT /purchases/:purchaseId/payment
Record payment for purchase

**Request Body:**
```json
{
  "amount": 3515,
  "paymentMode": "Cash",
  "paymentDate": "2026-02-09T14:00:00Z"
}
```

**What system does:**
1. Updates purchase `amountPaid` and `amountDue`
2. Updates `paymentStatus` (Pending → Partial/Paid)
3. Updates company `outstandingAmount`

---

## 🧾 SHOP BILLS API

### POST /bills
Create new shop bill

**Request Body:**
```json
{
  "shopId": "SHOP-001",
  "routeId": "ROUTE-A",
  "billDate": "2026-02-09T10:00:00Z",
  "items": [
    {
      "productId": "thumbsup-rgb-300ml",
      "quantity": 48
    },
    {
      "productId": "sprite-pet-500ml",
      "quantity": 24
    }
  ],
  "paymentMode": "Cash",
  "paymentReceived": 1680
}
```

**What system does automatically:**
1. Fetches product details (MRP, pack type, etc.)
2. Calculates totals
3. Updates product filled stock (-)
4. Updates shop returnable balances (for RGB items)
5. Updates product returnable accounts
6. Generates bill ID (BILL-001, BILL-002, etc.)

**Response:**
```json
{
  "success": true,
  "message": "Bill BILL-001 created successfully",
  "data": {
    "billId": "BILL-001",
    "shopId": "SHOP-001",
    "shopName": "Sai Traders",
    "routeId": "ROUTE-A",
    "billDate": "2026-02-09T10:00:00Z",
    "items": [
      {
        "productId": "thumbsup-rgb-300ml",
        "productName": "Thumbsup",
        "quantity": 48,
        "mrp": 20,
        "itemTotal": 960,
        "isReturnable": true,
        "returnablesOwed": 48
      },
      {
        "productId": "sprite-pet-500ml",
        "productName": "Sprite",
        "quantity": 24,
        "mrp": 30,
        "itemTotal": 720,
        "isReturnable": false,
        "returnablesOwed": 0
      }
    ],
    "itemsTotal": 1680,
    "grandTotal": 1680,
    "paymentReceived": 1680,
    "paymentMode": "Cash"
  }
}
```

---

### GET /bills
Get all shop bills

**Query Parameters:**
- `shopId` (optional): Filter by shop
- `routeId` (optional): Filter by route
- `from` (optional): Start date
- `to` (optional): End date

---

### GET /bills/:billId
Get bill details

---

### GET /bills/shop/:shopId
Get all bills for a specific shop

---

### GET /bills/route/:routeId
Get all bills for a specific route

---

## 🔄 EMPTIES RETURNS API

### POST /empties-returns
Record empties return from shop

**Request Body:**
```json
{
  "shopId": "SHOP-001",
  "routeId": "ROUTE-A",
  "returnDate": "2026-02-09T16:00:00Z",
  "items": [
    {
      "productId": "thumbsup-rgb-300ml",
      "goodBottles": 40,
      "brokenBottles": 5
    },
    {
      "productId": "sprite-rgb-300ml",
      "goodBottles": 22,
      "brokenBottles": 0
    }
  ]
}
```

**What system does automatically:**
1. Fetches shop's expected empties from returnable balance
2. Calculates money collected (brokenBottles × ₹3)
3. Updates product empty stock (+good bottles)
4. Updates shop returnable balances (decreases)
5. Updates product returnable accounts
6. Generates return ID (RET-001, RET-002, etc.)

**Response:**
```json
{
  "success": true,
  "message": "Return RET-001 recorded successfully",
  "data": {
    "returnId": "RET-001",
    "shopId": "SHOP-001",
    "shopName": "Sai Traders",
    "returnDate": "2026-02-09T16:00:00Z",
    "items": [
      {
        "productId": "thumbsup-rgb-300ml",
        "expectedBottles": 48,
        "goodBottles": 40,
        "brokenBottles": 5,
        "totalReturned": 45,
        "missingBottles": 3,
        "moneyCollected": 15
      },
      {
        "productId": "sprite-rgb-300ml",
        "expectedBottles": 24,
        "goodBottles": 22,
        "brokenBottles": 0,
        "totalReturned": 22,
        "missingBottles": 2,
        "moneyCollected": 0
      }
    ],
    "totalMoneyCollected": 15
  }
}
```

---

### GET /empties-returns
Get all empties returns

**Query Parameters:**
- `shopId` (optional)
- `routeId` (optional)
- `from` (optional)
- `to` (optional)

---

### GET /empties-returns/:returnId
Get return details

---

## 📋 ROUTE BILLS API

### POST /route-bills
Create/finalize route bill

**Request Body:**
```json
{
  "routeId": "ROUTE-A",
  "routeDate": "2026-02-09T00:00:00Z",
  "driverName": "Ravi",
  "vehicleNumber": "TN-01-AB-1234",
  "shopBillIds": ["BILL-001", "BILL-002"],
  "stockLoaded": [
    {
      "productId": "thumbsup-rgb-300ml",
      "cases": 5,
      "looseBottles": 10
    }
  ]
}
```

**What system does:**
1. Fetches all shop bills
2. Calculates totals
3. Generates route bill ID (RB-001, RB-002, etc.)
4. Sets status to "Finalized"

**Response:**
```json
{
  "success": true,
  "message": "Route bill RB-001 finalized",
  "data": {
    "routeBillId": "RB-001",
    "routeId": "ROUTE-A",
    "routeDate": "2026-02-09T00:00:00Z",
    "totalShops": 2,
    "totalAmount": 1440,
    "status": "Finalized",
    "stockLoaded": [ /* ... */ ]
  }
}
```

---

### PUT /route-bills/:routeBillId/complete
Complete route bill after driver returns

**Request Body:**
```json
{
  "cashReceived": 1440,
  "emptiesCollected": [
    {
      "shopId": "SHOP-001",
      "items": [
        {
          "productId": "thumbsup-rgb-300ml",
          "goodBottles": 40,
          "brokenBottles": 5
        }
      ]
    },
    {
      "shopId": "SHOP-002",
      "items": [
        {
          "productId": "thumbsup-rgb-300ml",
          "goodBottles": 24,
          "brokenBottles": 0
        }
      ]
    }
  ],
  "routeExpenses": 900
}
```

**What system does:**
1. For each shop's empties:
   - Creates `empties_return` document
   - Updates product empty stock
   - Updates shop returnable balances
2. Calculates totals
3. Updates route bill status: "Finalized" → "Completed"

**Response:**
```json
{
  "success": true,
  "message": "Route bill RB-001 completed",
  "data": {
    "routeBillId": "RB-001",
    "status": "Completed",
    "cashReceived": 1440,
    "cashShortage": 0,
    "totalMoneyCollectedForBroken": 15,
    "routeExpenses": 900,
    "netForRoute": 540
  }
}
```

---

### GET /route-bills
Get all route bills

**Query Parameters:**
- `routeId` (optional)
- `status` (optional): Draft, Finalized, Completed
- `from` (optional)
- `to` (optional)

---

### GET /route-bills/:routeBillId
Get route bill details

---

## 📊 REPORTS API

### GET /reports/inventory
Current inventory report

**Response:**
```json
{
  "success": true,
  "data": {
    "totalProducts": 50,
    "totalValue": 250000,
    "byPackType": {
      "RGB": { "count": 15, "value": 80000 },
      "PET": { "count": 22, "value": 120000 }
    },
    "lowStock": [ /* products with < 2 cases */ ],
    "returnables": {
      "emptyStock": 250,
      "owedToCompanies": 1500,
      "owedByShops": 800,
      "shortage": 450
    }
  }
}
```

---

### GET /reports/sales
Sales report

**Query Parameters:**
- `from` (required): Start date
- `to` (required): End date
- `groupBy` (optional): day, week, month

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSales": 125000,
    "totalBills": 150,
    "byRoute": {
      "ROUTE-A": { "bills": 50, "amount": 45000 },
      "ROUTE-B": { "bills": 40, "amount": 38000 }
    },
    "byProduct": {
      "thumbsup-rgb-300ml": { "quantity": 2400, "amount": 48000 }
    },
    "timeline": [ /* daily/weekly/monthly breakdown */ ]
  }
}
```

---

### GET /reports/profit
Profit & loss report

**Query Parameters:**
- `from` (required)
- `to` (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "revenue": {
      "shopSales": 125000,
      "brokenBottleCollections": 500,
      "total": 125500
    },
    "expenses": {
      "companyPurchases": 80000,
      "transportBills": 5000,
      "brokenBottlePayments": 300,
      "routeExpenses": 12000,
      "total": 97300
    },
    "profit": {
      "cash": 28200,
      "inventoryValue": 250000,
      "total": 278200
    }
  }
}
```

---

### GET /reports/returnables
Returnables status report

**Response:**
```json
{
  "success": true,
  "data": {
    "byProduct": [
      {
        "productId": "thumbsup-rgb-300ml",
        "productName": "Thumbsup RGB 300ml",
        "emptyStock": 40,
        "owedToCompany": 320,
        "owedByShops": 120,
        "shortage": 160
      }
    ],
    "totals": {
      "emptyStock": 250,
      "owedToCompanies": 1500,
      "owedByShops": 800,
      "shortage": 450
    }
  }
}
```

---

### GET /reports/company-statement/:companyId
Company account statement

**Query Parameters:**
- `from` (optional)
- `to` (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "companyId": "CSD-001",
    "companyName": "CSD Flavour",
    "summary": {
      "totalPurchases": 10,
      "totalAmount": 50000,
      "totalPaid": 45000,
      "outstanding": 5000,
      "returnableBalances": [
        {
          "productId": "thumbsup-rgb-300ml",
          "emptiesOwed": 320
        }
      ]
    },
    "transactions": [ /* purchase history */ ]
  }
}
```

---

### GET /reports/shop-statement/:shopId
Shop account statement

**Query Parameters:**
- `from` (optional)
- `to` (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "shopId": "SHOP-001",
    "shopName": "Sai Traders",
    "summary": {
      "totalBills": 15,
      "totalAmount": 45000,
      "returnableBalances": [
        {
          "productId": "thumbsup-rgb-300ml",
          "emptiesOwed": 39
        }
      ],
      "moneyCollectedForBroken": 150
    },
    "transactions": [ /* bill and return history */ ]
  }
}
```

---

### GET /reports/route-performance
Route performance analysis

**Query Parameters:**
- `from` (optional)
- `to` (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "byRoute": [
      {
        "routeId": "ROUTE-A",
        "routeName": "Route A",
        "trips": 10,
        "totalRevenue": 26400,
        "totalExpenses": 9000,
        "netProfit": 17400,
        "averagePerTrip": 1740
      }
    ]
  }
}
```

---

## 🔐 AUTHENTICATION (if needed)

### POST /auth/login
User login

**Request Body:**
```json
{
  "username": "manager",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt-token-here",
  "user": {
    "userId": "USER-001",
    "username": "manager",
    "role": "admin"
  }
}
```

---

### POST /auth/logout
User logout

---

## 🛠️ UTILITY ENDPOINTS

### GET /health
Health check

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2026-02-09T15:30:00Z",
  "database": "Connected"
}
```

---

### POST /seed
Seed database with sample data (development only)

**Response:**
```json
{
  "success": true,
  "message": "Database seeded with sample data",
  "data": {
    "products": 10,
    "companies": 3,
    "shops": 15,
    "routes": 4
  }
}
```

---

## 📝 ERROR RESPONSES

All endpoints follow this error format:

```json
{
  "success": false,
  "error": "Error message here",
  "status": 400
}
```

**HTTP Status Codes:**
- 200: Success
- 201: Created
- 400: Bad Request (validation error)
- 404: Not Found
- 500: Internal Server Error

---

## 🔄 AUTOMATIC UPDATES SUMMARY

### When creating company purchase:
- ✅ products.filledStock (+)
- ✅ products.emptyStock.good (-)
- ✅ products.returnableAccounts.companyOwed (net change)
- ✅ companies.returnableProducts.emptiesOwed (net change)
- ✅ companies.outstandingAmount (+)

### When creating shop bill:
- ✅ products.filledStock (-)
- ✅ products.returnableAccounts.shopsOwed (+ for RGB items)
- ✅ shops.returnableProducts.emptiesOwed (+ for RGB items)

### When recording empties return:
- ✅ products.emptyStock.good (+)
- ✅ products.returnableAccounts.shopsOwed (-)
- ✅ shops.returnableProducts.emptiesOwed (-)

### When completing route bill:
- ✅ Creates empties_return documents for each shop
- ✅ All empties-related updates as above
- ✅ route_bills status update

---

**All 75+ API endpoints documented! ✅**
