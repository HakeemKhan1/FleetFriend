const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

router.get('/', bookingController.getAllBookings);
router.post('/', bookingController.createBooking);
router.get('/vehicle/:vehicleId', bookingController.getVehicleBookings);

// Export the router AFTER defining all routes
module.exports = router;

