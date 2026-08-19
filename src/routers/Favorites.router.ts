import express, { Router } from 'express'
import verifyToken from '../middlewares/Auth.middleware.js'
import { requireSeeker } from '../middlewares/Role.middleware.js'
import {
  addFavorite,
  removeFavorite,
  listFavorites,
} from '../controllers/Favorites.controller.js'

const router: Router = express.Router()

/**
 * @swagger
 * /favorites/mine:
 *   get:
 *     tags:
 *       - Favorites
 *     summary: Get my favorited listings
 *     description: Get every listing the logged-in seeker has saved.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Favorites fetched successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Only seekers can have favorites
 */
router.route('/mine').get(verifyToken, listFavorites)

/**
 * @swagger
 * /favorites/{id}:
 *   post:
 *     tags:
 *       - Favorites
 *     summary: Save a listing to favorites
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: 64f123456789abcdef123456
 *     responses:
 *       201:
 *         description: Listing added to favorites
 *       404:
 *         description: Apartment not found
 *       409:
 *         description: Listing already in favorites
 *   delete:
 *     tags:
 *       - Favorites
 *     summary: Remove a listing from favorites
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: 64f123456789abcdef123456
 *     responses:
 *       200:
 *         description: Listing removed from favorites
 *       404:
 *         description: Listing not in favorites
 */
router
  .route('/:id')
  .post(verifyToken, addFavorite)
  .delete(verifyToken, removeFavorite)

export { router as favoritesRouter }
