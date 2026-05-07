// config/swagger.js

const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');

const PORT = process.env.PORT || 5000;

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'GIU Nexus API',
            version: '1.0.0',
            description:
                'AI-powered job and internship platform for university students. ' +
                'Endpoints are versioned under /api/v1 and protected routes require a Bearer JWT.'
        },
        servers: [
            {
                url: `http://localhost:${PORT}/api/v1`,
                description: 'Local development'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        }
    },
    apis: [path.join(__dirname, '..', 'routes', '*.js')]
};

module.exports = swaggerJSDoc(options);
