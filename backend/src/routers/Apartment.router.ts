import express, { Router } from 'express'
import {
  getAllApartments,
  getApartment,
} from '../controllers/Apartments.controller.js'

const router: Router = express.Router()

router.route('/').get(getAllApartments)
router.route('/:id').get(getApartment)

export { router as ApartmentRouter }
