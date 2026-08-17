import express, { Router } from 'express'
import verifyToken from '../middlewares/Auth.middleware.js'
import { requireLister } from '../middlewares/Role.middleware.js'
import { getRequests } from '../controllers/User.controller.js'
import { acceptRequest, declineRequest, deleteRequest } from '../controllers/Requests.controller.js'

const router: Router = express.Router()

router.route('/mine').get(verifyToken, getRequests)
router.route('/:id/delete').delete(verifyToken, deleteRequest)
router.route('/:id/accept').patch(verifyToken, requireLister, acceptRequest)
router.route('/:id/decline').patch(verifyToken, requireLister, declineRequest)

export { router as requestsRouter }
