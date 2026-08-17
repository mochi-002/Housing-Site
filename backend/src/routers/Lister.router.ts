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

/**
 * @swagger
 * /listings:
 *   post:
 *     tags:
 *       - Listings
 *     summary: Create a new apartment listing
 *     description: Create an apartment listing. Only authenticated users with the lister role can perform this action.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - location
 *               - price
 *               - roomsAvailable
 *               - description
 *             properties:
 *               location:
 *                 type: string
 *                 example: Nasr City
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 example: 4500
 *               roomsAvailable:
 *                 type: integer
 *                 minimum: 0
 *                 example: 2
 *               description:
 *                 type: string
 *                 example: Shared apartment near university with furnished rooms.
 *               status:
 *                 type: string
 *                 enum:
 *                   - available
 *                   - full
 *                 default: available
 *                 example: available
 *     responses:
 *       201:
 *         description: Apartment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Listing'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Only listers can perform this action
 */
router.route('/').post(verifyToken, requireLister, createApartment)

/**
 * @swagger
 * /listings/{id}:
 *   patch:
 *     tags:
 *       - Listings
 *     summary: Update an apartment listing
 *     description: Update an apartment listing. Only the owner of the listing can update it.
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               location:
 *                 type: string
 *                 example: Nasr City
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 example: 5000
 *               roomsAvailable:
 *                 type: integer
 *                 minimum: 0
 *                 example: 1
 *               description:
 *                 type: string
 *                 example: Updated apartment description.
 *               status:
 *                 type: string
 *                 enum:
 *                   - available
 *                   - full
 *                 example: available
 *     responses:
 *       200:
 *         description: Apartment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Listing'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: You can only edit your own listings
 *       404:
 *         description: Apartment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     tags:
 *       - Listings
 *     summary: Delete an apartment listing
 *     description: Delete an apartment listing. Only the owner of the listing can delete it.
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
 *       200:
 *         description: Apartment deleted successfully
 *       400:
 *         description: Cannot delete a listing with an accepted request
 *       401:
 *         description: Authentication required
 *       403:
 *         description: You can only delete your own listings
 *       404:
 *         description: Apartment not found
 */
router
  .route('/:id')
  .patch(verifyToken, requireLister, updateApartment)
  .delete(verifyToken, requireLister, deleteApartment)

/**
 * @swagger
 * /listings/{id}/requests:
 *   get:
 *     tags:
 *       - Requests
 *     summary: Get interest requests for a listing
 *     description: Get all interest requests sent to a specific apartment listing. Only the listing owner can access these requests.
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
 *       200:
 *         description: Interest requests fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/InterestRequest'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: You can only view requests for your own apartment
 *       404:
 *         description: Apartment not found
 */
router.route('/:id/requests').get(verifyToken, requireLister, getListerRequests)

export { router as listingsRouter }
