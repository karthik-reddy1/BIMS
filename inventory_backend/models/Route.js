const mongoose = require('mongoose');

const RouteSchema = new mongoose.Schema({
    routeId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    routeName: {
        type: String,
        required: true,
        trim: true
    },
    shopIds: [{ type: String }], // Array of shopIds on this route
    schedule: { type: String, trim: true }, // e.g. "Monday, Wednesday, Friday"
    vehicleNumber: { type: String, trim: true },
    driverName: { type: String, trim: true },
    driverPhone: { type: String, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Route', RouteSchema);
