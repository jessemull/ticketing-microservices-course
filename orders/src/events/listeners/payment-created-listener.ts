import { Message } from 'node-nats-streaming'
import { Listener, OrderStatus, PaymentCreatedEvent, Subjects } from '@mytix/common'
import { DEFAULT_QUEUE_GROUP_NAME } from './queue-group-names'
import { Order } from '../../models/order'

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  readonly subject: Subjects.PaymentCreated = Subjects.PaymentCreated
  queueGroupName = DEFAULT_QUEUE_GROUP_NAME
  
  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    const { orderId } = data
    
    const order = await Order.findById(orderId)

    if (!order) {
      throw new Error('Order not found!')
    }

    order.set({
      status: OrderStatus.Complete
    })
    await order.save()

    msg.ack()
    this.logProcessed(data, msg)
  }
}