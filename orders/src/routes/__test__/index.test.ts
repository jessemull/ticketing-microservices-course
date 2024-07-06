import app from '../../app'
import mongoose from 'mongoose'
import request from 'supertest'
import { Ticket } from '../../models/ticket'

const buildTicket = async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 100.00,
    title: 'title',
  })
  await ticket.save()
  return ticket
}

describe('indexOrderRouter', () => {
  it(`returns the user's orders`, async () => {
    const user1 = signin()
    const user2 = signin()

    const ticket1 = await buildTicket()
    const ticket2 = await buildTicket()
    const ticket3 = await buildTicket()

    const order1 = await request(app)
      .post('/api/orders')
      .set('Cookie', user1)
      .send({ ticketId: ticket1.id })

    const order2 = await request(app)
      .post('/api/orders')
      .set('Cookie', user2)
      .send({ ticketId: ticket2.id })

    const order3 = await request(app)
      .post('/api/orders')
      .set('Cookie', user2)
      .send({ ticketId: ticket3.id })
    

    const userOrders1 = await request(app)
      .get('/api/orders')
      .set('Cookie', user1)
    
    const userOrders2 = await request(app)
      .get('/api/orders')
      .set('Cookie', user2)
      .send()

    expect(userOrders1.status).toEqual(200)
    expect(userOrders1.body.length).toEqual(1)
    expect(userOrders1.body[0].id).toEqual(order1.body.id)

    expect(userOrders2.status).toEqual(200)
    expect(userOrders2.body.length).toEqual(2)
    expect(userOrders2.body[0].id).toEqual(order2.body.id)
    expect(userOrders2.body[1].id).toEqual(order3.body.id)
  })
})