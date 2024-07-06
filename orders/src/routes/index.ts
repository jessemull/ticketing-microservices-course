import { Router, Request, Response } from 'express'
import { requireAuth } from '@mytix/common'
import { Order } from '../models/order'


const router = Router()

router.get('/api/orders', requireAuth, async (req: Request, res: Response) => {
  const { id: userId } = req.currentUser

  const orders = await Order.find({ userId }).populate('ticket')

  return res.send(orders)
})

export {
  router as indexOrderRouter
}