import asyncHandler from 'express-async-handler'
import { Listing } from '../models/Listing.model.js'
import { User } from '../models/User.model.js'
import { InterestRequest } from '../models/InterestRequest.model.js'
import {
  validateCreateListing,
  validateUpdateListing,
} from '../validators/Listing.validate.js'
import type { Request, Response } from 'express'
import type { AuthRequest } from '../middlewares/Auth.middleware.js'

/**
 * @description Create new Apartment
 * @route /listings
 * @method POST
 * @access private (Lister only)
 */
const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { error, value } = validateCreateListing(req.body)
  if (error) {
    res.status(400).json({
      message: error.details[0]?.message,
    })
    return
  }

  const apartment = await Listing.create({
    ...value,
    owner: req.user!._id,
  })

  res.status(201).json({
    message: `Apartment created Successfully`,
    apartment,
  })
})

/**
 * @description Update an Apartment — owner only
 * @route /listings/:id
 * @method PUT
 * @access private (Lister only)
 */
const update = asyncHandler(async (req: AuthRequest, res: Response) => {
  const apartment = await Listing.findById(req.params.id)

  if (!apartment) {
    res.status(404).json({
      message: 'Apartment not found',
    })
    return
  }

  if (!apartment.owner.equals(req.user!._id)) {
    res.status(403).json({
      message: 'You can only edit your own listings',
    })
    return
  }

  const { error, value } = validateUpdateListing(req.body)
  if (error) {
    res.status(400).json({
      message: error.details[0]?.message,
    })
    return
  }

  const { location, price, roomsAvailable, description, status } = value

  if (location !== undefined) apartment.location = location
  if (price !== undefined) apartment.price = price
  if (roomsAvailable !== undefined) apartment.roomsAvailable = roomsAvailable
  if (description !== undefined) apartment.description = description
  if (status !== undefined) apartment.status = status

  await apartment.save()
  res.status(200).json({ message: 'Apartment updated', apartment })
})

/**
 * @description Delete an Apartment
 * @route /listings/:id
 * @method DELETE
 * @access private (Lister only)
 */
const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
  const apartment = await Listing.findById(req.params.id)

  if (!apartment) {
    res.status(404).json({
      message: 'Apartment not found',
    })
    return
  }

  if (!apartment.owner.equals(req.user!._id)) {
    res.status(403).json({
      message: 'You can only delete your own listings',
    })
    return
  }

  // prevent deleting an apartment with an accepted request
  const hasAcceptedRequest = await InterestRequest.exists({
    listing: apartment._id,
    status: 'accepted',
  })

  if (hasAcceptedRequest) {
    res.status(400).json({
      message: 'Cannot delete a listing that has an accepted interest request',
    })
    return
  }

  await apartment.deleteOne()
  res.status(200).json({
    message: `Apartment Deleted Successfully`,
  })
})

/**
 * @description View all interest requests sent to a lister's apartment
 * @route /listings/:id/requests
 * @method GET
 * @access private (lister only)
 */
const getListerRequests = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const listingId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id

    if (!listingId) {
      res.status(400).json({
        message: 'Listing id is required',
      })
      return
    }

    // 1. check apartment first
    const listing = await Listing.findById(listingId)

    if (!listing) {
      res.status(404).json({
        message: 'Apartment not found',
      })
      return
    }

    // 2. Make sure the logged-in lister owns this apartment
    if (!listing.owner.equals(req.user!._id)) {
      res.status(403).json({
        message: 'You can only view requests for your own apartment',
      })
      return
    }

    const requests = await InterestRequest.find({
      listing: listingId,
    })
      .populate('seeker', 'fullName email -_id')
      .select('listing seeker -_id')
      .select('-__v')

    if (requests.length === 0) {
      res.status(404).json({
        message: 'No interest requests found',
      })
      return
    }

    res.status(200).json(requests)
  },
)

export {
  create as createApartment,
  update as updateApartment,
  remove as deleteApartment,
  getListerRequests,
}
