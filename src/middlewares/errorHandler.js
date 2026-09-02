import logger from '../utils/logger.js';
import { ValidationError } from 'sequelize';

const errorHandler = (err, req, res, next) => {
    // Log the error
    logger.error({
        message: err.message,
        stack: err.stack,
        method: req.method,
        url: req.originalUrl,
        body: req.body,
        timestamp: new Date().toISOString()
    });

    // Handle Sequelize validation errors
    if (err instanceof ValidationError) {
        const validationErrors = err.errors.map(error => ({
            field: error.path,
            message: error.message
        }));

        return res.status(400).json({
            success: false,
            status: 400,
            timestamp: new Date().toISOString(),
            path: req.originalUrl,
            method: req.method,
            message: ['SQL Validation failed'],
            details: validationErrors
        });
    }

    // Prepare the error response
    const errorResponse = {
        success: false,
        status: err.statusCode || 500,
        timestamp: err.timestamp || new Date().toISOString(),
        path: req.originalUrl,
        method: req.method,
        message: Array.isArray(err.message) ? err.message : [err.message || 'Internal Server Error'],
        details: err.details || null
    };

    // Add request information for 400 errors
    if (err.statusCode >= 400 && err.statusCode < 500) {
        errorResponse.request = {
            body: req.body,
            query: req.query,
            params: req.params
        };
    }

    res.status(err.statusCode || 500).json(errorResponse);
};

export default errorHandler;
