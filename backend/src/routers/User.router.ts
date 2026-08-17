import express, { Router } from 'express'
import {
  getAllApartments,
  getApartment,
} from '../controllers/User.controller.js'
import verifyToken from '../middlewares/Auth.middleware.js'
import { requestApartment } from '../controllers/Requests.controller.js'

const router: Router = express.Router()

/**
 * @swagger
 * /listings:
 *   get:
 *     tags:
 *       - Listings
 *     summary: Get all apartment listings
 *     description: Get all apartment listings with optional filtering by location, minimum price, and status.
 *     parameters:
 *       - in: query
 *         name: location
 *         description: Filter apartments by location.
 *         schema:
 *           type: string
 *           example: Nasr City
 *       - in: query
 *         name: minPrice
 *         description: Minimum apartment price.
 *         schema:
 *           type: number
 *           minimum: 0
 *           example: 3000
 *       - in: query
 *         name: status
 *         description: Filter apartments by availability status.
 *         schema:
 *           type: string
 *           enum:
 *             - available
 *             - full
 *           example: available
 *     responses:
 *       200:
 *         description: List of apartments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Listing'
 *       400:
 *         description: Invalid filter parameters
 */
router.route('/').get(getAllApartments)

/**
 * @swagger
 * /listings/{id}:
 *   get:
 *     tags:
 *       - Listings
 *     summary: Get a single apartment listing
 *     description: Get the details of a specific apartment listing.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: MongoDB ObjectId of the apartment listing.
 *         schema:
 *           type: string
 *           example: 64f123456789abcdef123456
 *     responses:
 *       200:
 *         description: Apartment found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Listing'
 *       404:
 *         description: Apartment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.route('/:id').get(getApartment)

/**
 * @swagger
 * /listings/{id}/requests:
 *   post:
 *     tags:
 *       - Requests
 *     summary: Send an interest request
 *     description: Send an interest request to join or inquire about an apartment listing.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: MongoDB ObjectId of the apartment listing.
 *         schema:
 *           type: string
 *           example: 64f123456789abcdef123456
 *     responses:
 *       201:
 *         description: Interest request sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InterestRequest'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: You cannot request your own apartment or the apartment is unavailable
 *       404:
 *         description: Apartment not found
 *       409:
 *         description: Duplicate interest request already exists
 */
router.route('/:id/requests').post(verifyToken, requestApartment)

export { router as ApartmentRouter }
