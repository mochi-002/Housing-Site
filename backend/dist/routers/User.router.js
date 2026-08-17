import express from 'express';
import { getAllApartments, getApartment, } from '../controllers/User.controller.js';
import verifyToken from '../middlewares/Auth.middleware.js';
import { requestApartment } from '../controllers/Requests.controller.js';
const router = express.Router();
/**
 * @swagger
 * /listings:
 *   get:
 *     summary: Get all apartments (with optional filters)
 *     tags: [Listings]
 *     parameters:
 *       - in: query
 *         name: location
 *         schema: { type: string }
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [available, full] }
 *     responses:
 *       200:
 *         description: List of apartments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Listing'
 */
router.route('/').get(getAllApartments);
/**
 * @swagger
 * /listings/{id}:
 *   get:
 *     summary: Get a single apartment
 *     tags: [Listings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
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
router.route('/:id').get(getApartment);
/**
 * @swagger
 * /listings/{id}/requests:
 *   post:
 *     summary: Send an interest request for an apartment
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       201:
 *         description: Request sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InterestRequest'
 *       403:
 *         description: Own apartment or apartment unavailable
 *       409:
 *         description: Duplicate request already exists
 */
router.route('/:id/requests').post(verifyToken, requestApartment);
export { router as ApartmentRouter };
