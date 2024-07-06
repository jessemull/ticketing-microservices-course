import app from '../../app'
import mongoose from 'mongoose'
import request from 'supertest'
import { Ticket } from '../../models/ticket'
import { Order, OrderStatus } from '../../models/order'
import { wrapper } from '../../nats-client'

describe('newOrderRouter', () => {
  it('returns an error if the ticket does not exist', async () => {
    const ticketId = new mongoose.Types.ObjectId()

    const response = await request(app)
      .post('/api/orders')
      .set('Cookie', signin())
      .send({ ticketId })
    
    expect(response.status).toEqual(404)
  })
  it('returns an error if the ticket is already reserved', async () => {
    const ticket = Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      price: 100.00,
      title: 'title',
    })
    await ticket.save()

    const order = Order.build({
      expiresAt: new Date(),
      status: OrderStatus.Created,
      ticket,
      userId: 'userId'
    })
    await order.save()

    const response = await request(app)
      .post('/api/orders')
      .set('Cookie', signin())
      .send({ ticketId: ticket.id })

    expect(response.status).toEqual(400)
  })
  it('reserves a ticket and creates an order', async () => {
    const ticket = Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      price: 100.00,
      title: 'title',
    })
    await ticket.save()

    const response = await request(app)
      .post('/api/orders')
      .set('Cookie', signin())
      .send({ ticketId: ticket.id })

    expect(response.status).toEqual(201)
  })
  it('publishes an event when a ticket is reserverd', async () => {
    const ticket = Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      price: 100.00,
      title: 'title',
    })
    await ticket.save()

    await request(app)
      .post('/api/orders')
      .set('Cookie', signin())
      .send({ ticketId: ticket.id })

    expect(wrapper.client.publish).toHaveBeenCalled()
  })
})