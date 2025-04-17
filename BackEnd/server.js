const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const winston = require('winston');
const logger = require('./config/logger');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) }}));

// Routes
const vehicleRoutes = require('./routes/vehicleRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bookings', bookingRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => logger.info('Connected to MongoDB'))
    .catch((err) => logger.error('MongoDB connection error:', err));

// Error handling
app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));