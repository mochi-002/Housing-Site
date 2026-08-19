import express, { Router } from 'express'
import verifyToken, { verifyAdmin } from '../middlewares/Auth.middleware.js'
import {
  getMyStats,
  getOverviewStats,
} from '../controllers/Stats.controller.js'

const router: Router = express.Router()

/**
 * @swagger
 * /stats/me:
 *   get:
 *     tags:
 *       - Stats
 *     summary: My dashboard stats
 *     description: Role-aware stats — Listers get their listings/requests breakdown, Seekers get their request history breakdown.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stats fetched successfully
 *       401:
 *         description: Authentication required
 */
router.route('/me').get(verifyToken, getMyStats)

/**
 * @swagger
 * /stats/overview:
 *   get:
 *     tags:
 *       - Stats
 *     summary: Platform-wide stats
 *     description: Global counts across users, listings, and requests. Admin only.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Overview stats fetched successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */
router.route('/overview').get(verifyToken, verifyAdmin, getOverviewStats)

export { router as statsRouter }
