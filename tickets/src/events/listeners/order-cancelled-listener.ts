import { Message } from 'node-nats-streaming'
import { Listener, OrderCancelledEvent, Subjects } from '@mytix/common'
import { DEFAULT_QUEUE_GROUP_NAME } from './queue-group-names'
import { Ticket } from '../../models/ticket'
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher'
import { wrapper } from '../../nats-client'

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject: Subjects.OrderCancelled = Subjects.OrderCancelled
  queueGroupName = DEFAULT_QUEUE_GROUP_NAME
  
  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    const { ticket: { id: ticketId } } = data

    const ticket = await Ticket.findById(ticketId)
    
    if (!ticket) {
      throw new Error('Ticket not found!')
    }

    ticket.set({
      orderId: undefined
    })
    await ticket.save()

    await new TicketUpdatedPublisher(this.client).publish({ 
      id: ticket.id,
      orderId: ticket.orderId,
      price: ticket.price,
      title: ticket.title,
      userId: ticket.userId,
      version: ticket.version
     })

    msg.ack()
    this.logProcessed(data, msg)
  }
}