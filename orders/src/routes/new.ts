import mongoose from 'mongoose'
import { Router, Request, Response } from 'express'
import { BadRequestError, NotFoundError, OrderStatus, requireAuth, validateRequest } from '@mytix/common'
import { body } from 'express-validator'
import { Order } from '../models/order'
import { Ticket } from '../models/ticket'
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher'
import { wrapper } from '../nats-client'

const router = Router()

const validators = [
  body('ticketId')
    .not()
    .isEmpty()
    .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
    .withMessage('Ticket ID is required.')
]

router.post('/api/orders', requireAuth, validators, validateRequest, async (req: Request, res: Response) => {
  const { ticketId } = req.body
  const { id: userId } = req.currentUser

  const ticket = await Ticket.findById(ticketId)
  
  if (!ticket) {
    throw new NotFoundError()
  }

  const isReserved = await ticket.isReserved()

  if (isReserved) {
    throw new BadRequestError('Ticket is already reserved!')
  }

  const expiresAt = new Date()
  expiresAt.setMinutes(expiresAt.getMinutes() + 1)

  const order = Order.build({ 
    expiresAt,
    status: OrderStatus.Created,
    ticket,
    userId,
  })

  await order.save()

  new OrderCreatedPublisher(wrapper.client).publish({
    id: order.id,
    expiresAt: order.expiresAt.toUTCString(),
    status: order.status,
    ticket: {
      id: order.ticket.id,
      price: order.ticket.price
    },
    userId: order.userId,
    version: order.version
  })

  return res.status(201).send(order)
})

export {
  router as newOrderRouter
}