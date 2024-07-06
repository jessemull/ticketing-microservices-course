import { DEFAULT_QUEUE_GROUP_NAME } from './queue-group-names'
import { Listener, OrderCreatedEvent, Subjects } from '@mytix/common'
import { Message } from 'node-nats-streaming'
import { Order } from '../../models/order'

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated
  queueGroupName: string = DEFAULT_QUEUE_GROUP_NAME

  async onMessage(data: OrderCreatedEvent['data'], message: Message) {
    const { id, status, ticket: { price }, userId, version } = data 

    const order = Order.build({
      id,
      price,
      status,
      userId,
      version
    })
    await order.save()

    message.ack()
  }
}