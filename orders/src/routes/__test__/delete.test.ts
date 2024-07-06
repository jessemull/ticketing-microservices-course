import app from '../../app'
import mongoose from 'mongoose'
import request from 'supertest'
import { Ticket } from '../../models/ticket'
import { OrderStatus } from '@mytix/common'
import { wrapper } from '../../nats-client'

const buildTicket = async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 100.00,
    title: 'title'
  })
  await ticket.save()
  return ticket
}

describe('deleteOrderRouter', () => {
  it(`returns an error if the user is not the order owner`, async () => {
    const user1 = signin()
    const user2 = signin()

    const ticket = await buildTicket()

    const orderResponse = await request(app)
      .post('/api/orders')
      .set('Cookie', user1)
      .send({ ticketId: ticket.id })
    

    const response = await request(app)
      .delete(`/api/orders/${orderResponse.body.id}`)
      .set('Cookie', user2)

    expect(response.status).toEqual(401)
  })
  it(`updates the order status to cancelled`, async () => {
    const cookie = signin()

    const ticket = await buildTicket()

    const orderResponse = await request(app)
      .post('/api/orders')
      .set('Cookie', cookie)
      .send({ ticketId: ticket.id })
    

    const response = await request(app)
      .delete(`/api/orders/${orderResponse.body.id}`)
      .set('Cookie', cookie)

    expect(response.status).toEqual(200)
    expect(response.body.id).toEqual(orderResponse.body.id)
    expect(response.body.status).toEqual(OrderStatus.Cancelled)
  })
  it(`publishes an event when the order is cancelled`, async () => {
    const cookie = signin()

    const ticket = await buildTicket()

    const orderResponse = await request(app)
      .post('/api/orders')
      .set('Cookie', cookie)
      .send({ ticketId: ticket.id })
    

    await request(app)
      .delete(`/api/orders/${orderResponse.body.id}`)
      .set('Cookie', cookie)

    expect(wrapper.client.publish).toHaveBeenCalled()
  })
})