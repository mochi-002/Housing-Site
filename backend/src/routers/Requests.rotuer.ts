import express, { Router } from 'express'
import verifyToken from '../middlewares/Auth.middleware.js'
import { requireLister } from '../middlewares/Role.middleware.js'
import { getRequests } from '../controllers/User.controller.js'
import {
  acceptRequest,
  declineRequest,
  deleteRequest,
} from '../controllers/Requests.controller.js'

const router: Router = express.Router()

/**
 * @swagger
 * /requests/mine:
 *   get:
 *     tags:
 *       - Requests
 *     summary: Get my interest requests
 *     description: Get all interest requests sent by the currently authenticated seeker.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Requests fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/InterestRequest'
 *       401:
 *         description: Authentication required
 */
router.route('/mine').get(verifyToken, getRequests)

/**
 * @swagger
 * /requests/{id}/delete:
 *   delete:
 *     tags:
 *       - Requests
 *     summary: Cancel an interest request
 *     description: Cancel a pending interest request. Only the user who sent the request can cancel it.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: MongoDB ObjectId of the interest request.
 *         schema:
 *           type: string
 *           example: 64f123456789abcdef123456
 *     responses:
 *       200:
 *         description: Request cancelled successfully
 *       400:
 *         description: Only pending requests can be cancelled
 *       401:
 *         description: Authentication required
 *       403:
 *         description: You can only delete your own requests
 *       404:
 *         description: Request not found
 */
router.route('/:id/delete').delete(verifyToken, deleteRequest)

/**
 * @swagger
 * /requests/{id}/accept:
 *   patch:
 *     tags:
 *       - Requests
 *     summary: Accept an interest request
 *     description: Accept a pending interest request. Only the owner of the apartment can accept the request.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: MongoDB ObjectId of the interest request.
 *         schema:
 *           type: string
 *           example: 64f123456789abcdef123456
 *     responses:
 *       200:
 *         description: Interest request accepted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InterestRequest'
 *       400:
 *         description: Only pending requests can be accepted
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Only the apartment owner can accept requests
 *       404:
 *         description: Request or apartment not found
 */
router.route('/:id/accept').patch(verifyToken, requireLister, acceptRequest)

/**
 * @swagger
 * /requests/{id}/decline:
 *   patch:
 *     tags:
 *       - Requests
 *     summary: Decline an interest request
 *     description: Decline a pending interest request. Only the owner of the apartment can decline the request.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: MongoDB ObjectId of the interest request.
 *         schema:
 *           type: string
 *           example: 64f123456789abcdef123456
 *     responses:
 *       200:
 *         description: Interest request declined
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InterestRequest'
 *       400:
 *         description: Only pending requests can be declined
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Only the apartment owner can decline requests
 *       404:
 *         description: Request or apartment not found
 */
router.route('/:id/decline').patch(verifyToken, requireLister, declineRequest)

export { router as requestsRouter }
