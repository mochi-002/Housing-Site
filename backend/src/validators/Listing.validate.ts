import Joi from 'joi'

function validateCreating(obj: Object) {
  const schema = Joi.object({
    location: Joi.string().trim().required(),
    price: Joi.number().min(0).required(),
    roomsAvailable: Joi.number().integer().min(0).required(),
    description: Joi.string().trim().required(),
    status: Joi.string().valid('available', 'full'),
  })

  return schema.validate(obj)
}

function validateUpdating(obj: Object) {
  const schema = Joi.object({
    location: Joi.string().trim(),
    price: Joi.number().min(0),
    roomsAvailable: Joi.number().integer().min(0),
    description: Joi.string().trim(),
    status: Joi.string().valid('available', 'full'),
  })
    .min(1)
    .unknown(false)

  return schema.validate(obj)
}

function validateQuerySchema(obj: Object) {
  const schema = Joi.object({
    location: Joi.string().trim(),
    minPrice: Joi.number().min(0),
    maxPrice: Joi.number().min(0),
    rooms: Joi.number().integer().min(1),
    status: Joi.string().valid('available', 'full'),
  })

  return schema.validate(obj)
}

export {
  validateCreating as validateCreateListing,
  validateUpdating as validateUpdateListing,
  validateQuerySchema as validateListingQuery,
}
