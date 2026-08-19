import bcrypt from 'bcryptjs'
import request from 'supertest'
import app from '../src/app.js'
import { User } from '../src/models/User.model.js'

export async function createLister() {
  const email = `lister-${Date.now()}-${Math.random()}@test.com`
  const password = 'Password123!'

  const passwordHash = await bcrypt.hash(password, 10)

  const user = await User.create({
    fullName: 'Test Lister',
    email,
    password: passwordHash,
    role: 'Lister',
  })

  return {
    user,
    token: (user as { generateAuthToken(): string }).generateAuthToken(),
    password,
  }
}

export async function registerSeeker(_request?: typeof request) {
  const email = `seeker-${Date.now()}-${Math.random()}@test.com`
  const password = 'Password123!'

  const response = await request(app).post('/auth/register').send({
    fullName: 'Test Seeker',
    email,
    password,
  })

  return {
    user: response.body.data.user,
    token: response.body.data.token,
    email,
    password,
  }
}

export async function registerAdmin() {
  const email = `admin-${Date.now()}-${Math.random()}@test.com`
  const password = 'Password123!'

  const passwordHash = await bcrypt.hash(password, 10)

  const user = await User.create({
    fullName: 'Test Admin',
    email,
    password: passwordHash,
    role: 'Seeker',
    isAdmin: true,
  })

  return {
    user,
    token: (user as { generateAuthToken(): string }).generateAuthToken(),
    email,
    password,
  }
}

export function auth(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  }
}
