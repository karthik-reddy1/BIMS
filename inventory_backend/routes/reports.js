const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const ShopBill = require('../models/ShopBill');
const CompanyPurchase = require('../models/CompanyPurchase');
const EmptiesReturn = require('../models/EmptiesReturn');
const RouteBill = require('../models/RouteBill');
const Company = require('../models/company');
const Shop = require('../models/Shop');
const { sendSuccess, sendError } = require('../utils/helpers');

// Helper to build date filter
const dateFilter = (from, to, field = 'createdAt') => {
    if (!from && !to) return {};
    const f = {};
    if (from) f.$gte = new Date(from);
    if (to) f.$lte = new Date(to);
    return { [field]: f };
};

// GET /api/reports/inventory - Current stock snapshot
router.get('/inventory', async (req, res) => {
    try {
        const products = await Product.find().sort({ productName: 1 });
        const byPackType = {};
        let totalValue = 0, totalEmpties = 0, companyOwed = 0, shopsOwed = 0;
        const lowStock = [];

        const detailed = products.map(p => {
            byPackType[p.packType] = (byPackType[p.packType] || 0) + 1;
            const value = p.filledStock.totalBottles * p.mrp;
            totalValue += value;
            if (p.isReturnable) {
                totalEmpties += p.emptyStock.total;
                companyOwed += p.returnableAccounts.companyOwed;
                shopsOwed += p.returnableAccounts.shopsOwed;
            }
            if (p.filledStock.cases < 2) {
                lowStock.push({ productId: p.productId, productName: p.productName, brand: p.brand, filledStock: p.filledStock });
            }
            return {
                productId: p.productId, productName: p.productName, brand: p.brand, packType: p.packType,
                isReturnable: p.isReturnable, filledStock: p.filledStock, emptyStock: p.emptyStock,
                returnableAccounts: p.returnableAccounts, mrpValue: value
            };
        });

        sendSuccess(res, {
            totalProducts: products.length, byPackType, totalValue, lowStock,
            returnables: { totalEmpties, companyOwed, shopsOwed, shortage: companyOwed - totalEmpties - shopsOwed },
            detailed
        });
    } catch (err) {
        sendError(res, err.message);
    }
});

// GET /api/reports/sales - Shop sales summary
router.get('/sales', async (req, res) => {
    try {
        const filter = dateFilter(req.query.from, req.query.to, 'billDate');
        if (req.query.routeId) filter.routeId = req.query.routeId.toUpperCase();
        if (req.query.shopId) filter.shopId = req.query.shopId.toUpperCase();

        const bills = await ShopBill.find(filter).sort({ billDate: -1 });
        const totalSales = bills.reduce((s, b) => s + b.grandTotal, 0);
        const totalBills = bills.length;

        sendSuccess(res, { totalBills, totalSales, bills });
    } catch (err) {
        sendError(res, err.message);
    }
});

// GET /api/reports/item-sales - Daily item-wise sales & business summary
router.get('/item-sales', async (req, res) => {
    try {
        const filter = dateFilter(req.query.from, req.query.to, 'billDate');
        const routeFilter = dateFilter(req.query.from, req.query.to, 'routeDate');

        // Fetch Shop Bills and Route Bills for the period
        const bills = await ShopBill.find(filter);
        const routeBills = await RouteBill.find(routeFilter);

        // 1. Calculate Business Summary
        const totalSales = bills.reduce((sum, b) => sum + (b.grandTotal || 0), 0);
        const totalExpenses = routeBills.reduce((sum, rb) => sum + (rb.routeExpenses || 0), 0);
        const profit = totalSales - totalExpenses;

        const businessSummary = {
            totalSales,
            totalExpenses,
            profit
        };

        // 2. Aggregate Items Sold
        const itemMap = {};

        bills.forEach(bill => {
            bill.items.forEach(item => {
                if (!itemMap[item.productId]) {
                    itemMap[item.productId] = {
                        productId: item.productId,
                        productName: item.productName || 'Unknown',
                        totalBottlesSold: 0,
                        totalValue: 0
                    };
                }
                itemMap[item.productId].totalBottlesSold += (item.quantity || 0);
                itemMap[item.productId].totalValue += (item.itemTotal || 0);
            });
        });

        // Enrich with Product details for accurate case conversion
        const products = await Product.find({}, 'productId productName bottlesPerCase packType size');
        const productDict = {};
        products.forEach(p => productDict[p.productId] = p);

        const itemSales = Object.values(itemMap).map(item => {
            const prod = productDict[item.productId];
            const bpc = prod ? prod.bottlesPerCase : 24;
            const name = prod ? `${prod.productName} ${prod.size} ${prod.packType}` : item.productName;

            const casesSold = Math.floor(item.totalBottlesSold / bpc);
            const looseSold = item.totalBottlesSold % bpc;

            return {
                productName: name,
                casesSold,
                looseBottlesSold: looseSold,
                totalValue: item.totalValue
            };
        });

        // Sort alphabetically by product name
        itemSales.sort((a, b) => a.productName.localeCompare(b.productName));

        sendSuccess(res, { businessSummary, itemSales });
    } catch (err) {
        sendError(res, err.message);
    }
});

