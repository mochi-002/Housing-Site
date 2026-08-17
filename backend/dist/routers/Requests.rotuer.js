import express from 'express';
import verifyToken from '../middlewares/Auth.middleware.js';
import { requireLister } from '../middlewares/Role.middleware.js';
import { getRequests } from '../controllers/User.controller.js';
import { acceptRequest, declineRequest, deleteRequest, } from '../controllers/Requests.controller.js';
const router = express.Router();
/**
 * @swagger
 * /requests/mine:
 *   get:
 *     summary: Get all interest requests sent by the logged-in seeker
 *     tags: [Requests]
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
 */
router.route('/mine').get(verifyToken, getRequests);
/**
 * @swagger
 * /requests/{id}:
 *   delete:
 *     summary: Cancel a pending interest request — sender only
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
 *         description: Request cancelled successfully
 *       400:
 *         description: Only pending requests can be cancelled
 *       403:
 *         description: You can only delete your own requests
 *       404:
 *         description: Request not found
 */
router.route('/:id').delete(verifyToken, deleteRequest);
/**
 * @swagger
 * /requests/{id}/accept:
 *   patch:
 *     summary: Accept an interest request — listing owner only
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
 *         description: Interest request accepted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InterestRequest'
 *       400:
 *         description: Only pending requests can be accepted
 *       403:
 *         description: Only the apartment owner can accept requests
 *       404:
 *         description: Request or apartment not found
 */
router.route('/:id/accept').patch(verifyToken, requireLister, acceptRequest);
/**
 * @swagger
 * /requests/{id}/decline:
 *   patch:
 *     summary: Decline an interest request — listing owner only
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
 *         description: Interest request declined
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InterestRequest'
 *       400:
 *         description: Only pending requests can be declined
 *       403:
 *         description: Only the apartment owner can decline requests
 *       404:
 *         description: Request or apartment not found
 */
router.route('/:id/decline').patch(verifyToken, requireLister, declineRequest);
export { router as requestsRouter };
