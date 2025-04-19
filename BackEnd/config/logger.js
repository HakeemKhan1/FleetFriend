const winston = require('winston');
const path = require('path');

// Define log directory
const logDir = path.join(__dirname, '../logs');

// Define custom formats
const formats = {
    console: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(
            info => `${info.timestamp} ${info.level}: ${info.message}`
        )
    ),
    file: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.json()
    )
};

// Create the logger instance
const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: formats.file,
    defaultMeta: { service: 'fleet-friend-api' },
    transports: [
        // Write all logs with level 'error' and below to error.log
        new winston.transports.File({ 
            filename: path.join(logDir, 'error.log'), 
            level: 'error' 
        }),
        // Write all logs with level 'info' and below to combined.log
        new winston.transports.File({ 
            filename: path.join(logDir, 'combined.log') 
        }),
        // Write all logs with level 'debug' and below to debug.log
        new winston.transports.File({ 
            filename: path.join(logDir, 'debug.log'), 
            level: 'debug' 
        })
    ],
    exceptionHandlers: [
        new winston.transports.File({ 
            filename: path.join(logDir, 'exceptions.log') 
        })
    ],
    rejectionHandlers: [
        new winston.transports.File({ 
            filename: path.join(logDir, 'rejections.log') 
        })
    ]
});

// Add console transport in non-production environments
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: formats.console
    }));
}

// Create API logger for HTTP requests
const apiLogger = {
    logRequest: (req, res, next) => {
        logger.info(`API Request: ${req.method} ${req.originalUrl}`, {
            method: req.method,
            url: req.originalUrl,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
        next();
    },
    logResponse: (req, res, next) => {
        const originalSend = res.send;
        
        res.send = function(body) {
            logger.info(`API Response: ${req.method} ${req.originalUrl} - Status: ${res.statusCode}`, {
                method: req.method,
                url: req.originalUrl,
                status: res.statusCode,
                responseTime: Date.now() - req._startTime
            });
            
            return originalSend.call(this, body);
        };
        
        req._startTime = Date.now();
        next();
    }
};

module.exports = {
    logger,
    apiLogger
};
