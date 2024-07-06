import { DEFAULT_QUEUE_GROUP_NAME } from './queue-group-names'
import { Listener, OrderCancelledEvent, OrderStatus, Subjects } from '@mytix/common'
import { Message } from 'node-nats-streaming'
import { Order } from '../../models/order'

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled
  queueGroupName: string = DEFAULT_QUEUE_GROUP_NAME

  async onMessage(data: OrderCancelledEvent['data'], message: Message) {
    const { id, version } = data 

    const order = await Order.findOne({ _id: id, version: version - 1 })

    if (!order) {
      throw new Error('Order not found!')
    }

    order.set({
      status: OrderStatus.Cancelled
    })
    await order.save()

    message.ack()
  }
}