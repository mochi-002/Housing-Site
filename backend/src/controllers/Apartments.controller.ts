import asyncHandler from 'express-async-handler'
import { Listing } from '../models/Listing.model.js'
import { validateListingQuery } from '../validators/Listing.validate.js'
import type { Request, Response } from 'express'

/**
 * @description Get all Apartments (with optional search/filter)
 * @route /listings
 * @method GET
 * @access public
 */
const getAll = asyncHandler(async (req: Request, res: Response) => {
  // 1. Validate query parameters
  const { error, value } = validateListingQuery(req.query)

  if (error) {
    const detail = error.details?.[0]

    res.status(400).json({
      message: detail?.message ?? 'Invalid query parameters',
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

  // 4. Query database
  const apartments = await Listing.find(filter).populate(
    'owner',
    'fullName email -_id',
  )
  res.status(200).json(apartments)
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
    res.status(404).json({
      message: `Apartment not found`,
    })
    return
  }

  res.status(200).json(apartment)
})

export { getAll as getAllApartments, get as getApartment }
