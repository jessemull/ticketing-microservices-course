import mongoose from "mongoose"
import { TicketCreatedEvent } from "@mytix/common"
import { TicketCreatedListener } from "../ticket-created-listener"
import { wrapper } from '../../../nats-client'
import { Message } from "node-nats-streaming"
import { Ticket } from "../../../models/ticket"

const setup = () => {
  const message: Partial<Message> = {
    ack: jest.fn(),
    getSequence: jest.fn().mockImplementation(() => 'sequence'),
    getSubject: jest.fn().mockImplementation(() => 'subject')
  }
  
  const data: TicketCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 100.00,
    title: 'title',
    userId: 'userId',
    version: 0
  }
  
  const listener = new TicketCreatedListener(wrapper.client)
  
  return { data, listener, message }
}

describe('ticket-created-listener', () => {
  it('creates and saves a ticket', async () => {
    const { data, listener, message } = setup()
    await listener.onMessage(data, message as Message)
    const ticket = await Ticket.findById(data.id)
    expect(ticket.id).toEqual(data.id)
  })
  it('acks message', async () => {
    const { data, listener, message } = setup()
    await listener.onMessage(data, message as Message)
    const ticket = await Ticket.findById(data.id)
    expect(message.ack).toHaveBeenCalled()
  })
})