import asyncHandler from 'express-async-handler'
import { Listing } from '../models/Listing.model.js'
import { validateListingQuery } from '../validators/Listing.validate.js'
import type { Request, Response } from 'express'
import type { AuthRequest } from '../middlewares/Auth.middleware.js'
import { InterestRequest } from '../models/InterestRequest.model.js'

/**
 * @description Request an Apartment
 * @route /listings/:id/requests
 * @method POST
 * @access private (seekers or other listers)
 */
const requestApartment = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    // 1. check apartment
    const apartment = await Listing.findById(req.params.id)
    if (!apartment) {
      res.status(404).json({
        message: `Apartment not found`,
      })
      return
    }

    // 2. check that the requester isn't the owner
    if (apartment.owner.equals(req.user!._id)) {
      res.status(403).json({
        message: "You cann't requset your own apartment",
      })
      return
    }

    // 3. check availablity
    if (apartment.status !== 'available') {
      res.status(403).json({
        message: `Apartment isn't available for registeration`,
      })
      return
    }

    // 4. check duplicates
    const existingRequest = await InterestRequest.findOne({
      listing: apartment._id,
      seeker: req.user!._id,
      status: { $in: ['pending', 'accepted'] },
    })

    if (existingRequest) {
      res.status(409).json({
        message:
          existingRequest.status === 'accepted'
            ? 'You already have an accepted request for this apartment'
            : 'You already have a pending request for this apartment',
      })
      return
    }

    // 5. create request
    const interestRequest = await InterestRequest.create({
      listing: apartment._id,
      seeker: req.user!._id,
    })

    res.status(201).json({
      message: 'Request sent successfully',
      request: interestRequest,
    })
  },
)

/**
 * @description Delete any request sent
 * @route /requests/:id
 * @method DELETE
 * @access private (User, Owner Only)
 */
const deleteRequest = asyncHandler(async (req: AuthRequest, res: Response) => {
  const request = await InterestRequest.findById(req.params.id)

  if (!request) {
    res.status(404).json({
      message: 'Request not found',
    })
    return
  }

  if (!request.seeker.equals(req.user!._id)) {
    res.status(403).json({
      message: 'You can only delete your own requests',
    })
    return
  }

  if (request.status !== 'pending') {
    res.status(400).json({
      message: 'Only pending requests can be cancelled',
    })
    return
  }

  await request.deleteOne()

  res.status(200).json({
    message: `Request ${request._id} cancelled successfully`,
  })
})

/**
 * @description Accept an interest request — listing owner only
 * @route /requests/:id/accept
 * @method PATCH
 * @access private (Lister only)
 */

const accept = asyncHandler(async (req: AuthRequest, res: Response) => {
  const request = await InterestRequest.findById(req.params.id)
  if (!request) {
    res.status(404).json({
      message: `Request not found`,
    })
    return
  }

  const listing = await Listing.findById(request.listing)
  if (!listing) {
    res.status(404).json({
      message: `Apartment not found`,
    })
    return
  }

  if (!listing.owner.equals(req.user!._id)) {
    res.status(403).json({
      message: `Only the apartment owner can accept requests`,
    })
    return
  }

  if (request.status !== 'pending') {
    res.status(400).json({
      message: 'Only pending requests can be accepted',
    })
    return
  }

  request.status = 'accepted'
  await request.save()

  res.status(200).json({
    message: 'Interest request accepted',
    request,
  })
})

/**
 * @description Decline an interest request — listing owner only
 * @route /requests/:id/decline
 * @method PATCH
 * @access private (Lister only)
 */

const decline = asyncHandler(async (req: AuthRequest, res: Response) => {
  const request = await InterestRequest.findById(req.params.id)

  if (!request) {
    res.status(404).json({
      message: 'Interest request not found',
    })
    return
  }

  const listing = await Listing.findById(request.listing)

  if (!listing) {
    res.status(404).json({
      message: 'Apartment not found',
    })
    return
  }

  // Only the apartment owner can decline the request
  if (!listing.owner.equals(req.user!._id)) {
    res.status(403).json({
      message: 'Only the apartment owner can decline requests',
    })
    return
  }

  if (request.status !== 'pending') {
    res.status(400).json({
      message: 'Only pending requests can be declined',
    })
    return
  }

  request.status = 'declined'
  await request.save()

  res.status(200).json({
    message: 'Interest request declined',
    request,
  })
})

export {
  requestApartment,
  deleteRequest,
  accept as acceptRequest,
  decline as declineRequest,
}
