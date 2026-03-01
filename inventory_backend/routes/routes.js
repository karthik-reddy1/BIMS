const express = require('express');
const router = express.Router();
const Route = require('../models/Route');
const { sendSuccess, sendError } = require('../utils/helpers');

// GET /api/routes
router.get('/', async (req, res) => {
    try {
        const routes = await Route.find().sort({ routeName: 1 });
        sendSuccess(res, routes);
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
