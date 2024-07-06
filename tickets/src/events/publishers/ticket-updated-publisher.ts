import { Publisher, Subjects, TicketUpdatedEvent } from '@mytix/common'

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated
}