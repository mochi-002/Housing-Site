import asyncHandler from 'express-async-handler';
import { Listing } from '../models/Listing.model.js';
import { InterestRequest } from '../models/InterestRequest.model.js';
import { validateCreateListing, validateUpdateListing, } from '../validators/Listing.validate.js';
import { sendSuccess, sendError } from '../utils/response.util.js';
/**
 * @description Create new Apartment
 * @route /listings
 * @method POST
 * @access private (Lister only)
 */
const create = asyncHandler(async (req, res) => {
    const { error, value } = validateCreateListing(req.body);
    if (error) {
        sendError(res, {
            message: error.details[0]?.message ?? 'Validation failed',
            statusCode: 400,
        });
        return;
    }
    const apartment = await Listing.create({
        ...value,
        owner: req.user._id,
    });
    sendSuccess(res, {
        message: 'Apartment created successfully',
        data: { apartment },
        statusCode: 201,
    });
});
/**
 * @description Update an Apartment — owner only
 * @route /listings/:id
 * @method PUT
 * @access private (Lister only)
 */
const update = asyncHandler(async (req, res) => {
    const apartment = await Listing.findById(req.params.id);
    if (!apartment) {
        sendError(res, { message: 'Apartment not found', statusCode: 404 });
        return;
    }
    if (!apartment.owner.equals(req.user._id)) {
        sendError(res, {
            message: 'You can only edit your own listings',
            statusCode: 403,
        });
        return;
    }
    const { error, value } = validateUpdateListing(req.body);
    if (error) {
        sendError(res, {
            message: error.details[0]?.message ?? 'Validation failed',
            statusCode: 400,
        });
        return;
    }
    const { location, price, roomsAvailable, description, status } = value;
    if (location !== undefined)
        apartment.location = location;
    if (price !== undefined)
        apartment.price = price;
    if (roomsAvailable !== undefined)
        apartment.roomsAvailable = roomsAvailable;
    if (description !== undefined)
        apartment.description = description;
    if (status !== undefined)
        apartment.status = status;
    await apartment.save();
    sendSuccess(res, {
        message: 'Apartment updated successfully',
        data: { apartment },
        statusCode: 200,
    });
});
/**
 * @description Delete an Apartment
 * @route /listings/:id
 * @method DELETE
 * @access private (Lister only)
 */
const remove = asyncHandler(async (req, res) => {
    const apartment = await Listing.findById(req.params.id);
    if (!apartment) {
        sendError(res, { message: 'Apartment not found', statusCode: 404 });
        return;
    }
    if (!apartment.owner.equals(req.user._id)) {
        sendError(res, {
            message: 'You can only delete your own listings',
            statusCode: 403,
        });
        return;
    }
    const hasAcceptedRequest = await InterestRequest.exists({
        listing: apartment._id,
        status: 'accepted',
    });
    if (hasAcceptedRequest) {
        sendError(res, {
            message: 'Cannot delete a listing that has an accepted interest request',
            statusCode: 400,
        });
        return;
    }
    await apartment.deleteOne();
    sendSuccess(res, {
        message: 'Apartment deleted successfully',
        statusCode: 200,
    });
});
/**
 * @description View all interest requests sent to a lister's apartment
 * @route /listings/:id/requests
 * @method GET
 * @access private (lister only)
 */
const getListerRequests = asyncHandler(async (req, res) => {
    const listingId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
    if (!listingId) {
        sendError(res, { message: 'Listing id is required', statusCode: 400 });
        return;
    }
    const listing = await Listing.findById(listingId);
    if (!listing) {
        sendError(res, { message: 'Apartment not found', statusCode: 404 });
        return;
    }
    if (!listing.owner.equals(req.user._id)) {
        sendError(res, {
            message: 'You can only view requests for your own apartment',
            statusCode: 403,
        });
        return;
    }
    const requests = await InterestRequest.find({ listing: listingId })
        .populate('seeker', 'fullName email -_id')
        .select('listing seeker -_id')
        .select('-__v');
    sendSuccess(res, {
        message: requests.length === 0
            ? 'No interest requests found'
            : 'Interest requests fetched successfully',
        data: { requests },
        statusCode: 200,
    });
});
export { create as createApartment, update as updateApartment, remove as deleteApartment, getListerRequests, };
