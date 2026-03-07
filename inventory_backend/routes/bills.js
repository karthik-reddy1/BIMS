const express = require('express');
const router = express.Router();
const ShopBill = require('../models/ShopBill');
const Shop = require('../models/Shop');
const Product = require('../models/Product');
const { generateId, updateReturnableBalance, sendSuccess, sendError } = require('../utils/helpers');

// POST /api/bills - Create a new shop bill
router.post('/', async (req, res) => {
    try {
        const { shopId, routeId, billDate, items, paymentMode, paymentReceived } = req.body;

        // Fetch shop
        const shop = await Shop.findOne({ shopId: shopId.toUpperCase() });
        if (!shop) return sendError(res, 'Shop not found', 404);

        // Validate and enrich items
        const enrichedItems = [];
        for (const item of items) {
            const product = await Product.findOne({ productId: item.productId });
            if (!product) return sendError(res, `Product ${item.productId} not found`, 404);
            if (product.filledStock.totalBottles < item.quantity) {
                return sendError(res, `Insufficient stock for ${product.productName}. Available: ${product.filledStock.totalBottles}`, 400);
            }
            enrichedItems.push({
                productId: product.productId,
                productName: product.productName,
                size: product.size,
                packType: product.packType,
                quantity: item.quantity,
                mrp: product.mrp,
                isReturnable: product.isReturnable
            });
        }

        const billId = await generateId(ShopBill, 'BILL', 'billId');

        // Fetch Route safely if provided
        let safeRouteName = req.body.routeName || null;
        if (routeId) {
            const Route = require('../models/Route');
            const routeDoc = await Route.findOne({ routeId: routeId.toUpperCase() });
            if (routeDoc) safeRouteName = routeDoc.routeName;
        }

        const bill = await ShopBill.create({
            billId,
            shopId: shop.shopId,
            shopName: shop.shopName,
            routeId: routeId || null,
            routeName: safeRouteName,
            billDate,
            items: enrichedItems,
            paymentMode,
            paymentReceived
        });

        // Automatically assign shop to this route for future reference
        if (routeId && safeRouteName) {
            shop.routeId = routeId;
            shop.routeName = safeRouteName;
        }

        // Increment shop outstanding balance with new unpaid amount
        const unpaidAmount = bill.grandTotal - (paymentReceived || 0);
        shop.outstandingAmount = (shop.outstandingAmount || 0) + unpaidAmount;

        // ===== Update Product Stock & Returnables =====
        for (const item of bill.items) {
            const product = await Product.findOne({ productId: item.productId });
            if (!product) continue;

            // Decrease filled stock (prefer loose bottles first, then cases)
            let remaining = item.quantity;
            if (product.filledStock.looseBottles >= remaining) {
                product.filledStock.looseBottles -= remaining;
            } else {
                remaining -= product.filledStock.looseBottles;
                product.filledStock.looseBottles = 0;
                const casesNeeded = Math.ceil(remaining / product.bottlesPerCase);
                product.filledStock.cases = Math.max(0, product.filledStock.cases - casesNeeded);
                const newLoose = (casesNeeded * product.bottlesPerCase) - remaining;
                product.filledStock.looseBottles += newLoose;
            }

            // Update returnables for RGB
            if (product.isReturnable) {
                product.returnableAccounts.shopsOwed += item.quantity;
                updateReturnableBalance(shop.returnableProducts, item.productId, `${item.productName} ${item.size} ${item.packType}`, item.quantity);
            }

            await product.save();
        }

        await shop.save();

        sendSuccess(res, bill, `Bill ${billId} created successfully`, 201);
    } catch (err) {
        sendError(res, err.message);
    }
});

const RouteBill = require('../models/RouteBill');

// Helper to attach isLocked state
async function attachLockStatus(bills) {
    if (!Array.isArray(bills)) {
        const rb = await RouteBill.findOne({ shopBillIds: bills.billId });
        return { ...bills.toObject(), isLocked: !!rb };
    }

    // For arrays, fetch all route bills that might contain these
    const billIds = bills.map(b => b.billId);
    const rbs = await RouteBill.find({ shopBillIds: { $in: billIds } });

    // Create a Set of locked bill IDs for fast lookup
    const lockedIds = new Set();
    rbs.forEach(rb => {
        rb.shopBillIds.forEach(id => lockedIds.add(id));
    });

    return bills.map(b => ({
        ...b.toObject(),
        isLocked: lockedIds.has(b.billId)
    }));
}

// GET /api/bills
router.get('/', async (req, res) => {
    try {
        const filter = {};
        if (req.query.shopId) filter.shopId = req.query.shopId.toUpperCase();
        if (req.query.routeId) filter.routeId = req.query.routeId.toUpperCase();
        if (req.query.from || req.query.to) {
            filter.billDate = {};
            if (req.query.from) filter.billDate.$gte = new Date(req.query.from);
            if (req.query.to) filter.billDate.$lte = new Date(req.query.to);
        }
        const bills = await ShopBill.find(filter).sort({ billDate: -1 });
        const enriched = await attachLockStatus(bills);
        sendSuccess(res, enriched);
    } catch (err) {
        sendError(res, err.message);
    }
});

// GET /api/bills/shop/:shopId
router.get('/shop/:shopId', async (req, res) => {
    try {
        const bills = await ShopBill.find({ shopId: req.params.shopId.toUpperCase() }).sort({ billDate: -1 });
        const enriched = await attachLockStatus(bills);
        sendSuccess(res, enriched);
    } catch (err) {
        sendError(res, err.message);
    }
});

// GET /api/bills/route/:routeId
router.get('/route/:routeId', async (req, res) => {
    try {
        const bills = await ShopBill.find({ routeId: req.params.routeId.toUpperCase() }).sort({ billDate: -1 });
        const enriched = await attachLockStatus(bills);
        sendSuccess(res, enriched);
    } catch (err) {
        sendError(res, err.message);
    }
});

// PATCH /api/bills/:billId/route - Update a bill's route
router.patch('/:billId/route', async (req, res) => {
    try {
        const { routeId } = req.body;
        if (!routeId) return sendError(res, 'Route ID is required', 400);

        const bill = await ShopBill.findOne({ billId: req.params.billId.toUpperCase() });
        if (!bill) return sendError(res, 'Bill not found', 404);

        // Prevent changing route if the bill is already part of a Route Bill
        const existingRouteBill = await RouteBill.findOne({ shopBillIds: bill.billId });
        if (existingRouteBill) {
            return sendError(res, 'Cannot change route. This bill has already been processed in a Route Bill.', 400);
        }

        const Route = require('../models/Route');
        const routeDoc = await Route.findOne({ routeId: routeId.toUpperCase() });
        if (!routeDoc) return sendError(res, 'Route not found', 404);

        bill.routeId = routeDoc.routeId;
        bill.routeName = routeDoc.routeName;
        await bill.save();

        const enriched = await attachLockStatus(bill);
        sendSuccess(res, enriched, `Bill route updated to ${routeDoc.routeName}`);
    } catch (err) {
        sendError(res, err.message);
    }
});

// GET /api/bills/:billId (Keep this last to prevent masking other routes)
router.get('/:billId', async (req, res) => {
    try {
        const bill = await ShopBill.findOne({ billId: req.params.billId.toUpperCase() });
        if (!bill) return sendError(res, 'Bill not found', 404);
        const enriched = await attachLockStatus(bill);
        sendSuccess(res, enriched);
    } catch (err) {
        sendError(res, err.message);
    }
});

module.exports = router;
