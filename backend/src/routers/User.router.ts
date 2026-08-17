import express, { Router } from 'express'
import {
  getAllApartments,
  getApartment,
} from '../controllers/User.controller.js'
import verifyToken from '../middlewares/Auth.middleware.js'
import { requestApartment } from '../controllers/Requests.controller.js'

const router: Router = express.Router()

router.route('/').get(getAllApartments)
router.route('/:id').get(getApartment)
router.route('/:id/requests').post(verifyToken, requestApartment)

export { router as ApartmentRouter }
