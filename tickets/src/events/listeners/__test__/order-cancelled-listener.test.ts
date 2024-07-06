import mongoose from 'mongoose'
import { OrderCancelledEvent, OrderStatus } from '@mytix/common'
import { OrderCancelledListener } from '../order-cancelled-listener'
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
    orderId: 'orderId',
    title: 'title',
    userId: 'userId'
  })

  await ticket.save()

  const data: OrderCancelledEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    ticket: {
      id: ticket.id
    }
  }
  
  const listener = new OrderCancelledListener(wrapper.client)

  return { data, listener, message, ticket }
}

describe('order-cancelled-listener', () => {
  it('removes order ID for cancelled ticket', async () => {
    const { data, listener, message, ticket } = await setup()
    await listener.onMessage(data, message as Message)
    const reserved = await Ticket.findById(ticket.id)
    expect(reserved.orderId).not.toBeDefined()
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
    expect((wrapper.client.publish as jest.Mock).mock.calls[0][1].orderId).not.toBeDefined()
  })
})