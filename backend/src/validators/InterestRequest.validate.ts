import Joi from 'joi'

function validateCreating(obj: Object) {
  const schema = Joi.object({
    listing: Joi.string().required(),
    seeker: Joi.string().required(),
    status: Joi.string()
      .valid('pending', 'accepted', 'declined')
      .default('pending'),
  })

  return schema.validate(obj)
}

function validateUpdating(obj: Object) {
  const schema = Joi.object({
    listing: Joi.string(),
    seeker: Joi.string(),
    status: Joi.string().valid('pending', 'accepted', 'declined'),
  }).min(1)

  return schema.validate(obj)
}

export {
  validateCreating as validateCreateInterestRequest,
  validateUpdating as validateUpdateInterestRequest,
}
