import request from 'supertest'
import { beforeAll, describe, expect, it } from 'vitest'

import app from '../src/app.js'
import { createLister, registerSeeker, auth } from './helpers.js'

describe('Favorites API', () => {
  let seekerToken: string
  let otherSeekerToken: string
  let listerToken: string
  let listingId: string

  beforeAll(async () => {
    const lister = await createLister()
    const seeker = await registerSeeker(request)
    const otherSeeker = await registerSeeker(request)

    listerToken = lister.token
    seekerToken = seeker.token
    otherSeekerToken = otherSeeker.token

    const response = await request(app)
      .post('/listings')
      .set(auth(listerToken))
      .send({
        location: 'Cairo',
        price: 4500,
        roomsAvailable: 2,
        description: 'Favorite test listing',
        status: 'available',
      })

    listingId = response.body.data.apartment._id
  })

  it('POST /favorites/:listingId - saves a listing', async () => {
    const response = await request(app)
      .post(`/favorites/${listingId}`)
      .set(auth(seekerToken))

    expect(response.status).toBeGreaterThanOrEqual(200)
    expect(response.status).toBeLessThan(300)
  })

  it('POST /favorites/:listingId - rejects duplicate favorite', async () => {
    const response = await request(app)
      .post(`/favorites/${listingId}`)
      .set(auth(seekerToken))

    expect([400, 409]).toContain(response.status)
  })

  it('GET /favorites/mine - gets saved listings', async () => {
    const response = await request(app)
      .get('/favorites/mine')
      .set(auth(seekerToken))

    expect(response.status).toBe(200)
    expect(response.body.data).toBeDefined()
  })

  it('GET /favorites/mine - requires authentication', async () => {
    const response = await request(app).get('/favorites/mine')

    expect(response.status).toBe(401)
  })

  it('DELETE /favorites/:listingId - removes favorite', async () => {
    const response = await request(app)
      .delete(`/favorites/${listingId}`)
      .set(auth(seekerToken))

    expect(response.status).toBeGreaterThanOrEqual(200)
    expect(response.status).toBeLessThan(300)
  })

  it('DELETE /favorites/:listingId - rejects removing nonexistent favorite', async () => {
    const response = await request(app)
      .delete(`/favorites/${listingId}`)
      .set(auth(otherSeekerToken))

    expect([400, 404]).toContain(response.status)
  })
})
