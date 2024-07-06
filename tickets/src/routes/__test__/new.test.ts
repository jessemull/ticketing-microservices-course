import request from 'supertest'
import app from '../../app'
import { Ticket } from '../../models/ticket'
import { wrapper } from '../../nats-client'

describe('new router', () => {
  it('has a route handler listening to /api/tickets for post requests', async () => {
    const response = await request(app).post('/api/tickets').send({})
    expect(response.status).not.toEqual(404)
  })

  it('can only be accessed if the user is signed in', async () => {
    const response = await request(app).post('/api/tickets').set('Cookie', signin()).send({ price: 100.00, title: 'title' })
    expect(response.status).toEqual(201)
  })

  it('returns a status other than 401 if the user is signed in', async () => {
    const response = await request(app).post('/api/tickets').set('Cookie', signin()).send({})
    expect(response.status).not.toEqual(401)
  })

  it('returns an error if an invalid title is provided or title is missing', async () => {
    const invalid = await request(app).post('/api/tickets').set('Cookie', signin()).send({ price: 100.00, title: '' })
    expect(invalid.status).toEqual(400)

    const missing = await request(app).post('/api/tickets').set('Cookie', signin()).send({ price: 100.00 })
    expect(missing.status).toEqual(400)
  })

  it('returns an error if an invalid price is provided or price is missing', async () => {
    const invalid = await request(app).post('/api/tickets').set('Cookie', signin()).send({ price: 'price', title: 'title' })
    expect(invalid.status).toEqual(400)

    const missing = await request(app).post('/api/tickets').set('Cookie', signin()).send({ title: 'title' })
    expect(missing.status).toEqual(400)
  })

  it('creates a ticket with valid input', async () => {
    let tickets = await Ticket.find({})
    expect(tickets.length).toEqual(0)

    const response = await request(app).post('/api/tickets').set('Cookie', signin()).send({ price: 100.00, title: 'title' })
    expect(response.status).toEqual(201)

    tickets = await Ticket.find({})
    expect(tickets.length).toEqual(1)
    expect(tickets[0].title).toEqual('title')
    expect(tickets[0].price).toEqual(100.00)
  })

  it('publishes an event on ticket creation', async () => {
    let tickets = await Ticket.find({})
    expect(tickets.length).toEqual(0)

    const response = await request(app).post('/api/tickets').set('Cookie', signin()).send({ price: 100.00, title: 'title' })
    expect(response.status).toEqual(201)
    expect(wrapper.client.publish).toHaveBeenCalled()
  })
})