import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { OrderStatus, ExpirationCompleteEvent } from '@mytix/common'
import { ExpirationCompleteListener } from '../expiration-complete-listener'
import { Order } from '../../../models/order'
import { Ticket } from '../../../models/ticket'
import { wrapper } from '../../../nats-client'

const setup = async () => {
  const listener = new ExpirationCompleteListener(wrapper.client)

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20
  })
  await ticket.save()

  const order = Order.build({
    status: OrderStatus.Created,
    userId: 'alskdfj',
    expiresAt: new Date(),
    ticket
  })
  await order.save()

  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id,
  }

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
    getSubject: jest.fn(),
    getSequence: jest.fn()
  }

  return { listener, order, ticket, data, msg }
}

describe('', () => {
  it('updates the order status to cancelled', async () => {
    const { listener, order, data, msg } = await setup()
  
    await listener.onMessage(data, msg)
  
    const updated = await Order.findById(order.id)
  
    expect(updated.status).toEqual(OrderStatus.Cancelled)
  })
  
  it('emits an order cancelled event', async () => {
    const { listener, order, data, msg } = await setup()
  
    await listener.onMessage(data, msg)
  
    expect(wrapper.client.publish).toHaveBeenCalled()
  
    const event = JSON.parse(
      (wrapper.client.publish as jest.Mock).mock.calls[1][1]
    )
  
    expect(event.id).toEqual(order.id)
  })
  
  it('acks the message', async () => {
    const { listener, data, msg } = await setup()
  
    await listener.onMessage(data, msg)
  
    expect(msg.ack).toHaveBeenCalled()
  })
})


