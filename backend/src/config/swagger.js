const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Conflict Management API',
      version: '1.0.0',
      description: 'A comprehensive conflict resolution platform API',
      contact: {
        name: 'API Support',
        email: 'support@conflictmanagement.com'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production'
          ? 'https://your-production-domain.com'
          : `http://localhost:${process.env.PORT || 5000}`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'User ID'
            },
            name: {
              type: 'string',
              description: 'User full name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            role: {
              type: 'string',
              enum: ['admin', 'mediator', 'participant'],
              description: 'User role'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp'
            }
          }
        },
        Case: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Case ID'
            },
            title: {
              type: 'string',
              description: 'Case title'
            },
            description: {
              type: 'string',
              description: 'Case description'
            },
            status: {
              type: 'string',
              enum: ['pending', 'in_progress', 'resolved', 'closed'],
              description: 'Case status'
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent'],
              description: 'Case priority'
            },
            participants: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Array of participant user IDs'
            },
            mediator: {
              type: 'string',
              description: 'Mediator user ID'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Case creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Case last update timestamp'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'error'
            },
            message: {
              type: 'string',
              description: 'Error message'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'success'
            },
            message: {
              type: 'string',
              description: 'Success message'
            },
            data: {
              type: 'object',
              description: 'Response data'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/app.js']
};

const specs = swaggerJSDoc(options);

module.exports = {
  specs,
  swaggerUi
};