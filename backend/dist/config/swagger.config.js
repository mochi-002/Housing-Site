import swaggerJsdoc from 'swagger-jsdoc';
const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Apartment Listing API',
        version: '1.0.0',
        description: 'API for apartment listings, interest requests, and auth',
    },
    servers: [{ url: 'http://localhost:3000', description: 'Local server' }],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
        schemas: {
            Listing: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    location: { type: 'string' },
                    price: { type: 'number' },
                    roomsAvailable: { type: 'number' },
                    description: { type: 'string' },
                    status: { type: 'string', enum: ['available', 'full'] },
                },
                InterestRequest: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        listing: { type: 'string' },
                        seeker: { type: 'string' },
                        status: {
                            type: 'string',
                            enum: ['pending', 'accepted', 'declined'],
                        },
                    },
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string' },
                    },
                },
            },
        },
    },
};
const options = {
    swaggerDefinition,
    apis: ['../routers/*.ts'],
};
export const swaggerSpec = swaggerJsdoc(options);
