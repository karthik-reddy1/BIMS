const express = require('express');
const router = express.Router();
const EmptiesReturn = require('../models/EmptiesReturn');
const Shop = require('../models/Shop');
const Product = require('../models/Product');
const { generateId, updateReturnableBalance, sendSuccess, sendError } = require('../utils/helpers');

// POST /api/empties-returns - Record empties return from a shop
router.post('/', async (req, res) => {
    try {
        const { shopId, routeId, returnDate, items, routeBillId } = req.body;

        const shop = await Shop.findOne({ shopId: shopId.toUpperCase() });
        if (!shop) return sendError(res, 'Shop not found', 404);

        // Enrich items with expected balances from shop's returnableProducts
        const enrichedItems = [];
        for (const item of items) {
            const product = await Product.findOne({ productId: item.productId });
            if (!product || !product.isReturnable) continue;

            const shopBalance = shop.returnableProducts.find(r => r.productId === item.productId);
            const expectedBottles = shopBalance ? shopBalance.emptiesOwed : 0;

            enrichedItems.push({
                productId: item.productId,
                productName: product.productName,
                expectedBottles,
                goodBottles: item.goodBottles || 0,
                brokenBottles: item.brokenBottles || 0
            });
        }

        const returnId = await generateId(EmptiesReturn, 'RET', 'returnId');

        const ret = await EmptiesReturn.create({
            returnId,
            shopId: shop.shopId,
            shopName: shop.shopName,
            routeId: routeId || null,
            returnDate,
            routeBillId: routeBillId || null,
            items: enrichedItems
        });

        // ===== Update Product & Shop Balances =====
        for (const item of ret.items) {
            const product = await Product.findOne({ productId: item.productId });
            if (!product) continue;

            // Add good bottles to product empty stock
            product.emptyStock.good += item.goodBottles;

            // Decrease product shopsOwed
            product.returnableAccounts.shopsOwed = Math.max(0, product.returnableAccounts.shopsOwed - item.totalReturned);

            // Decrease shop returnableProducts balance
            updateReturnableBalance(shop.returnableProducts, item.productId, item.productName, -item.totalReturned);

            await product.save();
        }
        await shop.save();

        sendSuccess(res, ret, `Return ${returnId} recorded successfully`, 201);
    } catch (err) {
        sendError(res, err.message);
    }
});

// GET /api/empties-returns
router.get('/', async (req, res) => {
    try {
        const filter = {};
        if (req.query.shopId) filter.shopId = req.query.shopId.toUpperCase();
        if (req.query.routeId) filter.routeId = req.query.routeId.toUpperCase();
        if (req.query.from || req.query.to) {
            filter.returnDate = {};
            if (req.query.from) filter.returnDate.$gte = new Date(req.query.from);
            if (req.query.to) filter.returnDate.$lte = new Date(req.query.to);
        }
        const returns = await EmptiesReturn.find(filter).sort({ returnDate: -1 });
        sendSuccess(res, returns);
    } catch (err) {
        sendError(res, err.message);
    }
});

// GET /api/empties-returns/:returnId
router.get('/:returnId', async (req, res) => {
    try {
        const ret = await EmptiesReturn.findOne({ returnId: req.params.returnId.toUpperCase() });
        if (!ret) return sendError(res, 'Return record not found', 404);
        sendSuccess(res, ret);
    } catch (err) {
        sendError(res, err.message);
    }
});

module.exports = router;
