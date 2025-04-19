const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');

// Define all your routes
router.get('/', vehicleController.getAllVehicles);
router.post('/', vehicleController.createVehicle);
router.get('/:id', vehicleController.getVehicle);
router.put('/:id', vehicleController.updateVehicle);
router.delete('/:id', vehicleController.deleteVehicle);

// Export the router AFTER defining all routes
module.exports = router;