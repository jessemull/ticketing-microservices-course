import request from 'supertest'
import app from '../../app'
import mongoose from 'mongoose'

describe('show router', () => {
  it('returns a 404 if the ticket is not found', async () => {
    const id = new mongoose.Types.ObjectId().toHexString()
    const response = await request(app).get(`/api/tickets/${id}`).send()
    console.log(response.body)
    expect(response.status).toEqual(404)
  })
  it('returns the ticket if it is found', async () => {
    const response = await request(app).post('/api/tickets').set('Cookie', signin()).send({ price: 100.00, title: 'title' })
    const ticket = await request(app).get(`/api/tickets/${response.body.id}`).send()
    expect(ticket.status).toEqual(200)
    expect(ticket.body.price).toEqual(100.00)
    expect(ticket.body.title).toEqual('title')
  })
})