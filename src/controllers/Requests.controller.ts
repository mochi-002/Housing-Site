import asyncHandler from 'express-async-handler'
import { Listing } from '../models/Listing.model.js'
import type { Response } from 'express'
import type { AuthRequest } from '../middlewares/Auth.middleware.js'
import { InterestRequest } from '../models/InterestRequest.model.js'
import { sendError, sendSuccess } from '../utils/response.util.js'

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
      sendError(res, {
        message: `Apartment not found`,
        statusCode: 404,
      })
      return
    }

    // 2. check that the requester isn't the owner
    if (apartment.owner.equals(req.user!._id)) {
      sendError(res, {
        message: "You cann't requset your own apartment",
        statusCode: 403,
      })
      return
    }

    // 3. check availablity
    if (apartment.status !== 'available') {
      sendError(res, {
        message: `Apartment isn't available for registeration`,
        statusCode: 403,
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
      sendError(res, {
        message:
          existingRequest.status === 'accepted'
            ? 'You already have an accepted request for this apartment'
            : 'You already have a pending request for this apartment',
        statusCode: 409,
      })
      return
    }

    // 5. create request
    const interestRequest = await InterestRequest.create({
      listing: apartment._id,
      seeker: req.user!._id,
    })

    sendSuccess(res, {
      message: 'Request sent successfully',
      data: { request: interestRequest },
      statusCode: 201,
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
    sendError(res, {
      message: 'Request not found',
      statusCode: 404,
    })
    return
  }

  if (!request.seeker.equals(req.user!._id)) {
    sendError(res, {
      message: 'You can only delete your own requests',
      statusCode: 403,
    })
    return
  }

  if (request.status !== 'pending') {
    sendError(res, {
      message: 'Only pending requests can be cancelled',
      statusCode: 400,
    })
    return
  }

  await request.deleteOne()

  sendSuccess(res, {
    message: `Request ${request._id} cancelled successfully`,
    data: { request },
    statusCode: 200,
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
    sendError(res, {
      message: `Request not found`,
      statusCode: 404,
    })
    return
  }

  const listing = await Listing.findById(request.listing)
  if (!listing) {
    sendError(res, {
      message: `Apartment not found`,
      statusCode: 404,
    })
    return
  }

  if (!listing.owner.equals(req.user!._id)) {
    sendError(res, {
      message: `Only the apartment owner can accept requests`,
      statusCode: 403,
    })
    return
  }

  if (request.status !== 'pending') {
    sendError(res, {
      message: 'Only pending requests can be accepted',
      statusCode: 400,
    })
    return
  }

  request.status = 'accepted'
  await request.save()

  sendSuccess(res, {
    message: 'Interest request accepted',
    data: { request },
    statusCode: 200,
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
    sendError(res, {
      message: 'Interest request not found',
      statusCode: 404,
    })
    return
  }

  const listing = await Listing.findById(request.listing)

  if (!listing) {
    sendError(res, {
      message: 'Apartment not found',
      statusCode: 404,
    })
    return
  }

  // Only the apartment owner can decline the request
  if (!listing.owner.equals(req.user!._id)) {
    sendError(res, {
      message: 'Only the apartment owner can decline requests',
      statusCode: 403,
    })
    return
  }

  if (request.status !== 'pending') {
    sendError(res, {
      message: 'Only pending requests can be declined',
      statusCode: 400,
    })
    return
  }

  request.status = 'declined'
  await request.save()

  sendSuccess(res, {
    message: 'Interest request declined',
    data: { request },
    statusCode: 200,
  })
})

export {
  requestApartment,
  deleteRequest,
  accept as acceptRequest,
  decline as declineRequest,
}
