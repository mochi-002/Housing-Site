import jwt from 'jsonwebtoken'
import type { Request, Response, NextFunction } from 'express'
import 'dotenv/config'
import { sendError } from '../utils/response.util.js'

export interface AuthPayload {
  _id: string
  email: string
  fullName: string
  role: 'Lister' | 'Seeker'
  isAdmin: boolean
}

export interface AuthRequest extends Request {
  user?: AuthPayload
}

/**
 * @description Verifies the JWT sent in the Authorization header
 *               and attaches the decoded payload to req.user
 */
function verifyToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, {
      message: 'No token provided',
      statusCode: 401,
    })
    return
  }

  const token = authHeader.split(' ')[1]

  if (!token) {
    sendError(res, {
      statusCode: 401,
      message: 'Invalid token format',
    })
    return
  }

  const jwtSecret = process.env.JWT_SECRET

  if (!jwtSecret) {
    sendError(res, {
      message: 'JWT secret is not configured',
      statusCode: 500,
    })
    return
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as AuthPayload
    req.user = decoded
    next()
  } catch (err) {
    sendError(res, {
      message: 'Invalid or expired token',
      statusCode: 401,
    })
  }
}

/**
 * @description Verifies the user is an Admin
 */
function verifyAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  const isAdmin = req.user?.isAdmin
  if (isAdmin) {
    next()
  } else {
    sendError(res, {
      message: `Admin access required`,
      statusCode: 403,
    })
  }
}

export default verifyToken
export { verifyAdmin }
