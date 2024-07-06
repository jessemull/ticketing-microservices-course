import request from 'supertest'
import app from '../../app'
import mongoose from 'mongoose'
import { wrapper } from '../../nats-client'
import { Ticket } from '../../models/ticket'

const createTicket = (price, title) =>  request(app).post('/api/tickets').set('Cookie', signin()).send({ price, title })

describe('update router', () => {
  it('returns a 404 if the provided ID does not exist', async () => {
    const id = new mongoose.Types.ObjectId().toHexString()
    const response = await request(app)
      .put(`/api/tickets/${id}`)
      .set('Cookie', signin())
      .send({
        price: 100.00,
        title: 'title'
      })
    expect(response.status).toEqual(404)
  })
  it('returns a 401 if the user is not authenticated', async () => {
    const id = new mongoose.Types.ObjectId().toHexString()
    const response = await request(app)
      .put(`/api/tickets/${id}`)
      .send({
        price: 100.00,
        title: 'title'
      })
    expect(response.status).toEqual(401)
  })
  it('returns a 401 if the user does not own the ticket', async () => {
    const { body: { id } } = await request(app)
      .post('/api/tickets')
      .set('Cookie', signin())
      .send({
        price: 100.00,
        title: 'title'
      })
    const response = await request(app)
      .put(`/api/tickets/${id}`)
      .set('Cookie', signin())
      .send({
        price: 100.00,
        title: 'title'
      })
    expect(response.status).toEqual(401)
  })
  it('returns a 400 if the the price or title is missing or invalid', async () => {
    const cookie = signin()
    const { body: { id } } = await request(app)
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send({
        price: 100.00,
        title: 'title'
      })
    const invalidPrice = await request(app)
      .put(`/api/tickets/${id}`)
      .set('Cookie', cookie)
      .send({
        price: 'invalid',
        title: 'title'
      })
    const invalidTitle = await request(app)
      .put(`/api/tickets/${id}`)
      .set('Cookie', cookie)
      .send({
        price: 100.00,
        title: 100.00
      })
    const missingPrice = await request(app)
      .put(`/api/tickets/${id}`)
      .set('Cookie', cookie)
      .send({
        title: 'title'
      })
    const missingTitle = await request(app)
      .put(`/api/tickets/${id}`)
      .set('Cookie', cookie)
      .send({
        price: 100.00
      })
    expect(invalidPrice.status).toEqual(400)
    expect(invalidTitle.status).toEqual(400)
    expect(missingPrice.status).toEqual(400)
    expect(missingTitle.status).toEqual(400)
  })
  it('updates the ticket', async () => {
    const cookie = signin()
    const { body: { id } } = await request(app)
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send({
        price: 100.00,
        title: 'title'
      })
    const response = await request(app)
      .put(`/api/tickets/${id}`)
      .set('Cookie', cookie)
      .send({
        price: 200.00,
        title: 'updated-title'
      })
    expect(response.status).toEqual(200)
    expect(response.body.price).toEqual(200.00)
    expect(response.body.title).toEqual('updated-title')
  })
  it('publishes an event on ticket update', async () => {
    const cookie = signin()
    const { body: { id } } = await request(app)
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send({
        price: 100.00,
        title: 'title'
      })
    await request(app)
      .put(`/api/tickets/${id}`)
      .set('Cookie', cookie)
      .send({
        price: 200.00,
        title: 'updated-title'
      })
    expect(wrapper.client.publish).toHaveBeenCalled()
  })
  it('cannot update ticket if it is already reserved', async () => {
    const cookie = signin()
    const { body: { id } } = await request(app)
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send({
        price: 100.00,
        title: 'title'
      })
    const ticket = await Ticket.findById(id)
    ticket.set({
      orderId: 'orderId'
    })
    await ticket.save()
    const response = await request(app)
      .put(`/api/tickets/${id}`)
      .set('Cookie', cookie)
      .send({
        price: 200.00,
        title: 'updated-title'
      })
    expect(response.status).toEqual(400)
  })
})