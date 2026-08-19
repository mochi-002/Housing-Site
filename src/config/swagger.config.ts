import path from 'path'
import swaggerJsdoc from 'swagger-jsdoc'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',

    info: {
      title: 'Shaqty - Student Housing Finder API',
      version: '1.0.0',
      description:
        'REST API for finding and managing shared student housing listings.',
    },

    servers: [
      {
        url: 'https://shaqty-production.up.railway.app/',
        description: 'Railway Server',
      },
      {
        url: 'http://localhost:3000',
        description: 'Local development server',
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },

      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '64f123456789abcdef123456',
            },
            fullName: {
              type: 'string',
              example: 'Mohamed Mahmoud',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'mohamed@example.com',
            },
            role: {
              type: 'string',
              enum: ['seeker', 'lister'],
              example: 'seeker',
            },
            favorites: {
              type: 'object',
              example: ['64f123456789abcdef123456', '64f123456789abcdef123456'],
            },
          },
        },

        Listing: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '64f123456789abcdef123456',
            },
            location: {
              type: 'string',
              example: 'Nasr City',
            },
            price: {
              type: 'number',
              example: 4500,
            },
            roomsAvailable: {
              type: 'integer',
              example: 2,
            },
            description: {
              type: 'string',
              example: 'Furnished apartment near the university.',
            },
            status: {
              type: 'string',
              enum: ['available', 'full'],
              example: 'available',
            },
            owner: {
              type: 'string',
              example: '64f123456789abcdef123456',
            },
          },
        },

        InterestRequest: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '64f123456789abcdef123456',
            },
            listing: {
              type: 'string',
              example: '64f123456789abcdef123456',
            },
            seeker: {
              type: 'string',
              example: '64f123456789abcdef123456',
            },
            status: {
              type: 'string',
              enum: ['pending', 'accepted', 'declined'],
              example: 'pending',
            },
          },
        },

        Message: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '64f123456789abcdef123456',
            },
            sender: {
              type: 'string',
              example: '64f123456789abcdef123456',
            },
            recipient: {
              type: 'string',
              example: '64f123456789abcdef123456',
            },
            listing: {
              type: 'string',
              example: '64f123456789abcdef123456',
            },
            content: {
              type: 'string',
              example:
                'Hello, i need to know some informations about this apartment!',
            },
            read: {
              type: 'booolean',
              example: 'true',
            },
          },
        },

        ErrorResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Apartment not found',
            },
          },
        },
      },
    },
  },

  apis: [path.join(process.cwd(), 'src/routers/*.ts')],
}

const swaggerSpec = swaggerJsdoc(options)

export { swaggerSpec }
