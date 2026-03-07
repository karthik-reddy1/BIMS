const express = require('express');
const router = express.Router();
const RouteBill = require('../models/RouteBill');
const ShopBill = require('../models/ShopBill');
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
        for (const shopCollection of (shopCollections || [])) {
            const shop = await Shop.findOne({ shopId: shopCollection.shopId.toUpperCase() });
            if (!shop) continue;

            // Reduce shop's outstanding balance by cash paid
            const cashPaid = parseFloat(shopCollection.cashCollected) || 0;
            shop.outstandingAmount = Math.max(0, shop.outstandingAmount - cashPaid);

            for (const item of (shopCollection.items || [])) {
                const product = await Product.findOne({ productId: item.productId });
                if (!product || !product.isReturnable) continue;

                const goodReturned = item.goodBottles || 0;
                const brokenReturned = item.brokenBottles || 0;
                const totalReturned = goodReturned + brokenReturned;

                // Good bottles come into our warehouse as good empties
                product.emptyStock.good += goodReturned;
                // Broken bottles come into our warehouse as broken empties
                product.emptyStock.broken += brokenReturned;
                // These bottles are now back in our warehouse → we owe fewer to the company
                product.returnableAccounts.companyOwed = Math.max(0, product.returnableAccounts.companyOwed - totalReturned);
                // Shops no longer owe us these bottles
                product.returnableAccounts.shopsOwed = Math.max(0, product.returnableAccounts.shopsOwed - totalReturned);

                // Update the shop's individual returnable balance
                updateReturnableBalance(shop.returnableProducts, item.productId, product.productName, -totalReturned);
                await product.save();
            }
            await shop.save();

            // EmptiesReturn record creation removed — shopCollections in RouteBill serves as the record
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
