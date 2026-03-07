const express = require('express');
const router = express.Router();
const Route = require('../models/Route');
const { sendSuccess, sendError } = require('../utils/helpers');

const ShopBill = require('../models/ShopBill');
const RouteBill = require('../models/RouteBill');

// GET /api/routes
router.get('/', async (req, res) => {
    try {
        const routes = await Route.find().lean().sort({ routeName: 1 });

        // Find all routes that have uncompleted route bills, or have shop bills.
        const routesWithBills = await Promise.all(routes.map(async (route) => {
            // Find ALL Route Bills for this route
            const allRouteBills = await RouteBill.find({
                routeId: route.routeId
            }).lean();

            // Extract all the shopBillIds that have already been tied to a Route Bill
            const processedBillIds = allRouteBills.reduce((acc, rb) => acc.concat(rb.shopBillIds || []), []);

            // Find shop bills associated with this route, EXCLUDING ones already processed
            const activeBills = await ShopBill.find({
                routeId: route.routeId,
                billId: { $nin: processedBillIds }
            }).lean();

            return {
                ...route,
                activeBills: activeBills || []
            };
        }));
        sendSuccess(res, routesWithBills);
    } catch (err) {
        sendError(res, err.message);
    }
});

// POST /api/routes
router.post('/', async (req, res) => {
    try {
        const route = await Route.create(req.body);
        sendSuccess(res, route, 'Route created successfully', 201);
    } catch (err) {
        if (err.code === 11000) return sendError(res, 'Route ID already exists', 400);
        sendError(res, err.message);
    }
});

// GET /api/routes/:routeId
router.get('/:routeId', async (req, res) => {
    try {
        const route = await Route.findOne({ routeId: req.params.routeId.toUpperCase() });
        if (!route) return sendError(res, 'Route not found', 404);
        sendSuccess(res, route);
    } catch (err) {
        sendError(res, err.message);
    }
});

// PUT /api/routes/:routeId
router.put('/:routeId', async (req, res) => {
    try {
        delete req.body.routeId;
        const route = await Route.findOneAndUpdate(
            { routeId: req.params.routeId.toUpperCase() },
            req.body,
            { new: true, runValidators: true }
        );
        if (!route) return sendError(res, 'Route not found', 404);
        sendSuccess(res, route, 'Route updated');
    } catch (err) {
        sendError(res, err.message);
    }
});

// DELETE /api/routes/:routeId
router.delete('/:routeId', async (req, res) => {
    try {
        const route = await Route.findOneAndDelete({ routeId: req.params.routeId.toUpperCase() });
        if (!route) return sendError(res, 'Route not found', 404);
        sendSuccess(res, null, 'Route deleted');
    } catch (err) {
        sendError(res, err.message);
    }
});

module.exports = router;
