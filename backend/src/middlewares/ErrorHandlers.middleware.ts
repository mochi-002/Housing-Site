import express from 'express'
import mongoose from 'mongoose'

export const notFound = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  })
}

export const errorHandler = (
  err: Error,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  res.status(500).json({
    success: false,
    message: 'Something went wrong, please try again later',
  })
}

export const validateId = (id: string, res: express.Response): boolean => {
  if (!mongoose.isValidObjectId(id)) {
    res.status(400).json({
      message: 'Invalid post ID',
    })

    return false
  }

  return true
}
