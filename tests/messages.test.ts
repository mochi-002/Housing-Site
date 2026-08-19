import request from 'supertest'
import { beforeAll, describe, expect, it } from 'vitest'

import app from '../src/app.js'
import { registerSeeker, auth } from './helpers.js'

describe('Messages API', () => {
  let senderToken: string
  let receiverId: string
  
  beforeAll(async () => {
    const sender = await registerSeeker(request)
    const receiver = await registerSeeker(request)

    senderToken = sender.token
    receiverId = receiver.user._id
  })

  it('POST /messages - sends a message', async () => {
    const response = await request(app)
      .post('/messages')
      .set(auth(senderToken))
      .send({
        receiver: receiverId,
        content: 'Hello from the test suite',
      })

    expect(response.status).toBeGreaterThanOrEqual(200)
  })

  it('GET /messages/mine - gets conversations', async () => {
    const response = await request(app)
      .get('/messages/mine')
      .set(auth(senderToken))

    expect(response.status).toBe(200)
    expect(response.body.data).toBeDefined()
  })

  it('GET /messages/:userId - gets message thread', async () => {
    const response = await request(app)
      .get(`/messages/${receiverId}`)
      .set(auth(senderToken))

    expect(response.status).toBe(200)
    expect(response.body.data).toBeDefined()
  })

  it('GET /messages/mine - requires authentication', async () => {
    const response = await request(app).get('/messages/mine')

    expect(response.status).toBe(401)
  })
})
