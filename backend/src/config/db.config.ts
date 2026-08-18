import mongoose from 'mongoose'
import 'dotenv/config'
import { logger } from '../middlewares/Logger.middleware.js'

async function connectToDB() {
  logger.separator()

  try {
    const mongoUri = process.env.MONGO_URI

    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined')
    }

    await mongoose.connect(mongoUri)

    logger.success('Connected to MongoDB')
    logger.info(`Database: ${mongoose.connection.name}`)
    logger.info(`Host: ${mongoose.connection.host}`)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)

    logger.error('Connecting to MongoDB failed')
    logger.error(message)
  }
}

export { connectToDB }
