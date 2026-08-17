import express, { Router } from 'express'
import asyncHandler from 'express-async-handler'
import {
  createApartment,
  deleteApartment,
  getListerRequests,
  updateApartment,
} from '../controllers/Lister.controller.js'
import { requireLister } from '../middlewares/Role.middleware.js'
import verifyToken from '../middlewares/Auth.middleware.js'

const router: Router = express.Router()

router.route('/').post(verifyToken, requireLister, createApartment)

router
  .route('/:id')
  .patch(verifyToken, requireLister, updateApartment)
  .delete(verifyToken, requireLister, deleteApartment)

router.route('/:id/requests').get(verifyToken, requireLister, getListerRequests)

export { router as listingsRouter }
