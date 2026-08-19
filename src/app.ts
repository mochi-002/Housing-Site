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
import { favoritesRouter } from './routers/Favorites.router.js'
import { messagesRouter } from './routers/Messages.router.js'
import { statsRouter } from './routers/Stats.router.js'
import path from 'path'
import { fileURLToPath } from 'url'
import { landingRouter } from './routers/Landing.router.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// APP
const app: express.Application = express()

// Middlerwares
app.use(express.json())
app.use(requestsLogger)

// view
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

// Routes
app.use('/', landingRouter)
app.use('/auth', authRouter)
app.use('/listings', ApartmentRouter) // public GET + POST /:id/requests
app.use('/listings', listingsRouter) // Lister CRUD (create/update/delete)
app.use('/requests', requestsRouter) // accept/declinerequests - Listers get/delteRequests - Users
app.use('/favorites', favoritesRouter) // Seekers save/unsave/view favorited listings
app.use('/messages', messagesRouter) // basic lister <-> seeker messaging
app.use('/stats', statsRouter) // dashboard stats (role-aware + admin overview)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Errors
app.use(notFound)
app.use(errorHandler)

export default app
