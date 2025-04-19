require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const { logger, apiLogger } = require('./config/logger');
const vehicleRoutes = require('./routes/vehicleRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();

// Create a write stream for Morgan access logs
const accessLogStream = fs.createWriteStream(
    path.join(__dirname, 'logs', 'access.log'), 
    { flags: 'a' }
);

// Middleware
app.use(cors());
app.use(express.json());

// Morgan logger setup - dev format to console in development, combined format to file in all environments
app.use(morgan('dev'));
app.use(morgan('combined', { stream: accessLogStream }));

// API logger middleware
app.use(apiLogger.logRequest);
app.use(apiLogger.logResponse);

// Routes
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bookings', bookingRoutes);

// MongoDB Connection
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => logger.info('Connected to MongoDB'))
    .catch((err) => logger.error('MongoDB connection error:', err));

// Basic routes for testing
app.get('/', (req, res) => {
    res.send('Fleet Management API is running');
});

// Database health check endpoint
app.get('/fleetfriend', async (req, res) => {
    try {
        // Check MongoDB connection
        const dbState = mongoose.connection.readyState;
        let dbStatus;
        
        switch (dbState) {
            case 0:
                dbStatus = 'Disconnected';
                break;
            case 1:
                dbStatus = 'Connected';
                break;
            case 2:
                dbStatus = 'Connecting';
                break;
            case 3:
                dbStatus = 'Disconnecting';
                break;
            default:
                dbStatus = 'Unknown';
        }
        
        // Get some basic stats
        const stats = {
            database: 'MongoDB',
            status: dbStatus,
            name: mongoose.connection.name,
            host: mongoose.connection.host,
            port: mongoose.connection.port,
            models: Object.keys(mongoose.models),
            serverTime: new Date()
        };
        
        if (dbState === 1) {
            // Only return 200 if actually connected
            res.status(200).json({
                status: 'success',
                message: 'Database connection is healthy',
                data: stats
            });
        } else {
            // Return 503 Service Unavailable if not connected
            res.status(503).json({
                status: 'error',
                message: 'Database connection is not healthy',
                data: stats
            });
        }
    } catch (error) {
        logger.error('Database health check failed:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to check database health',
            error: error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use. Please use a different port or stop the other process.`);
        process.exit(1);
    } else {
        logger.error('Server error:', err);
    }
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        logger.info('HTTP server closed');
    });
});
