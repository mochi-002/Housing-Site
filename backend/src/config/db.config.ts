import mongoose from 'mongoose'
import 'dotenv/config'
import { logger } from '../middlewares/Logger.middleware.js'

async function connectToDB() {
  logger.separator()
  try {
    await mongoose.connect(process.env.MONGO_URI!)
    logger.success('Connected to mongoDB')
    logger.info(`On mongodb+srv://${process.env.MONGO_USERNAME}`)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    logger.error(`Connecting to mongoDB failed`)
    logger.error(`${message}`)
  }
}

export { connectToDB }
