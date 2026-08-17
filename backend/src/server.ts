// imports
import express, { type Application } from 'express'
import 'dotenv/config'
import { connectToDB } from './config/db.config.js'
import {
  requestsLogger,
  serverLogger,
} from './middlewares/Logger.middleware.js'
import {
  errorHandler,
  notFound,
} from './middlewares/ErrorHandlers.middleware.js'
import { listingsRouter } from './routers/Lister.router.js'
import { authRouter } from './routers/Auth.router.js'
import { ApartmentRouter } from './routers/User.router.js'
import { requestsRouter } from './routers/Requests.rotuer.js'
// DB
connectToDB()

// APP
const app: express.Application = express()

// Middlewares
app.use(express.json())
app.use(requestsLogger)

// Routes
app.use('/auth', authRouter)
app.use('/listings', ApartmentRouter) // public GET + POST /:id/requests
app.use('/listings', listingsRouter) // Lister CRUD (create/update/delete)
app.use('/requests', requestsRouter) // accept/declinerequests - Listers get/delteRequests - Users

// Errors
app.use(notFound)
app.use(errorHandler)

// Server
const PORT = process.env.PORT!
app.listen(PORT, () => {
  serverLogger(Number(PORT))
})
