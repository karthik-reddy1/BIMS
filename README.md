# VS Enterprises - Advanced Inventory & Billing System

A comprehensive, full-stack Point of Sale (POS) and Inventory Management System designed specifically for dynamic distribution businesses like beverage distributors. Built to handle complex daily operations beyond standard CRUD data storage, streamlining distribution routes, active thermal receipt printing, and deep business metric tracking.

## 🚀 Key Features (Beyond Standard CRUD)

### 1. Advanced Billing & Thermal Print Integration
- **Rapid POS Operations:** Custom checkout interfaces specialized for fast-paced environments. Dynamically calculate product subtotals, variations, MRP rules, and auto-generated date stamps.
- **Smart Receipt Generation:** Directly triggers browser-native optimized HTML thermal receipts. Formatted correctly out-of-the-box for thermal POS printers (80mm), elegantly dropping redundant user calculations (Amount Paid/Balance ledgers) when not needed for clean, simple business proof-of-purchases.

### 2. Specialized Distribution Route Tracking
Unlike simple inventory platforms, this system embraces *how* product moves:
- **Route-based Logic:** Group bills and shop deliveries by custom geographic or logical routes. Allows dispatchers to review analytics per active route rather than just top-level endpoints.
- **Shop-to-Route Mapping.** Manage dynamic buyer directories linked organically with transit plans.

### 3. Deep SKU & Inventory Attributes 
- Specialized handling for distributor-level variants including **Pack Types** (RGB, PET), **Returnable Asset states**, sizes, and complex MRP tracking over baseline SKU records.
- Actionable UI dashboards allowing instant stock reconciliation and visual alerts for low-capacity products.

### 4. Interactive Command Dashboards
- Multi-component React interfaces built with Shadcn UI & Tailwind CSS for aggressive, modern presentation. Includes instant "Quick Actions" for creating new bills and active state management monitoring live.

## 🛠 Tech Stack

- **Frontend:** React, Next.js / Vite, Tailwind CSS, Shadcn UI Components (Lucide icons, dialogs, modals, and responsive data tables).
- **Backend:** Node.js, Express.
- **Architecture:** Decoupled REST API routing separated by logical business needs (`/routes/purchases.js`, `/routes/routeBills.js`).

## 💿 Installation & Setup

1. **Clone the repository:**
   \`\`\`bash
   git clone https://github.com/karthik-reddy1/BIMS.git
   cd BIMS
   \`\`\`

2. **Backend Setup:**
   \`\`\`bash
   cd inventory_backend
   npm install
   node server.js
   \`\`\`

3. **Frontend Setup:**
   \`\`\`bash
   cd frontend
   npm install
   npm run dev
   \`\`\`

4. **Start Distributing:** Navigate to your local host port provided by your front-end bundle and explore your active dashboard.
