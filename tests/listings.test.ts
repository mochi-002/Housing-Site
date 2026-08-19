import request from 'supertest'
import { beforeAll, describe, expect, it } from 'vitest'

import app from '../src/app.js'
import { createLister, registerSeeker, auth } from './helpers.js'

describe('Listings API', () => {
  let listerToken: string
  let seekerToken: string
  let otherListerToken: string

  let listingId: string
  let deleteListingId: string

  beforeAll(async () => {
    const lister = await createLister()
    const otherLister = await createLister()
    const seeker = await registerSeeker(request)

    listerToken = lister.token
    otherListerToken = otherLister.token
    seekerToken = seeker.token

    const createResponse = await request(app)
      .post('/listings')
      .set(auth(listerToken))
      .send({
        location: 'Cairo',
        price: 5000,
        roomsAvailable: 2,
        description: 'Test apartment',
        status: 'available',
      })

    expect(createResponse.status).toBe(201)

    listingId = createResponse.body.data.apartment._id

    const deleteResponse = await request(app)
      .post('/listings')
      .set(auth(listerToken))
      .send({
        location: 'Giza',
        price: 4000,
        roomsAvailable: 1,
        description: 'Apartment to delete',
        status: 'available',
      })

    deleteListingId = deleteResponse.body.data.apartment._id
  })

  describe('GET /listings', () => {
    it('gets all listings', async () => {
      const response = await request(app).get('/listings')

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveProperty('apartments')
      expect(Array.isArray(response.body.data.apartments)).toBe(true)
    })

    it('filters listings by location', async () => {
      const response = await request(app).get('/listings').query({
        location: 'Cairo',
      })

      expect(response.status).toBe(200)

      for (const apartment of response.body.data.apartments) {
        expect(apartment.location.toLowerCase()).toContain('cairo')
      }
    })

    it('filters listings by price', async () => {
      const response = await request(app).get('/listings').query({
        minPrice: 1000,
        maxPrice: 6000,
      })

      expect(response.status).toBe(200)

      for (const apartment of response.body.data.apartments) {
        expect(apartment.price).toBeGreaterThanOrEqual(1000)
        expect(apartment.price).toBeLessThanOrEqual(6000)
      }
    })

    it('filters listings by rooms', async () => {
      const response = await request(app).get('/listings').query({
        rooms: 1,
      })

      expect(response.status).toBe(200)

      for (const apartment of response.body.data.apartments) {
        expect(apartment.roomsAvailable).toBeGreaterThanOrEqual(1)
      }
    })

    it('rejects invalid query parameters', async () => {
      const response = await request(app).get('/listings').query({
        minPrice: 'not-a-number',
      })

      expect(response.status).toBe(400)
    })
  })

  describe('GET /listings/:id', () => {
    it('gets a single listing', async () => {
      const response = await request(app).get(`/listings/${listingId}`)

      expect(response.status).toBe(200)
      expect(response.body.data.apartment._id).toBe(listingId)
    })

    it('returns 404 for a missing listing', async () => {
      const response = await request(app).get(
        '/listings/000000000000000000000000',
      )

      expect(response.status).toBe(404)
    })
  })

  describe('POST /listings', () => {
    it('allows a lister to create a listing', async () => {
      const response = await request(app)
        .post('/listings')
        .set(auth(listerToken))
        .send({
          location: 'Alexandria',
          price: 3500,
          roomsAvailable: 3,
          description: 'Another test apartment',
          status: 'available',
        })

      expect(response.status).toBe(201)
      expect(response.body.data.apartment).toHaveProperty('_id')
    })

    it('rejects an unauthenticated request', async () => {
      const response = await request(app).post('/listings').send({
        location: 'Cairo',
        price: 3000,
        roomsAvailable: 2,
        description: 'Unauthorized apartment',
        status: 'available',
      })

      expect(response.status).toBe(401)
    })

    it('rejects a seeker', async () => {
      const response = await request(app)
        .post('/listings')
        .set(auth(seekerToken))
        .send({
          location: 'Cairo',
          price: 3000,
          roomsAvailable: 2,
          description: 'Seeker apartment',
          status: 'available',
        })

      expect(response.status).toBe(403)
    })

    it('rejects invalid listing data', async () => {
      const response = await request(app)
        .post('/listings')
        .set(auth(listerToken))
        .send({
          location: '',
          price: -100,
          roomsAvailable: -1,
        })

      expect(response.status).toBe(400)
    })
  })

  describe('PATCH /listings/:id', () => {
    it('allows the owner to update a listing', async () => {
      const response = await request(app)
        .patch(`/listings/${listingId}`)
        .set(auth(listerToken))
        .send({
          price: 6000,
          description: 'Updated apartment',
        })

      expect(response.status).toBe(200)

      expect(response.body.data.apartment.price).toBe(6000)
      expect(response.body.data.apartment.description).toBe('Updated apartment')
    })

    it('rejects another lister from updating it', async () => {
      const response = await request(app)
        .patch(`/listings/${listingId}`)
        .set(auth(otherListerToken))
        .send({
          price: 9999,
        })

      expect(response.status).toBe(403)
    })

    it('returns 404 for missing listing', async () => {
      const response = await request(app)
        .patch('/listings/000000000000000000000000')
        .set(auth(listerToken))
        .send({
          price: 5000,
        })

      expect(response.status).toBe(404)
    })
  })

  describe('GET /listings/:id/requests', () => {
    it('allows the owner to see requests', async () => {
      const response = await request(app)
        .get(`/listings/${listingId}/requests`)
        .set(auth(listerToken))

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveProperty('requests')
    })

    it('rejects a different lister', async () => {
      const response = await request(app)
        .get(`/listings/${listingId}/requests`)
        .set(auth(otherListerToken))

      expect(response.status).toBe(403)
    })

    it('rejects a seeker', async () => {
      const response = await request(app)
        .get(`/listings/${listingId}/requests`)
        .set(auth(seekerToken))

      expect(response.status).toBe(403)
    })
  })

  describe('DELETE /listings/:id', () => {
    it('allows the owner to delete a listing', async () => {
      const response = await request(app)
        .delete(`/listings/${deleteListingId}`)
        .set(auth(listerToken))

      expect(response.status).toBe(200)

      const getResponse = await request(app).get(`/listings/${deleteListingId}`)

      expect(getResponse.status).toBe(404)
    })

    it('rejects another lister', async () => {
      const response = await request(app)
        .delete(`/listings/${listingId}`)
        .set(auth(otherListerToken))

      expect(response.status).toBe(403)
    })
  })
})
