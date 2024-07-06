import { Publisher, Subjects, OrderCreatedEvent } from '@mytix/common'

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated
}