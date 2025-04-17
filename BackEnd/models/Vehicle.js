const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: String, required: true },
    licensePlate: { type: String, required: true, unique: true },
    seats: { type: Number, required: true },
    parkingLocation: String,
    images: [String],
    description: String,
    status: {
        type: String,
        enum: ['available', 'booked', 'maintenance'],
        default: 'available'
    },
    bookingCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);