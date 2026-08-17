// imports
import express from 'express'
import 'dotenv/config'
import { requestsLogger } from './middlewares/Logger.middleware.js'
import {
  errorHandler,
  notFound,
} from './middlewares/ErrorHandlers.middleware.js'
import { listingsRouter } from './routers/Lister.router.js'
import { authRouter } from './routers/Auth.router.js'
import { ApartmentRouter } from './routers/User.router.js'
import { requestsRouter } from './routers/Requests.rotuer.js'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './config/swagger.config.js'
import { connectToDB } from './config/db.config.js'

// APP
const app: express.Application = express()

// connect to database
connectToDB()

// Middlewares
app.use(express.json())
app.use(requestsLogger)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Routes
app.get('/', (req, res) => {
  res.status(200).send('Backend API is up and running!')
})
app.use('/auth', authRouter)
app.use('/listings', ApartmentRouter) // public GET + POST /:id/requests
app.use('/listings', listingsRouter) // Lister CRUD (create/update/delete)
app.use('/requests', requestsRouter) // accept/declinerequests - Listers get/delteRequests - Users

// Errors
app.use(notFound)
app.use(errorHandler)

export default app
