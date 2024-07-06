import { Message } from 'node-nats-streaming'
import { Listener, TicketCreatedEvent, Subjects } from '@mytix/common'
import { DEFAULT_QUEUE_GROUP_NAME } from './queue-group-names'
import { Ticket } from '../../models/ticket'

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject: Subjects.TicketCreated = Subjects.TicketCreated
  queueGroupName = DEFAULT_QUEUE_GROUP_NAME
  
  async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    const { id, price, title } = data
    const ticket = Ticket.build({
      id,
      price,
      title
    })
    await ticket.save()
    msg.ack()
    this.logProcessed(data, msg)
  }
}