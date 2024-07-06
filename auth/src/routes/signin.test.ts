import app from '../app'
import request from 'supertest'

describe('signin route', () => {
  it('successful signin should return status code of 201', async () => {
    await global.signup()
    return request(app)
      .post('/api/users/signin')
      .send({
        email: 'email@domain.com',
        password: 'password'
      })
      .expect(200)
  })
  it('invalid e-mail should return status code of 400', async () => {
    return request(app)
      .post('/api/users/signin')
      .send({
        email: 'invalid',
        password: 'password'
      })
      .expect(400)
  })
  it('invalid password should return status code of 400', async () => {
    return request(app)
      .post('/api/users/signin')
      .send({
        email: 'email@domain.com',
        password: ''
      })
      .expect(400)
  })
  it('missing password should return status code of 400', async () => {
    return request(app)
      .post('/api/users/signin')
      .send({
        email: 'email@domain.com'
      })
      .expect(400)
  })
  it('missing e-mail should return status code of 400', async () => {
    return request(app)
      .post('/api/users/signin')
      .send({
        password: 'password'
      })
      .expect(400)
  })
  it('e-mail that does not exist should return a status code of 400', async () => {
    return request(app)
      .post('/api/users/signin')
      .send({
        email: 'email@domain.com',
        password: 'password'
      })
      .expect(400)
  })
  it('incorrect password should return a status code of 400', async () => {
    await global.signup()
    return request(app)
      .post('/api/users/signin')
      .send({
        email: 'email@domain.com',
        password: 'incorrect'
      })
      .expect(400)
  })
  it('sets a cookie after successful sign-up', async () => {
    await global.signup()
    const response = await request(app)
      .post('/api/users/signin')
      .send({
        email: 'email@domain.com',
        password: 'password'
      })
      .expect(200)
    expect(response.get('Set-Cookie')).toBeDefined()
  })
})