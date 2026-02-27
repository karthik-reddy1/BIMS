export type EmptyBreakdown = {
  productId: string
  productName: string
  empties: number
}

export type Purchase = {
  id: string
  date: string
  amount: number
  status: "paid" | "pending" | "partial"
}

export type Company = {
  id: string
  name: string
  contactPerson: string
  phone: string
  address: string
  paymentTerms: number
  status: "active" | "inactive"
  outstanding: number
  lastPurchase: string
  emptiesOwed: number
  emptiesBreakdown: EmptyBreakdown[]
  purchases: Purchase[]
}

export type RGBProduct = {
  id: string
  name: string
  packType: string
  bottlesPerCase: number
  casePrice: number
  availableGood: number
  availableBroken: number
}

export const companies: Company[] = [
  {
    id: "CSD-001",
    name: "CSD Flavour (Coca-Cola)",
    contactPerson: "Rajesh Kumar",
    phone: "9876543210",
    address: "Industrial Area, Phase 2, Hyderabad",
    paymentTerms: 7,
    status: "active",
    outstanding: 5000,
    lastPurchase: "2 days ago",
    emptiesOwed: 560,
    emptiesBreakdown: [
      { productId: "thumbsup-rgb-300ml", productName: "Thumbsup RGB 300ml", empties: 320 },
      { productId: "sprite-rgb-300ml", productName: "Sprite RGB 300ml", empties: 240 },
    ],
    purchases: [
      { id: "PUR-001", date: "Feb 24, 2026", amount: 3500, status: "pending" },
      { id: "PUR-002", date: "Feb 20, 2026", amount: 2800, status: "paid" },
      { id: "PUR-003", date: "Feb 15, 2026", amount: 1500, status: "pending" },
      { id: "PUR-004", date: "Feb 10, 2026", amount: 4200, status: "paid" },
      { id: "PUR-005", date: "Feb 5, 2026", amount: 3100, status: "paid" },
      { id: "PUR-006", date: "Jan 30, 2026", amount: 2600, status: "paid" },
      { id: "PUR-007", date: "Jan 25, 2026", amount: 1800, status: "paid" },
      { id: "PUR-008", date: "Jan 20, 2026", amount: 3400, status: "paid" },
      { id: "PUR-009", date: "Jan 15, 2026", amount: 2200, status: "paid" },
      { id: "PUR-010", date: "Jan 10, 2026", amount: 2900, status: "paid" },
    ],
  },
  {
    id: "MAZ-001",
    name: "Maaza Company",
    contactPerson: "Suresh Patel",
    phone: "9876543211",
    address: "Food Park, Gachibowli, Hyderabad",
    paymentTerms: 10,
    status: "active",
    outstanding: 2500,
    lastPurchase: "3 days ago",
    emptiesOwed: 180,
    emptiesBreakdown: [
      { productId: "maaza-rgb-200ml", productName: "Maaza RGB 200ml", empties: 180 },
    ],
    purchases: [
      { id: "PUR-011", date: "Feb 23, 2026", amount: 2500, status: "pending" },
      { id: "PUR-012", date: "Feb 18, 2026", amount: 1800, status: "paid" },
      { id: "PUR-013", date: "Feb 12, 2026", amount: 3200, status: "paid" },
      { id: "PUR-014", date: "Feb 6, 2026", amount: 2100, status: "paid" },
      { id: "PUR-015", date: "Jan 31, 2026", amount: 1600, status: "paid" },
      { id: "PUR-016", date: "Jan 26, 2026", amount: 2900, status: "paid" },
      { id: "PUR-017", date: "Jan 21, 2026", amount: 2400, status: "paid" },
      { id: "PUR-018", date: "Jan 16, 2026", amount: 1900, status: "paid" },
      { id: "PUR-019", date: "Jan 11, 2026", amount: 3500, status: "paid" },
      { id: "PUR-020", date: "Jan 6, 2026", amount: 2700, status: "paid" },
    ],
  },
  {
    id: "PAR-001",
    name: "Parle Agro",
    contactPerson: "Vikram Singh",
    phone: "9876543212",
    address: "MIDC Area, Nagpur",
    paymentTerms: 14,
    status: "active",
    outstanding: 0,
    lastPurchase: "5 days ago",
    emptiesOwed: 120,
    emptiesBreakdown: [
      { productId: "frooti-rgb-200ml", productName: "Frooti RGB 200ml", empties: 120 },
    ],
    purchases: [
      { id: "PUR-021", date: "Feb 21, 2026", amount: 4100, status: "paid" },
      { id: "PUR-022", date: "Feb 14, 2026", amount: 2300, status: "paid" },
      { id: "PUR-023", date: "Feb 7, 2026", amount: 3800, status: "paid" },
      { id: "PUR-024", date: "Jan 31, 2026", amount: 2600, status: "paid" },
      { id: "PUR-025", date: "Jan 24, 2026", amount: 1900, status: "paid" },
      { id: "PUR-026", date: "Jan 17, 2026", amount: 3100, status: "paid" },
      { id: "PUR-027", date: "Jan 10, 2026", amount: 2800, status: "paid" },
      { id: "PUR-028", date: "Jan 3, 2026", amount: 2200, status: "paid" },
      { id: "PUR-029", date: "Dec 27, 2025", amount: 3600, status: "paid" },
      { id: "PUR-030", date: "Dec 20, 2025", amount: 2500, status: "paid" },
    ],
  },
  {
    id: "BIS-001",
    name: "Bisleri",
    contactPerson: "Amit Sharma",
    phone: "9876543213",
    address: "Sector 12, Noida",
    paymentTerms: 7,
    status: "active",
    outstanding: 1200,
    lastPurchase: "1 day ago",
    emptiesOwed: 0,
    emptiesBreakdown: [],
    purchases: [
      { id: "PUR-031", date: "Feb 25, 2026", amount: 1200, status: "pending" },
      { id: "PUR-032", date: "Feb 22, 2026", amount: 900, status: "paid" },
      { id: "PUR-033", date: "Feb 19, 2026", amount: 1500, status: "paid" },
      { id: "PUR-034", date: "Feb 16, 2026", amount: 800, status: "paid" },
      { id: "PUR-035", date: "Feb 13, 2026", amount: 1100, status: "paid" },
      { id: "PUR-036", date: "Feb 10, 2026", amount: 1300, status: "paid" },
      { id: "PUR-037", date: "Feb 7, 2026", amount: 700, status: "paid" },
      { id: "PUR-038", date: "Feb 4, 2026", amount: 1000, status: "paid" },
      { id: "PUR-039", date: "Feb 1, 2026", amount: 1400, status: "paid" },
      { id: "PUR-040", date: "Jan 29, 2026", amount: 600, status: "paid" },
    ],
  },
  {
    id: "RDB-001",
    name: "Red Bull India",
    contactPerson: "Priya Mehta",
    phone: "9876543214",
    address: "BKC Complex, Mumbai",
    paymentTerms: 15,
    status: "active",
    outstanding: 800,
    lastPurchase: "4 days ago",
    emptiesOwed: 0,
    emptiesBreakdown: [],
    purchases: [
      { id: "PUR-041", date: "Feb 22, 2026", amount: 800, status: "pending" },
      { id: "PUR-042", date: "Feb 15, 2026", amount: 1200, status: "paid" },
      { id: "PUR-043", date: "Feb 8, 2026", amount: 900, status: "paid" },
      { id: "PUR-044", date: "Feb 1, 2026", amount: 1500, status: "paid" },
      { id: "PUR-045", date: "Jan 25, 2026", amount: 1100, status: "paid" },
      { id: "PUR-046", date: "Jan 18, 2026", amount: 700, status: "paid" },
      { id: "PUR-047", date: "Jan 11, 2026", amount: 1300, status: "paid" },
      { id: "PUR-048", date: "Jan 4, 2026", amount: 800, status: "paid" },
      { id: "PUR-049", date: "Dec 28, 2025", amount: 1000, status: "paid" },
      { id: "PUR-050", date: "Dec 21, 2025", amount: 600, status: "paid" },
    ],
  },
  {
    id: "PEP-001",
    name: "PepsiCo",
    contactPerson: "Arun Nair",
    phone: "9876543215",
    address: "Whitefield, Bangalore",
    paymentTerms: 7,
    status: "active",
    outstanding: 3500,
    lastPurchase: "1 day ago",
    emptiesOwed: 440,
    emptiesBreakdown: [
      { productId: "pepsi-rgb-300ml", productName: "Pepsi RGB 300ml", empties: 280 },
      { productId: "mirinda-rgb-300ml", productName: "Mirinda RGB 300ml", empties: 160 },
    ],
    purchases: [
      { id: "PUR-051", date: "Feb 25, 2026", amount: 3500, status: "pending" },
      { id: "PUR-052", date: "Feb 22, 2026", amount: 2800, status: "paid" },
      { id: "PUR-053", date: "Feb 19, 2026", amount: 4100, status: "paid" },
      { id: "PUR-054", date: "Feb 16, 2026", amount: 1900, status: "paid" },
      { id: "PUR-055", date: "Feb 13, 2026", amount: 3200, status: "paid" },
      { id: "PUR-056", date: "Feb 10, 2026", amount: 2500, status: "paid" },
      { id: "PUR-057", date: "Feb 7, 2026", amount: 1700, status: "paid" },
      { id: "PUR-058", date: "Feb 4, 2026", amount: 3800, status: "paid" },
      { id: "PUR-059", date: "Feb 1, 2026", amount: 2100, status: "paid" },
      { id: "PUR-060", date: "Jan 29, 2026", amount: 2900, status: "paid" },
    ],
  },
]

