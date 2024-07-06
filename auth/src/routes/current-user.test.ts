import app from '../app'
import request from 'supertest'

describe('current-user route', () => {
  it('should return the current user if the user is logged in', async () => {
    const cookie = await global.signup()
    const response = await request(app)
      .get('/api/users/currentuser')
      .set('Cookie', cookie)
      .send()
      .expect(200)
    expect(response.body.currentUser).toBeDefined()
    expect(response.body.currentUser.email).toEqual('email@domain.com')
  })
  it('should return null for current user if the user is not logged in', async () => {
    const response = await request(app)
      .get('/api/users/currentuser')
      .send()
      .expect(200)
    expect(response.body.currentUser).toBeNull()
  })
})