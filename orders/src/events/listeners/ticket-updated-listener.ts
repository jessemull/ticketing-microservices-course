import { Message } from 'node-nats-streaming'
import { Listener, TicketUpdatedEvent, Subjects, NotFoundError } from '@mytix/common'
import { DEFAULT_QUEUE_GROUP_NAME } from './queue-group-names'
import { Ticket } from '../../models/ticket'

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject: Subjects.TicketUpdated = Subjects.TicketUpdated
  queueGroupName = DEFAULT_QUEUE_GROUP_NAME
  
  async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
    const ticket = await Ticket.findByLastVersion(data)

    if (!ticket) {
      throw new Error('Ticket not found!')
    }

    const { orderId, price, title } = data

    ticket.set({ orderId, price, title })
    await ticket.save()

    msg.ack()
    this.logProcessed(data, msg)
  }
}