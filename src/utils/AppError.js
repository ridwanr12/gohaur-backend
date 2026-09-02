class AppError extends Error {
    constructor(message, statusCode, details = null) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.timestamp = new Date().toISOString();
        this.success = false;
        Error.captureStackTrace(this, this.constructor);
    }
}

export default AppError;
