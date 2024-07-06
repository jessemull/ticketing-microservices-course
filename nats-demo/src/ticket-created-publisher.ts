import { Publisher, Subjects, TicketCreatedEvent } from '@mytix/common'
import { Stan } from 'node-nats-streaming'

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated

  constructor(client: Stan) {
    super(client)
  }
}