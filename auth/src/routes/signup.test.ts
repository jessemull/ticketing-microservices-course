import app from '../app'
import request from 'supertest'

describe('signup route', () => {
  it('successful signup should return status code of 201', async () => {
    return request(app)
      .post('/api/users/signup')
      .send({
        email: 'email@domain.com',
        password: 'password'
      })
      .expect(201)
  })
  it('invalid e-mail should return status code of 400', async () => {
    return request(app)
      .post('/api/users/signup')
      .send({
        email: 'invalid',
        password: 'password'
      })
      .expect(400)
  })
  it('invalid password should return status code of 400', async () => {
    return request(app)
      .post('/api/users/signup')
      .send({
        email: 'email@domain.com',
        password: ''
      })
      .expect(400)
  })
  it('missing password should return status code of 400', async () => {
    return request(app)
      .post('/api/users/signup')
      .send({
        email: 'email@domain.com'
      })
      .expect(400)
  })
  it('missing e-mail should return status code of 400', async () => {
    return request(app)
      .post('/api/users/signup')
      .send({
        password: 'password'
      })
      .expect(400)
  })
  it('should not allow duplicate e-mails', async () => {
    await request(app)
      .post('/api/users/signup')
      .send({
        email: 'email@domain.com',
        password: 'password'
      })
      .expect(201)
    return request(app)
      .post('/api/users/signup')
      .send({
        email: 'email@domain.com',
        password: 'password'
      })
      .expect(400)
  })
  it('sets a cookie after successful sign-up', async () => {
    const response = await request(app)
      .post('/api/users/signup')
      .send({
        email: 'email@domain.com',
        password: 'password'
      })
      .expect(201)
    expect(response.get('Set-Cookie')).toBeDefined()
  })
})