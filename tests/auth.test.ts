import request from 'supertest'
import { describe, expect, it } from 'vitest'

import app from '../src/app.js'

describe('Authentication API', () => {
  const email = `auth-${Date.now()}@test.com`
  const password = 'Password123!'

  it('POST /auth/register - registers a new seeker', async () => {
    const response = await request(app).post('/auth/register').send({
      fullName: 'Test User',
      email,
      password,
    })

    expect(response.status).toBe(201)

    expect(response.body.data).toHaveProperty('user')
    expect(response.body.data).toHaveProperty('token')

    expect(response.body.data.user.email).toBe(email)

    // Password must never be returned
    expect(response.body.data.user).not.toHaveProperty('password')
  })

  it('POST /auth/register - rejects duplicate email', async () => {
    const response = await request(app).post('/auth/register').send({
      fullName: 'Test User',
      email,
      password,
    })

    expect(response.status).toBe(400)
  })

  it('POST /auth/register - rejects invalid data', async () => {
    const response = await request(app).post('/auth/register').send({
      fullName: '',
      email: 'not-an-email',
      password: '123',
    })

    expect(response.status).toBe(400)
  })

  it('POST /auth/login - logs in successfully', async () => {
    const response = await request(app).post('/auth/login').send({
      email,
      password,
    })

    expect(response.status).toBe(200)

    expect(response.body.data).toHaveProperty('user')
    expect(response.body.data).toHaveProperty('token')

    expect(response.body.data.user.email).toBe(email)
    expect(response.body.data.user).not.toHaveProperty('password')
  })

  it('POST /auth/login - rejects wrong password', async () => {
    const response = await request(app).post('/auth/login').send({
      email,
      password: 'WrongPassword123!',
    })

    expect(response.status).toBe(400)
  })

  it('POST /auth/login - rejects unknown user', async () => {
    const response = await request(app).post('/auth/login').send({
      email: 'does-not-exist@test.com',
      password,
    })

    expect(response.status).toBe(400)
  })
})
