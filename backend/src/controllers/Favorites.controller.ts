import asyncHandler from 'express-async-handler'
import { User } from '../models/User.model.js'
import { Listing } from '../models/Listing.model.js'
import type { Response } from 'express'
import type { AuthRequest } from '../middlewares/Auth.middleware.js'
import { sendSuccess, sendError } from '../utils/response.util.js'
import { validateId } from '../middlewares/ErrorHandlers.middleware.js'

/**
 * @description Save a listing to favorites
 * @route /favorites/:id
 * @method POST
 * @access private (Seeker only)
 */
const addFavorite = asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  if (!validateId(id, res)) return

  const apartment = await Listing.findById(id)
  if (!apartment) {
    sendError(res, {
      message: `Apartment not found`,
      statusCode: 404,
    })
    return
  }

  const user = await User.findById(req.user!._id)
  if (!user) {
    sendError(res, { message: 'User not found', statusCode: 404 })
    return
  }

  const alreadySaved = user.favorites.some((f) => f.equals(apartment._id))
  if (alreadySaved) {
    sendError(res, {
      message: 'Listing already in favorites',
      statusCode: 409,
    })
    return
  }

  user.favorites.push(apartment._id)
  await user.save()

  sendSuccess(res, {
    message: 'Listing added to favorites',
    statusCode: 201,
  })
})

/**
 * @description Remove a listing from favorites
 * @route /favorites/:id
 * @method DELETE
 * @access private (Seeker only)
 */
const removeFavorite = asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  if (!validateId(id, res)) return

  const user = await User.findById(req.user!._id)
  if (!user) {
    sendError(res, { message: 'User not found', statusCode: 404 })
    return
  }

  const wasSaved = user.favorites.some((f) => f.equals(id))
  if (!wasSaved) {
    sendError(res, { message: 'Listing not in favorites', statusCode: 404 })
    return
  }

  user.favorites = user.favorites.filter((f) => !f.equals(id))
  await user.save()

  sendSuccess(res, {
    message: 'Listing removed from favorites',
    statusCode: 200,
  })
})

/**
 * @description Get all favorited listings for the logged-in seeker
 * @route /favorites/mine
 * @method GET
 * @access private (Seeker only)
 */
const listFavorites = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!._id).populate({
    path: 'favorites',
    populate: {
      path: 'owner',
      select: 'fullName email -_id',
    },
  })

  const favorites = user?.favorites ?? []

  sendSuccess(res, {
    message:
      favorites.length === 0
        ? 'No favorites found'
        : 'Favorites fetched successfully',
    data: { favorites },
    statusCode: 200,
  })
})

export { addFavorite, removeFavorite, listFavorites }
