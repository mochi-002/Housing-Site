import request from 'supertest'
import { beforeAll, describe, expect, it } from 'vitest'

import app from '../src/app.js'
import { createLister, registerSeeker, auth } from './helpers.js'

describe('Interest Requests API', () => {
  let listerToken: string
  let seekerToken: string
  let otherSeekerToken: string

  let listingId: string
  let requestId: string

  beforeAll(async () => {
    const lister = await createLister()
    const seeker = await registerSeeker(request)
    const otherSeeker = await registerSeeker(request)

    listerToken = lister.token
    seekerToken = seeker.token
    otherSeekerToken = otherSeeker.token

    const listing = await request(app)
      .post('/listings')
      .set(auth(listerToken))
      .send({
        location: 'Cairo',
        price: 5000,
        roomsAvailable: 2,
        description: 'Request test apartment',
        status: 'available',
      })

    expect(listing.status).toBe(201)

    listingId = listing.body.data.apartment._id
  })

  describe('POST /listings/:id/requests', () => {
    it('allows a seeker to send an interest request', async () => {
      const response = await request(app)
        .post(`/listings/${listingId}/requests`)
        .set(auth(seekerToken))

      expect(response.status).toBe(201)

      expect(response.body.data).toHaveProperty('request')

      requestId = response.body.data.request._id

      expect(response.body.data.request.status).toBe('pending')
    })

    it('rejects duplicate requests', async () => {
      const response = await request(app)
        .post(`/listings/${listingId}/requests`)
        .set(auth(seekerToken))

      expect(response.status).toBe(409)
    })

    it('rejects the listing owner requesting their own listing', async () => {
      const response = await request(app)
        .post(`/listings/${listingId}/requests`)
        .set(auth(listerToken))

      expect(response.status).toBe(403)
    })

    it('allows another seeker to request the listing', async () => {
      const response = await request(app)
        .post(`/listings/${listingId}/requests`)
        .set(auth(otherSeekerToken))

      expect(response.status).toBe(201)
    })

    it('rejects a missing listing', async () => {
      const response = await request(app)
        .post('/listings/000000000000000000000000/requests')
        .set(auth(seekerToken))

      expect(response.status).toBe(404)
    })
  })

  describe('GET /requests/mine', () => {
    it('gets requests for the logged-in seeker', async () => {
      const response = await request(app)
        .get('/requests/mine')
        .set(auth(seekerToken))

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveProperty('requests')
      expect(Array.isArray(response.body.data.requests)).toBe(true)
    })
  })

  describe('GET /listings/:id/requests', () => {
    it('allows the lister to view requests for their listing', async () => {
      const response = await request(app)
        .get(`/listings/${listingId}/requests`)
        .set(auth(listerToken))

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveProperty('requests')
    })

    it('rejects a seeker', async () => {
      const response = await request(app)
        .get(`/listings/${listingId}/requests`)
        .set(auth(seekerToken))

      expect(response.status).toBe(403)
    })
  })

  describe('PATCH /requests/:requestId/accept', () => {
    it('allows the listing owner to accept a request', async () => {
      const response = await request(app)
        .patch(`/requests/${requestId}/accept`)
        .set(auth(listerToken))

      expect(response.status).toBe(200)
      expect(response.body.data.request.status).toBe('accepted')
    })

    it('rejects a seeker', async () => {
      const response = await request(app)
        .patch(`/requests/${requestId}/accept`)
        .set(auth(seekerToken))

      expect(response.status).toBe(403)
    })

    it('cannot accept the same request twice', async () => {
      const response = await request(app)
        .patch(`/requests/${requestId}/accept`)
        .set(auth(listerToken))

      expect(response.status).toBe(400)
    })
  })

  describe('PATCH /requests/:requestId/decline', () => {
    it('rejects declining an already accepted request', async () => {
      const response = await request(app)
        .patch(`/requests/${requestId}/decline`)
        .set(auth(listerToken))

      expect(response.status).toBe(400)
    })
  })

  describe('DELETE /requests/:requestId/delete', () => {
    it('rejects cancelling an accepted request', async () => {
      const response = await request(app)
        .delete(`/requests/${requestId}/delete`)
        .set(auth(seekerToken))

      expect(response.status).toBe(400)
    })

    it('rejects another user deleting the request', async () => {
      const response = await request(app)
        .delete(`/requests/${requestId}/delete`)
        .set(auth(otherSeekerToken))

      expect(response.status).toBe(403)
    })
  })
})
