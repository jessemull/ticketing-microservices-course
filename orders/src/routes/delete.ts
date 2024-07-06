import { NotAuthorizedError, NotFoundError, OrderStatus } from '@mytix/common'
import { Router, Request, Response } from 'express'
import { Order } from '../models/order'
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher'
import { wrapper } from '../nats-client'

const router = Router()

router.delete('/api/orders/:orderId', async (req: Request, res: Response) => {
  const { orderId } = req.params
  const { id: userId } = req.currentUser

  const order = await Order.findById(orderId).populate('ticket')

  if (!order) {
    throw new NotFoundError()
  }

  if (order.userId !== userId) {
    throw new NotAuthorizedError()
  }

  order.set({
    status: OrderStatus.Cancelled
  })

  await order.save()

  new OrderCancelledPublisher(wrapper.client).publish({
    id: order.id,
    ticket: {
      id: order.ticket.id
    },
    version: order.version
  })

  return res.status(200).send(order)
})

export {
  router as deleteOrderRouter
}