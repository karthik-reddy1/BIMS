const express = require('express');
const router = express.Router();
const CompanyPurchase = require('../models/CompanyPurchase');
const Company = require('../models/company');
const Product = require('../models/Product');
const { generateId, updateReturnableBalance, sendSuccess, sendError } = require('../utils/helpers');

// POST /api/purchases - Create a new purchase from a company
router.post('/', async (req, res) => {
    try {
        const { companyId, purchaseDate, items, transportBill = 0, emptiesReturned = [] } = req.body;

        // Fetch company
        const company = await Company.findOne({ companyId: companyId.toUpperCase() });
        if (!company) return sendError(res, 'Company not found', 404);

        // Enrich items with product data
        const enrichedItems = [];
        for (const item of items) {
            const product = await Product.findOne({ productId: item.productId });
            if (!product) return sendError(res, `Product ${item.productId} not found`, 404);
            enrichedItems.push({
                productId: product.productId,
                productName: product.productName,
                size: product.size,
                packType: product.packType,
                cases: item.cases,
                bottlesPerCase: product.bottlesPerCase,
                casePrice: product.casePrice,
                isReturnable: product.isReturnable
            });
        }

        // Enrich empties returned with product names and compute totals
        const enrichedEmpties = [];
        for (const e of emptiesReturned) {
            const product = await Product.findOne({ productId: e.productId });
            if (product) {
                const good = e.goodBottles || 0;
                const broken = e.brokenBottles || 0;
                enrichedEmpties.push({
                    productId: e.productId,
                    productName: product.productName,
                    goodBottles: good,
                    brokenBottles: broken,
                    totalReturned: good + broken
                });
            }
        }

        // Generate purchase ID
        const purchaseId = await generateId(CompanyPurchase, 'PUR', 'purchaseId');

        // Calculate payment due date
        const paymentDueDate = new Date(purchaseDate || Date.now());
        paymentDueDate.setDate(paymentDueDate.getDate() + company.paymentTerms);

        const purchase = await CompanyPurchase.create({
            purchaseId,
            companyId: company.companyId,
            companyName: company.companyName,
            purchaseDate,
            items: enrichedItems,
            emptiesReturned: enrichedEmpties,
            transportBill,
            paymentDueDate
        });

        // ===== Update Product Stocks =====
        for (const item of purchase.items) {
            const product = await Product.findOne({ productId: item.productId });
            if (!product) continue;

            // Increase filled stock
            product.filledStock.cases += item.cases;

            // For returnable products, increase companyOwed
            if (product.isReturnable) {
                product.returnableAccounts.companyOwed += item.totalBottles;
                // Update company returnable record
                updateReturnableBalance(company.returnableProducts, item.productId, `${item.productName} ${item.size} ${item.packType}`, item.totalBottles);
            }
            await product.save();
        }

        // ===== Update Product Empty Stock (empties returned to company) =====
        for (const e of purchase.emptiesReturned) {
            const product = await Product.findOne({ productId: e.productId });
            if (!product || !product.isReturnable) continue;

            // Decrease empty stock in warehouse (good going back to company)
            product.emptyStock.good = Math.max(0, product.emptyStock.good - e.goodBottles);
            // Decrease broken empties too — broken bottles are also leaving our warehouse back to company
            product.emptyStock.broken = Math.max(0, product.emptyStock.broken - e.brokenBottles);
            // Decrease companyOwed by total returned (both good + broken reduce our debt)
            product.returnableAccounts.companyOwed = Math.max(0, product.returnableAccounts.companyOwed - e.totalReturned);

            // Update company returnable record
            updateReturnableBalance(company.returnableProducts, e.productId, e.productName, -e.totalReturned);
            await product.save();
        }

        // Update company outstanding amount
        company.outstandingAmount += purchase.grandTotal;
        await company.save();

        sendSuccess(res, purchase, `Purchase ${purchaseId} created successfully`, 201);
    } catch (err) {
        sendError(res, err.message);
    }
});

// GET /api/purchases
router.get('/', async (req, res) => {
    try {
        const filter = {};
        if (req.query.companyId) filter.companyId = req.query.companyId.toUpperCase();
        if (req.query.status) filter.paymentStatus = req.query.status;
        if (req.query.from || req.query.to) {
            filter.purchaseDate = {};
            if (req.query.from) filter.purchaseDate.$gte = new Date(req.query.from);
            if (req.query.to) filter.purchaseDate.$lte = new Date(req.query.to);
        }
        const purchases = await CompanyPurchase.find(filter).sort({ purchaseDate: -1 });
        sendSuccess(res, purchases);
    } catch (err) {
        sendError(res, err.message);
    }
});

// GET /api/purchases/:purchaseId
router.get('/:purchaseId', async (req, res) => {
    try {
        const purchase = await CompanyPurchase.findOne({ purchaseId: req.params.purchaseId.toUpperCase() });
        if (!purchase) return sendError(res, 'Purchase not found', 404);
        sendSuccess(res, purchase);
    } catch (err) {
        sendError(res, err.message);
    }
});

// PUT /api/purchases/:purchaseId/payment - Record a payment for a purchase
router.put('/:purchaseId/payment', async (req, res) => {
    try {
        const { amount, paymentMode, paymentDate } = req.body;
        const purchase = await CompanyPurchase.findOne({ purchaseId: req.params.purchaseId.toUpperCase() });
        if (!purchase) return sendError(res, 'Purchase not found', 404);

        purchase.amountPaid += amount;
        purchase.amountDue = Math.max(0, purchase.grandTotal - purchase.amountPaid);
        if (purchase.amountDue === 0) purchase.paymentStatus = 'Paid';
        else if (purchase.amountPaid > 0) purchase.paymentStatus = 'Partial';
        await purchase.save();

        // Update company outstanding
        const company = await Company.findOne({ companyId: purchase.companyId });
        if (company) {
            company.outstandingAmount = Math.max(0, company.outstandingAmount - amount);
            await company.save();
        }

        sendSuccess(res, purchase, 'Payment recorded');
    } catch (err) {
        sendError(res, err.message);
    }
});

module.exports = router;
