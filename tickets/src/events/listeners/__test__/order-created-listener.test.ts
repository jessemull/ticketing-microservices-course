import mongoose from 'mongoose'
import { OrderCreatedEvent, OrderStatus } from '@mytix/common'
import { OrderCreatedListener } from '../order-created-listener'
import { wrapper } from '../../../nats-client'
import { Message } from 'node-nats-streaming'
import { Ticket } from '../../../models/ticket'

const setup = async () => {
  const message: Partial<Message> = {
    ack: jest.fn(),
    getSequence: jest.fn().mockImplementation(() => 'sequence'),
    getSubject: jest.fn().mockImplementation(() => 'subject')
  }
  
  const ticket = Ticket.build({
    price: 100.00,
    title: 'title',
    userId: 'userId'
  })

  await ticket.save()

  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    expiresAt: new Date().toUTCString(),
    status: OrderStatus.Created,
    ticket: {
      id: ticket.id,
      price: 100.00
    },
    userId: 'userId',
    version: 0
  }
  
  const listener = new OrderCreatedListener(wrapper.client)

  return { data, listener, message, ticket }
}

describe('order-created-listener', () => {
  it('updates reserved ticket with the order ID', async () => {
    const { data, listener, message, ticket } = await setup()
    await listener.onMessage(data, message as Message)
    const reserved = await Ticket.findById(ticket.id)
    expect(reserved.orderId).toEqual(data.id)
  })
  it('acks message', async () => {
    const { data, listener, message } = await setup()
    await listener.onMessage(data, message as Message)
    expect(message.ack).toHaveBeenCalled()
  })
  it('should publish update', async () => {
    const { data, listener, message, ticket } = await setup()
    await listener.onMessage(data, message as Message)
    expect(wrapper.client.publish).toHaveBeenCalled()
    expect((wrapper.client.publish as jest.Mock).mock.calls[0][1].orderId).toEqual(ticket.orderId)
  })
})