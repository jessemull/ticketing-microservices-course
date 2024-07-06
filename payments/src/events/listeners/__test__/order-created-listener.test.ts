import mongoose from 'mongoose'
import { OrderCreatedEvent, OrderStatus } from '@mytix/common'
import { wrapper } from '../../../nats-client'
import { OrderCreatedListener } from '../order-created-listener'
import { Order } from '../../../models/order'
import { Message } from 'node-nats-streaming'

const setup = async () => {
  const listener = new OrderCreatedListener(wrapper.client)

  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    expiresAt: 'expiresAt',
    status: OrderStatus.Created,
    ticket: {
      id: 'id',
      price: 100.00
    },
    userId: 'userId',
    version: 0
  }

  const message = {
    ack: jest.fn(),
    getSequence: jest.fn(),
    getSubject: jest.fn()
  }

  return { data, listener, message }
}

describe('order-created-listener', () => {
  it('saves the order information', async () => {
    const { data, listener, message } = await setup()

    await listener.onMessage(data, message as unknown as Message)

    const order = await Order.findById(data.id)

    expect(order.price).toEqual(data.ticket.price)
  })
  it('acks teh message', async () => {
    const { data, listener, message } = await setup()

    await listener.onMessage(data, message as unknown as Message)

    expect(message.ack).toHaveBeenCalled()
  })
})