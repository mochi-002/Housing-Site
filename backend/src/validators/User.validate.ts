import Joi from 'joi'

function validateCreating(obj: Object) {
  const schema = Joi.object({
    fullName: Joi.string().trim().required(),
    email: Joi.string().email().trim().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('Lister', 'Seeker').required(),
  })

  return schema.validate(obj)
}

function validateUpdating(obj: Object) {
  const schema = Joi.object({
    fullName: Joi.string().trim(),
    email: Joi.string().email().trim(),
    password: Joi.string().min(6),
    role: Joi.string().valid('Lister', 'Seeker'),
  }).min(1)

  return schema.validate(obj)
}

function validateRegister(obj: Object) {
  const schema = Joi.object({
    fullName: Joi.string().trim().required(),
    email: Joi.string().email().trim().required(),
    password: Joi.string().min(6).required(),
  })
  return schema.validate(obj)
}

function validateLogin(obj: Object) {
  const schema = Joi.object({
    email: Joi.string().email().trim().required(),
    password: Joi.string().min(6).required(),
  })
  return schema.validate(obj)
}

export {
  validateCreating as validateCreateUser,
  validateUpdating as validateUpdateUser,
  validateRegister,
  validateLogin,
}
