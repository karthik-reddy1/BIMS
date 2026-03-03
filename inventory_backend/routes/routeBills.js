const express = require('express');
const router = express.Router();
const RouteBill = require('../models/RouteBill');
const ShopBill = require('../models/ShopBill');
const EmptiesReturn = require('../models/EmptiesReturn');
const Shop = require('../models/Shop');
const Product = require('../models/Product');
const { generateId, updateReturnableBalance, sendSuccess, sendError } = require('../utils/helpers');

// POST /api/route-bills - Create/Finalize a route bill
router.post('/', async (req, res) => {
    try {
        const { routeId, routeName, routeDate, driverName, vehicleNumber, shopBillIds, stockLoaded } = req.body;

        // Fetch shop bills and sum totals
        const bills = await ShopBill.find({ billId: { $in: shopBillIds } });
        const totalAmount = bills.reduce((sum, b) => sum + b.grandTotal, 0);

        // Enrich stockLoaded if provided
        const enrichedStock = [];
        if (stockLoaded) {
            for (const s of stockLoaded) {
                const product = await Product.findOne({ productId: s.productId });
                const bottlesPerCase = product ? product.bottlesPerCase : 24;
                enrichedStock.push({
                    productId: s.productId,
                    productName: product ? product.productName : s.productId,
                    cases: s.cases || 0,
                    looseBottles: s.looseBottles || 0,
                    totalBottles: ((s.cases || 0) * bottlesPerCase) + (s.looseBottles || 0)
                });
            }
        }

        const routeBillId = await generateId(RouteBill, 'RB', 'routeBillId');

        const routeBill = await RouteBill.create({
            routeBillId,
            routeId: routeId.toUpperCase(),
            routeName,
            routeDate,
            driverName,
            vehicleNumber,
            shopBillIds,
            totalShops: bills.length,
            totalAmount,
            stockLoaded: enrichedStock,
            status: 'Finalized',
            finalizedAt: new Date()
        });

        sendSuccess(res, routeBill, `Route bill ${routeBillId} finalized`, 201);
    } catch (err) {
        sendError(res, err.message);
    }
});

// PUT /api/route-bills/:routeBillId/complete - Complete route bill after driver returns
router.put('/:routeBillId/complete', async (req, res) => {
    try {
        const { cashReceived, shopCollections, routeExpenses } = req.body;
        const routeBill = await RouteBill.findOne({ routeBillId: req.params.routeBillId.toUpperCase() });
        if (!routeBill) return sendError(res, 'Route bill not found', 404);
        if (routeBill.status === 'Completed') return sendError(res, 'Route bill already completed', 400);

        // ===== Process Collections per shop =====
        const retCount = await EmptiesReturn.countDocuments();
        let retCounter = retCount;
        for (const shopCollection of (shopCollections || [])) {
            const shop = await Shop.findOne({ shopId: shopCollection.shopId.toUpperCase() });
            if (!shop) continue;

            // Reduce shop's outstanding balance by cash paid
            const cashPaid = parseFloat(shopCollection.cashCollected) || 0;
            shop.outstandingAmount = Math.max(0, shop.outstandingAmount - cashPaid);

            const items = [];
            for (const item of (shopCollection.items || [])) {
                const product = await Product.findOne({ productId: item.productId });
                if (!product || !product.isReturnable) continue;

                const shopBalance = shop.returnableProducts.find(r => r.productId === item.productId);
                items.push({
                    productId: item.productId,
                    productName: product.productName,
                    expectedBottles: shopBalance ? shopBalance.emptiesOwed : 0,
                    goodBottles: item.goodBottles || 0,
                    brokenBottles: item.brokenBottles || 0
                });

                // Update product empty stock
                product.emptyStock.good += (item.goodBottles || 0);
                // Decrease product shopsOwed
                const totalReturned = (item.goodBottles || 0) + (item.brokenBottles || 0);
                product.returnableAccounts.shopsOwed = Math.max(0, product.returnableAccounts.shopsOwed - totalReturned);
                updateReturnableBalance(shop.returnableProducts, item.productId, product.productName, -totalReturned);
                await product.save();
            }
            await shop.save();

            // Create an EmptiesReturn document for each shop
            retCounter++;
            const retId = `RET-${String(retCounter).padStart(3, '0')}`;
            await EmptiesReturn.create({
                returnId: retId,
                shopId: shop.shopId,
                shopName: shop.shopName,
                routeId: routeBill.routeId,
                returnDate: new Date(),
                routeBillId: routeBill.routeBillId,
                items
            });
        }

        // Update route bill
        routeBill.cashReceived = cashReceived || 0;
        routeBill.shopCollections = shopCollections || [];
        routeBill.routeExpenses = routeExpenses || 0;
        routeBill.status = 'Completed';
        routeBill.completedAt = new Date();
        await routeBill.save();

        sendSuccess(res, routeBill, `Route bill ${routeBill.routeBillId} completed`);
    } catch (err) {
        sendError(res, err.message);
    }
});

// GET /api/route-bills
router.get('/', async (req, res) => {
    try {
        const filter = {};
        if (req.query.routeId) filter.routeId = req.query.routeId.toUpperCase();
        if (req.query.status) filter.status = req.query.status;
        if (req.query.from || req.query.to) {
            filter.routeDate = {};
            if (req.query.from) filter.routeDate.$gte = new Date(req.query.from);
            if (req.query.to) filter.routeDate.$lte = new Date(req.query.to);
        }
        const routeBills = await RouteBill.find(filter).sort({ routeDate: -1 });
        sendSuccess(res, routeBills);
    } catch (err) {
        sendError(res, err.message);
    }
});

// GET /api/route-bills/:routeBillId
router.get('/:routeBillId', async (req, res) => {
    try {
        const routeBill = await RouteBill.findOne({ routeBillId: req.params.routeBillId.toUpperCase() });
        if (!routeBill) return sendError(res, 'Route bill not found', 404);
        sendSuccess(res, routeBill);
    } catch (err) {
        sendError(res, err.message);
    }
});

module.exports = router;
