import { Message, Stan } from 'node-nats-streaming'
import { Listener, TicketCreatedEvent, Subjects } from '@mytix/common'

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject: Subjects.TicketCreated = Subjects.TicketCreated
  queueGroupName = 'payments-service'

  constructor(client: Stan) {
    super(client)
  }

  onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    msg.ack()
    this.logProcessed(data, msg)
  }
}