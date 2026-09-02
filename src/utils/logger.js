import { createLogger, format, transports } from 'winston';

const { combine, timestamp, json, prettyPrint, colorize } = format;

const logger = createLogger({
    level: 'error',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        json(),
        prettyPrint(),
        colorize()
    ),
    transports: [
        new transports.File({ 
            filename: 'logs/errors.log',
            format: combine(
                timestamp(),
                json()
            )
        }),
        new transports.Console({
            format: combine(
                timestamp(),
                prettyPrint(),
                colorize()
            )
        })
    ],
    // Add error metadata
    defaultMeta: { 
        service: 'gohaur-backend',
        environment: process.env.NODE_ENV || 'development'
    }
});

export default logger;
