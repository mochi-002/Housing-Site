import asyncHandler from 'express-async-handler'
import { Listing } from '../models/Listing.model.js'
import { InterestRequest } from '../models/InterestRequest.model.js'
import { User } from '../models/User.model.js'
import type { Response } from 'express'
import type { AuthRequest } from '../middlewares/Auth.middleware.js'
import { sendSuccess, sendError } from '../utils/response.util.js'

/**
 * @description Role-aware dashboard stats for the logged-in user
 * @route /stats/me
 * @method GET
 * @access private
 */
const getMyStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (req.user!.role === 'Lister') {
    const listingIds = await Listing.find({ owner: req.user!._id }).distinct(
      '_id',
    )

    const [totalListings, listingsByStatus, requestsReceivedByStatus] =
      await Promise.all([
        Listing.countDocuments({ owner: req.user!._id }),
        Listing.aggregate([
          { $match: { owner: req.user!._id } },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
        InterestRequest.aggregate([
          { $match: { listing: { $in: listingIds } } },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
      ])

    sendSuccess(res, {
      message: 'Lister stats fetched successfully',
      data: { totalListings, listingsByStatus, requestsReceivedByStatus },
      statusCode: 200,
    })
    return
  }

  // Seeker stats
  const requestsByStatus = await InterestRequest.aggregate([
    { $match: { seeker: req.user!._id } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ])

  const totalRequests = requestsByStatus.reduce((sum, r) => sum + r.count, 0)

  sendSuccess(res, {
    message: 'Seeker stats fetched successfully',
    data: { totalRequests, requestsByStatus },
    statusCode: 200,
  })
})

/**
 * @description Global stats across the whole platform
 * @route /stats/overview
 * @method GET
 * @access private (admin only)
 */
const getOverviewStats = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.user!.isAdmin) {
      sendError(res, { message: 'Admin access required', statusCode: 403 })
      return
    }

    const [
      totalUsers,
      usersByRole,
      totalListings,
      listingsByStatus,
      requestsByStatus,
    ] = await Promise.all([
      User.countDocuments(),
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      Listing.countDocuments(),
      Listing.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      InterestRequest.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ])

    sendSuccess(res, {
      message: 'Overview stats fetched successfully',
      data: {
        totalUsers,
        usersByRole,
        totalListings,
        listingsByStatus,
        requestsByStatus,
      },
      statusCode: 200,
    })
  },
)

export { getMyStats, getOverviewStats }
