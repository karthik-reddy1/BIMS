// ─────────────────────────────────────────────
// Shared TypeScript types matching MongoDB models
// ─────────────────────────────────────────────

// ── Product ──────────────────────────────────
export interface ApiProduct {
    _id: string
    productId: string
    brand: string
    productName: string          // serves as both name and group key (e.g. "Thumbsup")
    size: string
    packType: 'RGB' | 'PET' | 'CAN' | 'TTP' | 'MTP'
    isReturnable: boolean
    mrp: number
    bottlesPerCase: number
    casePrice: number
    perBottlePrice: number
    brokenPrice: number
    filledStock: {
        cases: number
        looseBottles: number
        totalBottles: number
    }
    emptyStock: {
        good: number
        broken: number
        total: number
    }
    returnableAccounts: {
        companyOwed: number
        shopsOwed: number
    }
    shortage?: number   // virtual from backend
    createdAt: string
    updatedAt: string
}

// ── Company ───────────────────────────────────
export interface ApiReturnableProduct {
    productId: string
    productName: string
    emptiesOwed: number
    lastUpdated: string
}

export interface ApiCompany {
    _id: string
    companyId: string
    companyName: string
    contactPerson?: string
    phone?: string
    address?: string
    paymentTerms: number
    outstandingAmount: number
    returnableProducts: ApiReturnableProduct[]
    createdAt: string
    updatedAt: string
}

// ── Shop ──────────────────────────────────────
export interface ApiShop {
    _id: string
    shopId: string
    shopName: string
    ownerName?: string
    phone?: string
    address?: string
    routeId?: string
    routeName?: string
    outstandingAmount: number
    returnableProducts: ApiReturnableProduct[]
    createdAt: string
    updatedAt: string
}

// ── Route ─────────────────────────────────────
export interface ApiRoute {
    _id: string
    routeId: string
    routeName: string
    description?: string
    shops?: string[]
    activeBills?: ApiShopBill[]
    createdAt: string
    updatedAt: string
}

// ── Company Purchase ──────────────────────────
export interface ApiPurchaseItem {
    productId: string
    productName: string
    packType: string
    cases: number
    bottlesPerCase: number
    totalBottles: number
    casePrice: number
    itemTotal: number
}

export interface ApiEmptyReturn {
    productId: string
    productName: string
    goodReturning: number
    brokenReturning: number
    brokenPayment: number
}

export interface ApiPurchase {
    _id: string
    purchaseId: string
    companyId: string
    companyName: string
    purchaseDate: string
    items: ApiPurchaseItem[]
    emptiesReturning: ApiEmptyReturn[]
    productTotal: number
    transportBill: number
    brokenPayment: number
    grandTotal: number
    paymentStatus: 'pending' | 'partial' | 'paid'
    amountPaid?: number
    amountDue?: number
    createdAt: string
    updatedAt: string
}

// ── Shop Bill ─────────────────────────────────
export interface ApiBillItem {
    productId: string
    productName: string
    size: string
    packType: string
    quantity: number
    mrp: number
    isReturnable: boolean
    bottlesPerCase?: number
}

export interface ApiShopBill {
    _id: string
    billId: string
    shopId: string
    shopName: string
    routeId?: string
    routeName?: string
    billDate: string
    items: ApiBillItem[]
    itemsTotal: number
    grandTotal: number
    paymentMode: 'Cash' | 'UPI' | 'Credit'
    paymentReceived: number
    createdAt: string
    updatedAt: string
    isLocked?: boolean
}

// ── Empties Return ────────────────────────────
export interface ApiEmptiesReturn {
    _id: string
    returnId: string
    shopId: string
    shopName: string
    routeId?: string
    returnDate: string
    items: {
        productId: string
        productName: string
        goodReturned: number
        brokenReturned: number
        brokenPayment: number
    }[]
    totalBrokenPayment: number
    createdAt: string
    updatedAt: string
}
