const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const logger = require('../config/logger');

exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find().populate('vehicleId');
        res.json(bookings);
    } catch (error) {
        logger.error('Error fetching bookings:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.createBooking = async (req, res) => {
    try {
        const booking = new Booking(req.body);
        const newBooking = await booking.save();
        await Vehicle.findByIdAndUpdate(
            req.body.vehicleId,
            { $inc: { bookingCount: 1 } }
        );
        res.status(201).json(newBooking);
    } catch (error) {
        logger.error('Error creating booking:', error);
        res.status(400).json({ message: error.message });
    }
};

exports.getVehicleBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ vehicleId: req.params.vehicleId });
        res.json(bookings);
    } catch (error) {
        logger.error('Error fetching vehicle bookings:', error);
        res.status(500).json({ message: error.message });
    }
};