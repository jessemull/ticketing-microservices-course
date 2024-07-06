import { Publisher, Subjects, ExpirationCompleteEvent } from '@mytix/common'

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete
}