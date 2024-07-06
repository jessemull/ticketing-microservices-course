import { Request, Response, Router } from 'express'
import { body } from 'express-validator'
import {
  requireAuth,
  validateRequest,
  BadRequestError,
  NotFoundError,
  NotAuthorizedError,
  OrderStatus
} from '@mytix/common'
import { Order } from '../models/order'
import { stripe } from '../stripe'
import { Payment } from '../models/payment'
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher'
import { wrapper } from '../nats-client'

const router = Router()

const validator = [
  body('token')
    .not()
    .isEmpty()
    .withMessage('Token is required!'),
  body('orderId')
    .not()
    .isEmpty()
    .withMessage('Order ID is required!')
]
router.post('/api/payments', requireAuth, validator, validateRequest, async (req: Request, res: Response) => {
  const { token, orderId } = req.body

  const order = await Order.findById(orderId)

  if (!order) {
    throw new NotFoundError()
  }

  if (order.userId !== req.currentUser.id) {
    throw new NotAuthorizedError()
  }

  if (order.status === OrderStatus.Cancelled) {
    throw new BadRequestError('Order is cancelled!')
  }
  
  const charge = await stripe.charges.create({
    amount: order.price * 100,
    currency: 'usd',
    source: token
  })

  const payment = Payment.build({
    orderId: order.id,
    stripeId: charge.id
  })
  await payment.save()

  await new PaymentCreatedPublisher(wrapper.client).publish({
    id: payment.id,
    orderId: payment.orderId,
    stripeId: payment.stripeId
  })

  return res.status(201).send(payment)
})

export { router as createChargeRouter }