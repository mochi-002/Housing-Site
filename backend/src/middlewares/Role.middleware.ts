import type { Request, Response, NextFunction } from 'express'
import type { AuthRequest } from './Auth.middleware.js'
/**
 * @description Restricts a route to specific roles.
 *               Must run AFTER verifyToken, since it reads req.user.
 * @example router.post('/listings', verifyToken, authorize('Lister'), createListing)
 */

function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const allowedRoles = ['Lister', 'Seeker']
  if (!req.user) {
    res.status(401).json({ message: 'Not authenticated' })
    return
  }

  if (!allowedRoles.includes(req.user.role)) {
    res.status(403).json({
      message: `Access denied. This action requires role: ${allowedRoles.join(' or ')}`,
    })
    return
  }

  next()
}

function authenticateLister(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== 'Lister') {
    res.status(403).json({
      message: `Only Listers can perform this action`,
    })
    return
  }
  next()
}

function authenticateSeeker(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== 'Seeker') {
    res.status(403).json({
      message: `Only Seekers can perform this action`,
    })
    return
  }
  next()
}

export { authenticate, authenticateLister as requireLister, authenticateSeeker as requireSeeker }
