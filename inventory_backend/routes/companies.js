const express = require('express');
const router = express.Router();
const Company = require('../models/company');
const { sendSuccess, sendError } = require('../utils/helpers');

// GET /api/companies
router.get('/', async (req, res) => {
    try {
        const companies = await Company.find().sort({ companyName: 1 });
        sendSuccess(res, companies);
    } catch (err) {
        sendError(res, err.message);
    }
});

// POST /api/companies
router.post('/', async (req, res) => {
    try {
        const company = await Company.create(req.body);
        sendSuccess(res, company, 'Company created successfully', 201);
    } catch (err) {
        if (err.code === 11000) return sendError(res, 'Company ID already exists', 400);
        sendError(res, err.message);
    }
});

// GET /api/companies/:companyId
router.get('/:companyId', async (req, res) => {
    try {
        const company = await Company.findOne({ companyId: req.params.companyId.toUpperCase() });
        if (!company) return sendError(res, 'Company not found', 404);
        sendSuccess(res, company);
    } catch (err) {
        sendError(res, err.message);
    }
});

// PUT /api/companies/:companyId
router.put('/:companyId', async (req, res) => {
    try {
        delete req.body.companyId; // prevent ID change
        const company = await Company.findOneAndUpdate(
            { companyId: req.params.companyId.toUpperCase() },
            req.body,
            { new: true, runValidators: true }
        );
        if (!company) return sendError(res, 'Company not found', 404);
        sendSuccess(res, company, 'Company updated');
    } catch (err) {
        sendError(res, err.message);
    }
});

// DELETE /api/companies/:companyId
router.delete('/:companyId', async (req, res) => {
    try {
        const company = await Company.findOneAndDelete({ companyId: req.params.companyId.toUpperCase() });
        if (!company) return sendError(res, 'Company not found', 404);
        sendSuccess(res, null, 'Company deleted');
    } catch (err) {
        sendError(res, err.message);
    }
});

module.exports = router;
