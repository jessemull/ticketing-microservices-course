import { Publisher, Subjects, TicketCreatedEvent } from '@mytix/common'

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated
}