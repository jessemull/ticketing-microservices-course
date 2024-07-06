import { Publisher, Subjects, OrderCancelledEvent } from '@mytix/common'

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled
}