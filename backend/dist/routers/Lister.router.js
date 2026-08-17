import express from 'express';
import { createApartment, deleteApartment, getListerRequests, updateApartment, } from '../controllers/Lister.controller.js';
import { requireLister } from '../middlewares/Role.middleware.js';
import verifyToken from '../middlewares/Auth.middleware.js';
const router = express.Router();
/**
 * @swagger
 * /listings:
 *   post:
 *     summary: Create a new apartment listing
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [location, price, roomsAvailable, description]
 *             properties:
 *               location: { type: string }
 *               price: { type: number }
 *               roomsAvailable: { type: integer }
 *               description: { type: string }
 *               status: { type: string, enum: [available, full] }
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
 *       403:
 *         description: Only Listers can perform this action
 */
router.route('/').post(verifyToken, requireLister, createApartment);
/**
 * @swagger
 * /listings/{id}:
 *   patch:
 *     summary: Update an apartment — owner only
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               location: { type: string }
 *               price: { type: number }
 *               roomsAvailable: { type: integer }
 *               description: { type: string }
 *               status: { type: string, enum: [available, full] }
 *     responses:
 *       200:
 *         description: Apartment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Listing'
 *       403:
 *         description: You can only edit your own listings
 *       404:
 *         description: Apartment not found
 *   delete:
 *     summary: Delete an apartment — owner only
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Apartment deleted successfully
 *       400:
 *         description: Cannot delete a listing with an accepted request
 *       403:
 *         description: You can only delete your own listings
 *       404:
 *         description: Apartment not found
 */
router
    .route('/:id')
    .patch(verifyToken, requireLister, updateApartment)
    .delete(verifyToken, requireLister, deleteApartment);
/**
 * @swagger
 * /listings/{id}/requests:
 *   get:
 *     summary: Get all interest requests sent to a specific listing — owner only
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Interest requests fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/InterestRequest'
 *       403:
 *         description: You can only view requests for your own apartment
 *       404:
 *         description: Apartment not found
 */
router.route('/:id/requests').get(verifyToken, requireLister, getListerRequests);
export { router as listingsRouter };
