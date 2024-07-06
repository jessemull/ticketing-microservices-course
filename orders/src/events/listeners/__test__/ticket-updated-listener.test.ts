import mongoose from 'mongoose'
import { TicketUpdatedEvent } from '@mytix/common'
import { Message } from 'node-nats-streaming'
import { TicketUpdatedListener } from '../ticket-updated-listener'
import { wrapper } from '../../../nats-client'
import { Ticket } from '../../../models/ticket'

const message: Partial<Message> = {
  ack: jest.fn(),
  getSequence: jest.fn().mockImplementation(() => 'sequence'),
  getSubject: jest.fn().mockImplementation(() => 'subject')
}

const setup = async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 100.00,
    title: 'title'
  })
  await ticket.save()

  const data = {
    id: ticket.id,
    price: 200.00,
    title: 'updated-title',
    userId: 'userId',
    version: ticket.version + 1
  }

  const listener = new TicketUpdatedListener(wrapper.client)

  return { data, listener, ticket }
}

describe('ticket-updated-listener', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })
  
  it('finds, updates and saves a ticket', async () => {
    const { data, listener, ticket } = await setup()

    await listener.onMessage(data, message as Message)

    const updated = await Ticket.findById(ticket.id)

    expect(updated.title).toEqual(data.title)
    expect(updated.price).toEqual(data.price)
  })
  it('acks message', async () => {
    const { data, listener, ticket } = await setup()
    
    await listener.onMessage(data, message as Message)
    await Ticket.findById(ticket.id)

    expect(message.ack).toHaveBeenCalled()
  }, 10000)
  it('does not update ticket if the version is out of order', async () => {
    const { data, listener, ticket } = await setup()

    let error

    data.version = 10

    try {
      await listener.onMessage(data, message as Message)
    } catch (err) {
      error = err
    }
    
    await Ticket.findById(ticket.id)

    expect(message.ack).not.toHaveBeenCalled()
    expect(error).toBeDefined()
  })
})