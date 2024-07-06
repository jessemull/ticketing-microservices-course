import { Message } from 'node-nats-streaming'
import { Listener, OrderCreatedEvent, Subjects } from '@mytix/common'
import { DEFAULT_QUEUE_GROUP_NAME } from './queue-group-names'
import { queue } from '../../queues/expiration-queue'

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject: Subjects.OrderCreated = Subjects.OrderCreated
  queueGroupName = DEFAULT_QUEUE_GROUP_NAME
  
  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const { id: orderId, expiresAt } = data
    const delay = new Date(expiresAt).getTime() - new Date().getTime()
    await queue.add({ orderId }, { delay })
    msg.ack()
    this.logProcessed(data, msg)
  }
}