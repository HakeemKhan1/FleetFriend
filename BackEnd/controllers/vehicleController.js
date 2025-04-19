const Vehicle = require('../models/Vehicle');
const logger = require('../config/logger');

exports.getAllVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find();
        res.json(vehicles);
    } catch (error) {
        logger.error('Error fetching vehicles:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
        res.json(vehicle);
    } catch (error) {
        logger.error('Error fetching vehicle:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.createVehicle = async (req, res) => {
    try {
        const vehicle = new Vehicle(req.body);
        const newVehicle = await vehicle.save();
        res.status(201).json(newVehicle);
    } catch (error) {
        logger.error('Error creating vehicle:', error);
        res.status(400).json({ message: error.message });
    }
};

exports.updateVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(vehicle);
    } catch (error) {
        logger.error('Error updating vehicle:', error);
        res.status(400).json({ message: error.message });
    }
};

exports.deleteVehicle = async (req, res) => {
    try {
        await Vehicle.findByIdAndDelete(req.params.id);
        res.json({ message: 'Vehicle deleted' });
    } catch (error) {
        logger.error('Error deleting vehicle:', error);
        res.status(500).json({ message: error.message });
    }
};