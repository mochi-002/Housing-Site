import express, { Router } from 'express'
import verifyToken from '../middlewares/Auth.middleware.js'
import {
  sendMessage,
  getConversation,
  getConversations,
} from '../controllers/Messages.controller.js'

const router: Router = express.Router()

/**
 * @swagger
 * /messages:
 *   post:
 *     tags:
 *       - Messages
 *     summary: Send a message
 *     description: Send a message to another user, optionally in the context of a listing.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipientId
 *               - content
 *             properties:
 *               recipientId:
 *                 type: string
 *                 example: 64f123456789abcdef123456
 *               content:
 *                 type: string
 *                 example: Hi, is this apartment still available?
 *               listingId:
 *                 type: string
 *                 example: 64f123456789abcdef654321
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       400:
 *         description: Missing recipientId/content or messaging yourself
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Recipient not found
 */
router.route('/').post(verifyToken, sendMessage)

/**
 * @swagger
 * /messages/mine:
 *   get:
 *     tags:
 *       - Messages
 *     summary: Get my conversations
 *     description: Get a preview of every conversation the logged-in user is part of, with unread counts.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conversations fetched successfully
 *       401:
 *         description: Authentication required
 */
router.route('/mine').get(verifyToken, getConversations)

/**
 * @swagger
 * /messages/{userId}:
 *   get:
 *     tags:
 *       - Messages
 *     summary: Get message thread with a user
 *     description: Get the full message thread between the logged-in user and the given user. Marks their messages to you as read.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           example: 64f123456789abcdef123456
 *     responses:
 *       200:
 *         description: Conversation fetched successfully
 *       401:
 *         description: Authentication required
 */
router.route('/:userId').get(verifyToken, getConversation)

export { router as messagesRouter }
