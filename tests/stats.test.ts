import request from 'supertest'
import { beforeAll, describe, expect, it } from 'vitest'

import app from '../src/app.js'
import { createLister, registerSeeker, auth, registerAdmin } from './helpers.js'

describe('Stats API', () => {
  let listerToken: string
  let seekerToken: string
  let adminToken: string

  beforeAll(async () => {
    const lister = await createLister()
    const seeker = await registerSeeker(request)
    const admin = await registerAdmin()

    listerToken = lister.token
    seekerToken = seeker.token
    adminToken = admin.token
  })

  describe('GET /stats/me', () => {
    it('returns stats for a lister', async () => {
      const response = await request(app)
        .get('/stats/me')
        .set(auth(listerToken))

      expect(response.status).toBe(200)
      expect(response.body.data).toBeDefined()
    })

    it('returns stats for a seeker', async () => {
      const response = await request(app)
        .get('/stats/me')
        .set(auth(seekerToken))

      expect(response.status).toBe(200)
      expect(response.body.data).toBeDefined()
    })

    it('requires authentication', async () => {
      const response = await request(app).get('/stats/me')

      expect(response.status).toBe(401)
    })
  })

  describe('GET /stats/overview', () => {
    it('returns overview for authenticated user', async () => {
      const response = await request(app)
        .get('/stats/overview')
        .set(auth(adminToken))

      expect(response.status).toBeGreaterThanOrEqual(200)
      expect(response.status).toBeLessThan(300)
    })

    it('requires authentication', async () => {
      const response = await request(app).get('/stats/overview')

      expect(response.status).toBe(401)
    })
  })
})
