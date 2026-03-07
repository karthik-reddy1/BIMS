const express = require('express');
const router = express.Router();
const Shop = require('../models/Shop');
const { sendSuccess, sendError } = require('../utils/helpers');

// GET /api/shops
router.get('/', async (req, res) => {
    try {
        const filter = {};
        if (req.query.routeId) filter.routeId = req.query.routeId.toUpperCase();
        const shops = await Shop.find(filter).sort({ shopName: 1 });
        sendSuccess(res, shops);
    } catch (err) {
        sendError(res, err.message);
    }
});

// GET /api/shops/route/:routeId
router.get('/route/:routeId', async (req, res) => {
    try {
        const shops = await Shop.find({ routeId: req.params.routeId.toUpperCase() }).sort({ shopName: 1 });
        sendSuccess(res, shops);
    } catch (err) {
        sendError(res, err.message);
    }
});

// POST /api/shops
router.post('/', async (req, res) => {
    try {
        const shop = await Shop.create(req.body);
        sendSuccess(res, shop, 'Shop created successfully', 201);
    } catch (err) {
        if (err.code === 11000) return sendError(res, 'Shop ID already exists', 400);
        sendError(res, err.message);
    }
});

// GET /api/shops/:shopId
router.get('/:shopId', async (req, res) => {
    try {
        const shop = await Shop.findOne({ shopId: req.params.shopId.toUpperCase() });
        if (!shop) return sendError(res, 'Shop not found', 404);
        sendSuccess(res, shop);
    } catch (err) {
        sendError(res, err.message);
    }
});

// PUT /api/shops/:shopId
router.put('/:shopId', async (req, res) => {
    try {
        delete req.body.shopId;
        const shop = await Shop.findOneAndUpdate(
            { shopId: req.params.shopId.toUpperCase() },
            req.body,
            { new: true, runValidators: true }
        );
        if (!shop) return sendError(res, 'Shop not found', 404);
        sendSuccess(res, shop, 'Shop updated');
    } catch (err) {
        sendError(res, err.message);
    }
});

// POST /api/shops/:shopId/payment
router.post('/:shopId/payment', async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || amount <= 0) return sendError(res, 'Invalid payment amount', 400);

        const shop = await Shop.findOne({ shopId: req.params.shopId.toUpperCase() });
        if (!shop) return sendError(res, 'Shop not found', 404);

        shop.outstandingAmount = Math.max(0, (shop.outstandingAmount || 0) - amount);
        await shop.save();

        sendSuccess(res, shop, `Payment of ₹${amount} recorded for ${shop.shopName}`);
    } catch (err) {
        sendError(res, err.message);
    }
});

// DELETE /api/shops/:shopId
router.delete('/:shopId', async (req, res) => {
    try {
        const shop = await Shop.findOneAndDelete({ shopId: req.params.shopId.toUpperCase() });
        if (!shop) return sendError(res, 'Shop not found', 404);
        sendSuccess(res, null, 'Shop deleted');
    } catch (err) {
        sendError(res, err.message);
    }
});

module.exports = router;
