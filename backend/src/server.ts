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
import { ApartmentRouter } from './routers/Apartment.router.js'
// DB
connectToDB()

// APP
const app: express.Application = express()

// Middlewares
app.use(express.json())
app.use(requestsLogger)

// Routes
app.use('/auth', authRouter)
app.use('/listings', ApartmentRouter, listingsRouter)

// Errors
app.use(notFound)
app.use(errorHandler)

// Server
const PORT = process.env.PORT!
app.listen(PORT, () => {
  serverLogger(Number(PORT))
})
