import { BadRequestError, NotAuthorizedError, NotFoundError, requireAuth, validateRequest } from '@mytix/common'
import { Router } from 'express'
import { body } from 'express-validator'
import { Ticket } from '../models/ticket'
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher'
import { wrapper } from '../nats-client'

const router = Router()

const validationRules = [
  body('title')
    .isString()
    .withMessage('Title must be a valid string.')
    .not()
    .isEmpty()
    .withMessage('Title is required.'),
  body('price')
    .isFloat({ gt: 0 })
    .withMessage('Price must be greater than zero.')
    .not()
    .isEmpty()
    .withMessage('Price is required.')
]

router.put('/api/tickets/:id', requireAuth, validationRules, validateRequest, async (req, res) => {
  const { price, title } = req.body
  const { id } = req.params
  const { id: userId } = req.currentUser

  const ticket = await Ticket.findById(id)

  if (!ticket) {
    throw new NotFoundError()
  }

  if (ticket.orderId) {
    throw new BadRequestError('Ticket is already reserved!')
  }
  
  if (ticket.userId !== userId) {
    throw new NotAuthorizedError()
  }

  ticket.set({
    price,
    title
  })

  await ticket.save()

  new TicketUpdatedPublisher(wrapper.client).publish({
    id: ticket.id,
    price: ticket.price,
    title: ticket.title,
    userId: ticket.userId,
    version: ticket.version
  })
  
  res.status(200).send(ticket)
})

export {
  router as updateTicketRouter
}