// GET /api/reports/profit-loss - Revenue vs Expenses
router.get('/profit-loss', async (req, res) => {
    try {
        const billFilter = dateFilter(req.query.from, req.query.to, 'billDate');
        const purchaseFilter = dateFilter(req.query.from, req.query.to, 'purchaseDate');
        const routeFilter = dateFilter(req.query.from, req.query.to, 'routeDate');
        const retFilter = dateFilter(req.query.from, req.query.to, 'returnDate');

        const [bills, purchases, routeBills, returns] = await Promise.all([
            ShopBill.find(billFilter),
            CompanyPurchase.find(purchaseFilter),
            RouteBill.find({ ...routeFilter, status: 'Completed' }),
            EmptiesReturn.find(retFilter)
        ]);

        const totalSales = bills.reduce((s, b) => s + b.grandTotal, 0);
        const brokenCollected = returns.reduce((s, r) => s + r.totalMoneyCollected, 0);
        const totalRevenue = totalSales + brokenCollected;

        const purchaseCost = purchases.reduce((s, p) => s + p.productTotal, 0);
        const transportCost = purchases.reduce((s, p) => s + p.transportBill, 0);
        const brokenPenalty = purchases.reduce((s, p) => s + p.brokenBottlePenalty, 0);
        const routeExpenses = routeBills.reduce((s, rb) => s + rb.routeExpenses, 0);
        const totalExpenses = purchaseCost + transportCost + brokenPenalty + routeExpenses;

        const products = await Product.find();
        const inventoryValue = products.reduce((s, p) => s + (p.filledStock.totalBottles * p.mrp), 0);
        const cashProfit = totalRevenue - totalExpenses;

        sendSuccess(res, {
            revenue: { shopSales: totalSales, brokenCollected, total: totalRevenue },
            expenses: { purchases: purchaseCost, transport: transportCost, brokenPenalty, routeExpenses, total: totalExpenses },
            profit: { cashProfit, inventoryValue, totalProfit: cashProfit + inventoryValue }
        });
    } catch (err) {
        sendError(res, err.message);
    }
});

// GET /api/reports/returnables - Returnable bottles status
router.get('/returnables', async (req, res) => {
    try {
        const products = await Product.find({ isReturnable: true });
        let totalGood = 0, totalCompanyOwed = 0, totalShopsOwed = 0;

        const detailed = products.map(p => {
            totalGood += p.emptyStock.good;
            totalCompanyOwed += p.returnableAccounts.companyOwed;
            totalShopsOwed += p.returnableAccounts.shopsOwed;
            const shortage = p.returnableAccounts.companyOwed - p.emptyStock.good - p.returnableAccounts.shopsOwed;
            return {
                productId: p.productId, productName: p.productName, brand: p.brand,
                emptyStock: p.emptyStock, returnableAccounts: p.returnableAccounts, shortage
            };
        });

        sendSuccess(res, {
            summary: {
                totalEmptiesInStock: totalGood,
                totalOwedToCompanies: totalCompanyOwed,
                totalOwedByShops: totalShopsOwed,
                shortage: totalCompanyOwed - totalGood - totalShopsOwed
            },
            detailed
        });
    } catch (err) {
        sendError(res, err.message);
    }
});

// GET /api/reports/route-performance - Route-wise summary
router.get('/route-performance', async (req, res) => {
    try {
        const filter = { status: 'Completed', ...dateFilter(req.query.from, req.query.to, 'routeDate') };
        const routeBills = await RouteBill.find(filter);

        const byRoute = {};
        routeBills.forEach(rb => {
            if (!byRoute[rb.routeId]) {
                byRoute[rb.routeId] = { routeId: rb.routeId, routeName: rb.routeName, totalRuns: 0, totalAmount: 0, totalExpenses: 0, netProfit: 0 };
            }
            byRoute[rb.routeId].totalRuns++;
            byRoute[rb.routeId].totalAmount += rb.totalAmount;
            byRoute[rb.routeId].totalExpenses += rb.routeExpenses;
            byRoute[rb.routeId].netProfit += rb.netForRoute;
        });

        sendSuccess(res, Object.values(byRoute));
    } catch (err) {
        sendError(res, err.message);
    }
});

// GET /api/reports/company-statement/:companyId
router.get('/company-statement/:companyId', async (req, res) => {
    try {
        const company = await Company.findOne({ companyId: req.params.companyId.toUpperCase() });
        if (!company) return sendError(res, 'Company not found', 404);

        const purchases = await CompanyPurchase.find({ companyId: company.companyId }).sort({ purchaseDate: -1 });
        const totalPurchased = purchases.reduce((s, p) => s + p.grandTotal, 0);
        const totalPaid = purchases.reduce((s, p) => s + p.amountPaid, 0);

        sendSuccess(res, {
            company: { companyId: company.companyId, companyName: company.companyName, outstandingAmount: company.outstandingAmount, returnableProducts: company.returnableProducts },
            purchaseSummary: { totalBills: purchases.length, totalPurchased, totalPaid },
            purchases
        });
    } catch (err) {
        sendError(res, err.message);
    }
});

// GET /api/reports/shop-statement/:shopId
router.get('/shop-statement/:shopId', async (req, res) => {
    try {
        const shop = await Shop.findOne({ shopId: req.params.shopId.toUpperCase() });
        if (!shop) return sendError(res, 'Shop not found', 404);

        const [bills, returns] = await Promise.all([
            ShopBill.find({ shopId: shop.shopId }).sort({ billDate: -1 }),
            EmptiesReturn.find({ shopId: shop.shopId }).sort({ returnDate: -1 })
        ]);

        const totalBilled = bills.reduce((s, b) => s + b.grandTotal, 0);
        const totalMoneyCollected = returns.reduce((s, r) => s + r.totalMoneyCollected, 0);

        sendSuccess(res, {
            shop: { shopId: shop.shopId, shopName: shop.shopName, routeId: shop.routeId, returnableProducts: shop.returnableProducts },
            billSummary: { totalBills: bills.length, totalBilled },
            brokenMoneyCollected: totalMoneyCollected,
            bills,
            returns
        });
    } catch (err) {
        sendError(res, err.message);
    }
});

module.exports = router;
