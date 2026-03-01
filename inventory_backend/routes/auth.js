const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/helpers');

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const exists = await User.findOne({ email });
        if (exists) return sendError(res, 'Email already registered', 400);

        const user = await User.create({ name, email, password, role });
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
        sendSuccess(res, { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } }, 'User registered', 201);
    } catch (err) {
        sendError(res, err.message);
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await user.matchPassword(password))) {
            return sendError(res, 'Invalid email or password', 401);
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
        sendSuccess(res, { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } }, 'Login successful');
    } catch (err) {
        sendError(res, err.message);
    }
});

module.exports = router;
