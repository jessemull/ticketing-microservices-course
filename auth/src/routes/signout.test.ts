import app from '../app'
import request from 'supertest'

describe('signout route', () => {
  it('signout should clear the cookie', async () => {
    await global.signup()
    const response = await request(app)
      .post('/api/users/signout')
      .expect(200)
    const cookie = response.get('Set-Cookie')
    const session = cookie[0].split(';')[0]
    expect(session).toEqual('session=')
  })
})