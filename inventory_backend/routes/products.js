const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { sendSuccess, sendError } = require('../utils/helpers');

// GET /api/products/summary/stock  (defined BEFORE /:productId to avoid param conflict)
router.get('/summary/stock', async (req, res) => {
    try {
        const products = await Product.find();
        const byPackType = {};
        let totalEmptiesGood = 0, totalEmptiesBroken = 0;
        let totalCompanyOwed = 0, totalShopsOwed = 0;
        const lowStock = [];

        products.forEach(p => {
            byPackType[p.packType] = (byPackType[p.packType] || 0) + 1;
            if (p.isReturnable) {
                totalEmptiesGood += p.emptyStock.good;
                totalEmptiesBroken += p.emptyStock.broken;
                totalCompanyOwed += p.returnableAccounts.companyOwed;
                totalShopsOwed += p.returnableAccounts.shopsOwed;
            }
            if (p.filledStock.cases < 2) {
                lowStock.push({ productId: p.productId, productName: p.productName, cases: p.filledStock.cases, bottles: p.filledStock.looseBottles });
            }
        });

        sendSuccess(res, {
            totalProducts: products.length,
            byPackType,
            lowStock,
            returnables: {
                totalEmptiesInStock: totalEmptiesGood + totalEmptiesBroken,
                totalEmptiesGood,
                totalEmptiesBroken,
                totalOwedToCompanies: totalCompanyOwed,
                totalOwedByShops: totalShopsOwed,
                shortage: totalCompanyOwed - totalEmptiesGood - totalShopsOwed
            }
        });
    } catch (err) {
        sendError(res, err.message);
    }
});

// GET /api/products
router.get('/', async (req, res) => {
    try {
        const filter = {};
        if (req.query.packType) filter.packType = req.query.packType.toUpperCase();
        if (req.query.brand) filter.brand = { $regex: req.query.brand, $options: 'i' };
        if (req.query.isReturnable !== undefined) filter.isReturnable = req.query.isReturnable === 'true';
        const products = await Product.find(filter).sort({ productName: 1 });
        sendSuccess(res, products);
    } catch (err) {
        sendError(res, err.message);
    }
});

// POST /api/products
router.post('/', async (req, res) => {
    try {
        const product = await Product.create(req.body);
        sendSuccess(res, product, 'Product created successfully', 201);
    } catch (err) {
        if (err.code === 11000) return sendError(res, 'Product ID already exists', 400);
        sendError(res, err.message);
    }
});

// GET /api/products/:productId
router.get('/:productId', async (req, res) => {
    try {
        const product = await Product.findOne({ productId: req.params.productId });
        if (!product) return sendError(res, 'Product not found', 404);
        sendSuccess(res, product);
    } catch (err) {
        sendError(res, err.message);
    }
});

// PUT /api/products/:productId
router.put('/:productId', async (req, res) => {
    try {
        // Prevent changing productId or packType
        delete req.body.productId;
        delete req.body.packType;
        const product = await Product.findOneAndUpdate(
            { productId: req.params.productId },
            req.body,
            { new: true, runValidators: true }
        );
        if (!product) return sendError(res, 'Product not found', 404);
        sendSuccess(res, product, 'Product updated');
    } catch (err) {
        sendError(res, err.message);
    }
});

// DELETE /api/products/:productId
router.delete('/:productId', async (req, res) => {
    try {
        const product = await Product.findOneAndDelete({ productId: req.params.productId });
        if (!product) return sendError(res, 'Product not found', 404);
        sendSuccess(res, null, 'Product deleted');
    } catch (err) {
        sendError(res, err.message);
    }
});

module.exports = router;
