// tests/setup.ts
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { beforeAll, afterAll } from 'vitest'

dotenv.config({
  path: '.env.test',
})

beforeAll(async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not defined')
  }

  await mongoose.connect(process.env.MONGO_URI)
})

afterAll(async () => {
  await mongoose.connection.close()
})