import { Router, Request, Response } from 'express'
import { Order } from '../models/order'
import { NotAuthorizedError, NotFoundError } from '@mytix/common'

const router = Router()

router.get('/api/orders/:orderId', async (req: Request, res: Response) => {
  const { orderId } = req.params
  const { id: userId } = req.currentUser

  const order = await Order.findById(orderId).populate('ticket')

  if (!order) {
    throw new NotFoundError()
  }

  if (order.userId !== userId) {
    throw new NotAuthorizedError()
  }
  
  return res.send(order)
})

export {
  router as showOrderRouter
}