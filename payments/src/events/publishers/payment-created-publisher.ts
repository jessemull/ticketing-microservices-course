import { Subjects, Publisher, PaymentCreatedEvent } from '@mytix/common'

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated
}