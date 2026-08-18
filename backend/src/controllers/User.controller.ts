import asyncHandler from 'express-async-handler'
import { Listing } from '../models/Listing.model.js'
import { validateListingQuery } from '../validators/Listing.validate.js'
import type { Request, Response } from 'express'
import type { AuthRequest } from '../middlewares/Auth.middleware.js'
import { InterestRequest } from '../models/InterestRequest.model.js'
import { sendError, sendSuccess } from '../utils/response.util.js'

const SORT_OPTIONS: Record<string, Record<string, 1 | -1> | null> = {
  none: null,
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
}

/**
 * @description Get all Apartments  (with optional search/filter, sorting, and pagination)
 * @route /listings
 * @method GET
 * @access public
 */
const getAll = asyncHandler(async (req: Request, res: Response) => {
  // 1. Validate query parameters
  const { error, value } = validateListingQuery(req.query)

  if (error) {
    sendError(res, {
      message: error.details?.[0]?.message ?? 'Invalid query parameters',
      statusCode: 400,
    })
    return
  }

  // 2. Use the validated/sanitized values
  const { location, minPrice, maxPrice, rooms, status } = value

  // 3. Build MongoDB filter
  const filter: Record<string, any> = {}
  if (location) filter.location = { $regex: location as string, $options: 'i' }
  if (rooms) filter.roomsAvailable = { $gte: Number(rooms) }
  if (status) filter.status = status
  if (minPrice || maxPrice) {
    filter.price = {}
    if (minPrice) filter.price.$gte = Number(minPrice)
    if (maxPrice) filter.price.$lte = Number(maxPrice)
  }

  // 4. Pagination
  const page = parseInt(req.query.page as string, 10) || 1
  const limit = Math.min(
    50,
    Math.max(1, parseInt(req.query.limit as string, 10)),
  )
  const skip = (page - 1) * limit

  // 5. Sorting
  const sortKey = typeof req.query.sort === 'string' ? req.query.sort : 'none'
  const sortOption = SORT_OPTIONS[sortKey] ?? SORT_OPTIONS.none!

  // 6. Query database
  const apartments = await Listing.find(filter)
    .populate('owner', 'fullName email -_id')
    .sort(sortOption)
    .skip(skip)
    .limit(limit)

  // 7. response
  sendSuccess(res, {
    message:
      apartments.length === 0
        ? 'No apartments found'
        : 'Apartments fetched successfully',
    data: { apartments },
    statusCode: 200,
  })
})

/**
 * @description Get a single Apartment
 * @route /listings/:id
 * @method GET
 * @access public
 */
const get = asyncHandler(async (req: Request, res: Response) => {
  const apartment = await Listing.findById(req.params.id).populate(
    'owner',
    'fullName email -_id',
  )

  if (!apartment) {
    sendError(res, { message: 'Apartment not found', statusCode: 404 })
    return
  }

  sendSuccess(res, {
    message: 'Apartment fetched successfully',
    data: { apartment },
    statusCode: 200,
  })
})

/**
 * @description View all interest requests sent by the logged-in seeker
 * @route /listings/:id/requests
 * @method GET
 * @access private
 */
const getRequests = asyncHandler(async (req: AuthRequest, res: Response) => {
  const requests = await InterestRequest.find({
    seeker: req.user!._id,
  })
    .populate(
      'listing',
      'location price roomsAvailable description status owner',
    )
    .populate('seeker', 'fullName email')
    .select('-__v')

  sendSuccess(res, {
    message:
      requests.length === 0
        ? 'No requests found'
        : 'Requests fetched successfully',
    data: { requests },
    statusCode: 200,
  })
})

export { getAll as getAllApartments, get as getApartment, getRequests }
