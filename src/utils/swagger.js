import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Express API Documentation',
      version: '1.0.0',
      description: 'API documentation for Express backend',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              default: true,
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
            },
            message: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
            data: {
              type: 'object',
              nullable: true,
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              default: false,
            },
            status: {
              type: 'integer',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
            },
            path: {
              type: 'string',
            },
            method: {
              type: 'string',
            },
            message: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
            details: {
              type: 'object',
              nullable: true,
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js', './app.js'], // paths to files containing annotations
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;