const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true
    },
    employeeName: { type: String, required: true },
    email: { type: String, required: true },
    projectTitle: { type: String, required: true },
    projectCode: { type: String, required: true },
    startDateTime: { type: Date, required: true },
    endDateTime: { type: Date, required: true },
    location: { type: String, required: true },
    purpose: { type: String, required: true },
    status: {
        type: String,
        enum: ['active', 'completed', 'cancelled'],
        default: 'active'
    }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);