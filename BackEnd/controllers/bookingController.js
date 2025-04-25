const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const { logger } = require('../config/logger'); // Destructure the logger instance

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
    const { vehicleId, startDateTime, endDateTime } = req.body;

    // Basic validation
    if (!vehicleId || !startDateTime || !endDateTime) {
        return res.status(400).json({ message: 'Missing required booking fields.' });
    }

    const newStart = new Date(startDateTime);
    const newEnd = new Date(endDateTime);

    if (newEnd <= newStart) {
        return res.status(400).json({ message: 'End date must be after start date.' });
    }

    try {
        // Check for overlapping bookings for the same vehicle
        const overlappingBookings = await Booking.find({
            vehicleId: vehicleId,
            $or: [
                // Existing booking starts during the new booking
                { startDateTime: { $lt: newEnd, $gte: newStart } },
                // Existing booking ends during the new booking
                { endDateTime: { $gt: newStart, $lte: newEnd } },
                // Existing booking completely surrounds the new booking
                { startDateTime: { $lte: newStart }, endDateTime: { $gte: newEnd } }
            ]
        });

        if (overlappingBookings.length > 0) {
            logger.warn(`Booking conflict detected for vehicle ${vehicleId} between ${startDateTime} and ${endDateTime}`);
            return res.status(409).json({ message: 'Vehicle is already booked during the requested time slot.' });
        }

        // No conflict, proceed to create the booking
        const booking = new Booking(req.body);
        const newBooking = await booking.save();

        // Update vehicle booking count (optional, consider if still needed)
        // await Vehicle.findByIdAndUpdate(
        //     vehicleId,
        //     { $inc: { bookingCount: 1 } }
        // );

        logger.info(`Booking created successfully for vehicle ${vehicleId} from ${startDateTime} to ${endDateTime}`);
        res.status(201).json(newBooking);

    } catch (error) {
        logger.error('Error creating booking:', error);
        // Use 500 for server errors, 400 was likely for validation before
        res.status(500).json({ message: 'Failed to create booking due to a server error.' });
    }
};

// New function to check vehicle availability for a given time range
exports.checkAvailability = async (req, res) => {
    const { startDateTime, endDateTime } = req.body;

    // Basic validation
    if (!startDateTime || !endDateTime) {
        return res.status(400).json({ message: 'Missing startDateTime or endDateTime.' });
    }

    const checkStart = new Date(startDateTime);
    const checkEnd = new Date(endDateTime);

    if (checkEnd <= checkStart) {
        return res.status(400).json({ message: 'End date must be after start date.' });
    }
     if (checkStart < new Date()) {
        return res.status(400).json({ message: 'Start date cannot be in the past.' });
    }


    try {
        // Find bookings that overlap with the requested time range
        const overlappingBookings = await Booking.find({
            $or: [
                { startDateTime: { $lt: checkEnd, $gte: checkStart } },
                { endDateTime: { $gt: checkStart, $lte: checkEnd } },
                { startDateTime: { $lte: checkStart }, endDateTime: { $gte: checkEnd } }
            ]
        }).select('vehicleId'); // Only select the vehicleId

        // Extract the IDs of vehicles that are booked during this time
        const bookedVehicleIds = overlappingBookings.map(booking => booking.vehicleId.toString());
        const uniqueBookedVehicleIds = [...new Set(bookedVehicleIds)]; // Ensure uniqueness

        // Find all vehicles that are NOT in the booked list and are 'available' or 'booked' (not 'maintenance')
        // We include 'booked' status because a vehicle might be booked outside the requested range
        const availableVehicles = await Vehicle.find({
            _id: { $nin: uniqueBookedVehicleIds },
            status: { $in: ['available', 'booked'] } // Exclude vehicles under maintenance
        });

        logger.info(`Availability check for ${startDateTime} to ${endDateTime}: Found ${availableVehicles.length} available vehicles.`);
        res.json(availableVehicles);

    } catch (error) {
        logger.error('Error checking vehicle availability:', error);
        res.status(500).json({ message: 'Failed to check vehicle availability due to a server error.' });
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

exports.updateBooking = async (req, res) => {
    const { id } = req.params;
    const { vehicleId, startDateTime, endDateTime } = req.body;

    // Basic validation
    if (!vehicleId || !startDateTime || !endDateTime) {
        return res.status(400).json({ message: 'Missing required booking fields.' });
    }

    const newStart = new Date(startDateTime);
    const newEnd = new Date(endDateTime);

    if (newEnd <= newStart) {
        return res.status(400).json({ message: 'End date must be after start date.' });
    }

    try {
        // Check for overlapping bookings for the same vehicle, excluding the current booking being updated
        const overlappingBookings = await Booking.find({
            _id: { $ne: id }, // Exclude the current booking
            vehicleId: vehicleId,
            $or: [
                { startDateTime: { $lt: newEnd, $gte: newStart } },
                { endDateTime: { $gt: newStart, $lte: newEnd } },
                { startDateTime: { $lte: newStart }, endDateTime: { $gte: newEnd } }
            ]
        });

        if (overlappingBookings.length > 0) {
            logger.warn(`Update conflict detected for booking ${id}, vehicle ${vehicleId} between ${startDateTime} and ${endDateTime}`);
            return res.status(409).json({ message: 'Vehicle is already booked during the requested time slot.' });
        }

        // No conflict, proceed to update the booking
        const updatedBooking = await Booking.findByIdAndUpdate(id, req.body, { new: true }); // {new: true} returns the updated document

        if (!updatedBooking) {
            logger.warn(`Booking not found for update: ${id}`);
            return res.status(404).json({ message: 'Booking not found.' });
        }

        logger.info(`Booking ${id} updated successfully.`);
        res.json(updatedBooking);

    } catch (error) {
        logger.error(`Error updating booking ${id}:`, error);
        res.status(500).json({ message: 'Failed to update booking due to a server error.' });
    }
};

exports.deleteBooking = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedBooking = await Booking.findByIdAndDelete(id);

        if (!deletedBooking) {
            logger.warn(`Booking not found for deletion: ${id}`);
            return res.status(404).json({ message: 'Booking not found.' });
        }

        // Optionally, decrement vehicle booking count if you were using it
        // await Vehicle.findByIdAndUpdate(
        //     deletedBooking.vehicleId,
        //     { $inc: { bookingCount: -1 } }
        // );

        logger.info(`Booking ${id} deleted successfully.`);
        res.json({ message: 'Booking deleted successfully.' });

    } catch (error) {
        logger.error(`Error deleting booking ${id}:`, error);
        res.status(500).json({ message: 'Failed to delete booking due to a server error.' });
    }
};
