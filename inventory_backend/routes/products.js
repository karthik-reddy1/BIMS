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
        if (req.query.group) filter.productGroup = { $regex: `^${req.query.group}$`, $options: 'i' };
        const products = await Product.find(filter).sort({ productName: 1, packType: 1, size: 1 });
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
        const product = await Product.findOne({ productId: req.params.productId });
        if (!product) return sendError(res, 'Product not found', 404);

        // Prevent overriding immutable fields
        const { productId: _, packType: __, ...body } = req.body;
        void _;
        void __;

        // Apply allowed top-level fields
        const allowedFields = ['productGroup', 'brand', 'productName', 'mrp', 'casePrice', 'bottlesPerCase', 'perBottlePrice'];
        for (const field of allowedFields) {
            if (body[field] !== undefined) product[field] = body[field];
        }

        // Apply filledStock and immediately recompute totalBottles
        if (body.filledStock) {
            const newCases = body.filledStock.cases !== undefined ? Number(body.filledStock.cases) : product.filledStock.cases;
            const newLoose = body.filledStock.looseBottles !== undefined ? Number(body.filledStock.looseBottles) : product.filledStock.looseBottles;
            const bpc = product.bottlesPerCase;
            product.filledStock.cases = newCases;
            product.filledStock.looseBottles = newLoose;
            product.filledStock.totalBottles = (newCases * bpc) + newLoose; // explicit calculation — no middleware dependency
            product.markModified('filledStock');
        }

        // Apply emptyStock and immediately recompute total (only for returnable)
        if (body.emptyStock && product.isReturnable) {
            const newGood = body.emptyStock.good !== undefined ? Number(body.emptyStock.good) : product.emptyStock.good;
            const newBroken = body.emptyStock.broken !== undefined ? Number(body.emptyStock.broken) : product.emptyStock.broken;
            product.emptyStock.good = newGood;
            product.emptyStock.broken = newBroken;
            product.emptyStock.total = newGood + newBroken; // explicit calculation — no middleware dependency
            product.markModified('emptyStock');
        }

        // Recompute perBottlePrice if pricing changed
        if (product.casePrice && product.bottlesPerCase) {
            product.perBottlePrice = product.casePrice / product.bottlesPerCase;
        }

        await product.save();
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
