import { Message } from 'node-nats-streaming'
import { Listener, Subjects, ExpirationCompleteEvent, OrderStatus } from '@mytix/common'
import { DEFAULT_QUEUE_GROUP_NAME } from './queue-group-names'
import { Order } from '../../models/order'
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher'

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  readonly subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete
  queueGroupName = DEFAULT_QUEUE_GROUP_NAME
  
  async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
    const { orderId } = data

    const order = await Order.findById(orderId).populate('ticket')

    if (!order) {
      throw new Error('Order not found!')
    }

    if (order.status === OrderStatus.Complete) {
      return msg.ack()
    }
    
    order.set({ 
      status: OrderStatus.Cancelled
    })
    await order.save()
    
    await new OrderCancelledPublisher(this.client).publish({
      id: order.id,
      ticket: {
        id: order.ticket.id
      },
      version: order.version
    })

    msg.ack()
    this.logProcessed(data, msg)
  }
}