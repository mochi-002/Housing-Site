import express from 'express'
import mongoose from 'mongoose'

export const notFound = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  const error = new Error(`Not Found - ${req.originalUrl}`)
  res.status(404)

  next(error)
}

export const errorHandler = (
  err: Error,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode
  res.status(statusCode).json({ message: err.message })
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