export const companyRGBProducts: Record<string, RGBProduct[]> = {
  "CSD-001": [
    { id: "thumbsup-rgb-300ml", name: "Thumbsup RGB 300ml", packType: "RGB", bottlesPerCase: 24, casePrice: 300, availableGood: 40, availableBroken: 5 },
    { id: "sprite-rgb-300ml", name: "Sprite RGB 300ml", packType: "RGB", bottlesPerCase: 24, casePrice: 280, availableGood: 30, availableBroken: 3 },
    { id: "fanta-rgb-300ml", name: "Fanta RGB 300ml", packType: "RGB", bottlesPerCase: 24, casePrice: 280, availableGood: 25, availableBroken: 2 },
  ],
  "MAZ-001": [
    { id: "maaza-rgb-200ml", name: "Maaza RGB 200ml", packType: "RGB", bottlesPerCase: 24, casePrice: 220, availableGood: 50, availableBroken: 4 },
  ],
  "PAR-001": [
    { id: "frooti-rgb-200ml", name: "Frooti RGB 200ml", packType: "RGB", bottlesPerCase: 24, casePrice: 200, availableGood: 35, availableBroken: 2 },
  ],
  "PEP-001": [
    { id: "pepsi-rgb-300ml", name: "Pepsi RGB 300ml", packType: "RGB", bottlesPerCase: 24, casePrice: 290, availableGood: 45, availableBroken: 6 },
    { id: "mirinda-rgb-300ml", name: "Mirinda RGB 300ml", packType: "RGB", bottlesPerCase: 24, casePrice: 270, availableGood: 20, availableBroken: 1 },
  ],
}

