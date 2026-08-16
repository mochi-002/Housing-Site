import asyncHandler from 'express-async-handler'
import bcrypt from 'bcryptjs'
import { User } from '../models/User.model.js'
import { validateLogin, validateRegister } from '../validators/User.validate.js'
import type { Request, Response } from 'express'

/**
 * @description Register New User
 * @route /auth/register
 * @method POST
 * @access public
 */
const register = asyncHandler(async (req: Request, res: Response) => {
  // 1. Validate request payload
  const { error } = validateRegister(req.body)

  if (error) {
    const detail = error.details?.[0]

    res.status(400).json({
      message: detail?.message ?? 'Validation failed',
    })
    return
  }

  // 2. Extract user data
  const { fullName, email, password } = req.body

  // 3. Ensure user doesn't already exist
  const existingUser = await User.findOne({ email })

  if (existingUser) {
    res.status(400).json({
      message: 'This user is already registered',
    })
    return
  }

  // 4. Hash password
  const hashedPassword = await bcrypt.hash(password, 10)

  // 5. Create user
  const user = new User({
    fullName,
    email,
    password: hashedPassword,
    role: 'Seeker',
  })

  // 6. Save user
  await user.save()

  // 7. Generate JWT
  const token = user.generateAuthToken()

  // 8. Remove password from response
  const userObject = user.toObject()
  const { password: _password, ...other } = userObject

  // 9. Send response
  res.status(201).json({
    message: 'User registered successfully',
    user: other,
    token,
  })
})

/**
 * @description User Login
 * @route /auth/login
 * @method POST
 * @access public
 */
const login = asyncHandler(async (req: Request, res: Response) => {
  // 1. Validate request payload against login validation schema
  const { error } = validateLogin(req.body)

  if (error) {
    const detail = error.details?.[0]

    res.status(400).json({
      message: detail?.message ?? 'Validation failed',
    })
    return
  }

  const { email, password } = req.body

  // 2. Fetch target user by email address
  const existingUser = await User.findOne({ email })

  if (!existingUser) {
    res.status(400).json({
      message: 'User not found, Invalid email or password',
    })
    return
  }

  // 3. Verify plain text password against stored hashed password
  const isPasswordMatch = await bcrypt.compare(password, existingUser.password)
  if (!isPasswordMatch) {
    res.status(400).json({ message: 'Invalid email or password' })
    return
  }

  // 4. Gen JWT and Omit sensitive password field before sending user document back
  const token = existingUser.generateAuthToken()

  const userObject = existingUser.toObject()
  const { password: _password, ...other } = userObject

  // 5. Send 200 OK response containing sanitized user details
  res.status(200).json({
    message: 'User logged in successfully',
    user: other,
    token,
  })
})

export { register, login }
