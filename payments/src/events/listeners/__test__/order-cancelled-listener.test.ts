import mongoose from 'mongoose'
import { OrderCancelledEvent, OrderStatus } from '@mytix/common'
import { wrapper } from '../../../nats-client'
import { OrderCancelledListener } from '../order-cancelled-listener'
import { Order } from '../../../models/order'
import { Message } from 'node-nats-streaming'

const setup = async () => {
  const listener = new OrderCancelledListener(wrapper.client)

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 100.00,
    status: OrderStatus.Created,
    userId: 'userId',
    version: 0
  })
  await order.save()

  const data: OrderCancelledEvent['data'] = {
    id: order.id,
    ticket: {
      id: 'id'
    },
    version: 1
  }

  const message = {
    ack: jest.fn(),
    getSequence: jest.fn(),
    getSubject: jest.fn()
  }

  return { data, listener, message, order }
}

describe('order-cancelled-listener', () => {
  it('udpates the order status to cancelled', async () => {
    const { data, listener, message, order } = await setup()

    await listener.onMessage(data, message as unknown as Message)

    const updated = await Order.findById(order.id)

    expect(updated.status).toEqual(OrderStatus.Cancelled)
  })
  it('acks the message', async () => {
    const { data, listener, message } = await setup()

    await listener.onMessage(data, message as unknown as Message)

    expect(message.ack).toHaveBeenCalled()
  })
})