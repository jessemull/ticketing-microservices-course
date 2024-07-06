
import jwt from 'jsonwebtoken'
import { Router } from 'express'
import { body } from 'express-validator'
import { User } from '../models/user'
import { BadRequestError, validateRequest } from '@mytix/common'

const router = Router()

const validation = [
  body('email')
    .isEmail()
    .withMessage('Invalid e-mail.'),
  body('password')
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage('Password must be between 4 and 20 characters.')
]

router.post('/api/users/signup', validation, validateRequest, async (req, res) => {
  const { email, password } = req.body

  const existing = await User.findOne({ email })

  if (existing) {
    throw new BadRequestError('A user with that e-mail already exists.')
  }

  const user = User.build({ email, password })
  await user.save()

  const userJWT = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET_KEY)

  req.session = {
    ...req.session,
    jwt: userJWT
  }

  return res.status(201).send({ id: user.id, email: user.email })
})

export { router as signupRouter }