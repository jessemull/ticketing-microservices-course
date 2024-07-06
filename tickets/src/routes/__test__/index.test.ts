import request from 'supertest'
import app from '../../app'

const createTicket = (price, title) =>  request(app).post('/api/tickets').set('Cookie', signin()).send({ price, title })

describe('index router', () => {
  it('fetches a list of tickets', async () => {
    await createTicket(100.00, 'title1')
    await createTicket(200.00, 'title2')
    await createTicket(300.00, 'title3')
    const response = await request(app).get('/api/tickets').send()
    expect(response.status).toEqual(200)
    expect(response.body.length).toEqual(3)
  })
})