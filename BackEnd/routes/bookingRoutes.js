const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

router.get('/', bookingController.getAllBookings);
router.post('/availability', bookingController.checkAvailability); // Route to check vehicle availability
router.post('/', bookingController.createBooking);
router.get('/vehicle/:vehicleId', bookingController.getVehicleBookings);

// Add routes for updating and deleting specific bookings by ID
router.put('/:id', bookingController.updateBooking);
router.delete('/:id', bookingController.deleteBooking);

// Export the router AFTER defining all routes
module.exports = router;
