import { Router } from 'express'
import { home } from '../controllers/landing.controller.js'

const router = Router()

router.get('/', home)

export { router as landingRouter }
