import mongoose from 'mongoose'
import 'dotenv/config'
import { logger } from '../middlewares/Logger.middleware.js'

async function connectToDB() {
  logger.separator()
  try {
    await mongoose.connect(process.env.MONGO_URI!)
    logger.success('Connected to mongoDB')
    if (process.env.MONGO_USERNAME)
      logger.info(`On mongodb+srv://${process.env.MONGO_USERNAME}`)
    else logger.info(`On mongodb://127.0.0.1:27017/Shaqty`)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    logger.error(`Connecting to mongoDB failed`)
    logger.error(`${message}`)
  }
}

export { connectToDB }