export const companyProducts = [
  { id: "thumbsup-rgb-300ml", name: "Thumbsup RGB 300ml", packType: "RGB", bottlesPerCase: 24, casePrice: 300, companyId: "CSD-001" },
  { id: "sprite-rgb-300ml", name: "Sprite RGB 300ml", packType: "RGB", bottlesPerCase: 24, casePrice: 280, companyId: "CSD-001" },
  { id: "fanta-rgb-300ml", name: "Fanta RGB 300ml", packType: "RGB", bottlesPerCase: 24, casePrice: 280, companyId: "CSD-001" },
  { id: "coke-pet-500ml", name: "Coke PET 500ml", packType: "PET", bottlesPerCase: 24, casePrice: 420, companyId: "CSD-001" },
  { id: "coke-can-330ml", name: "Coke CAN 330ml", packType: "CAN", bottlesPerCase: 24, casePrice: 600, companyId: "CSD-001" },
  { id: "maaza-rgb-200ml", name: "Maaza RGB 200ml", packType: "RGB", bottlesPerCase: 24, casePrice: 220, companyId: "MAZ-001" },
  { id: "maaza-pet-600ml", name: "Maaza PET 600ml", packType: "PET", bottlesPerCase: 24, casePrice: 360, companyId: "MAZ-001" },
  { id: "frooti-rgb-200ml", name: "Frooti RGB 200ml", packType: "RGB", bottlesPerCase: 24, casePrice: 200, companyId: "PAR-001" },
  { id: "frooti-pet-500ml", name: "Frooti PET 500ml", packType: "PET", bottlesPerCase: 24, casePrice: 340, companyId: "PAR-001" },
  { id: "bisleri-1l", name: "Bisleri 1L", packType: "PET", bottlesPerCase: 12, casePrice: 180, companyId: "BIS-001" },
  { id: "bisleri-500ml", name: "Bisleri 500ml", packType: "PET", bottlesPerCase: 24, casePrice: 200, companyId: "BIS-001" },
  { id: "redbull-250ml", name: "Red Bull 250ml", packType: "CAN", bottlesPerCase: 24, casePrice: 2400, companyId: "RDB-001" },
  { id: "pepsi-rgb-300ml", name: "Pepsi RGB 300ml", packType: "RGB", bottlesPerCase: 24, casePrice: 290, companyId: "PEP-001" },
  { id: "mirinda-rgb-300ml", name: "Mirinda RGB 300ml", packType: "RGB", bottlesPerCase: 24, casePrice: 270, companyId: "PEP-001" },
  { id: "pepsi-pet-500ml", name: "Pepsi PET 500ml", packType: "PET", bottlesPerCase: 24, casePrice: 400, companyId: "PEP-001" },
]
