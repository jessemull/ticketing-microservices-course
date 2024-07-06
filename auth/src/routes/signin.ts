import jwt from 'jsonwebtoken'
import { BadRequestError, validateRequest } from '@mytix/common'
import { Router } from 'express'
import { body } from 'express-validator'
import { User } from '../models/user'
import { Password } from '../services/password'

const router = Router()

const validation = [
  body('email')
    .isEmail()
    .withMessage('Invalid e-mail.'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password must be provided.')
]

router.post('/api/users/signin', validation, validateRequest, async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email })

  if (!user) {
    throw new BadRequestError('Invalid credentials.')
  }

  const isValidPassword = await Password.compare(user.password, password)

  if (!isValidPassword) {
    throw new BadRequestError('Invalid password.')
  }

  const userJWT = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET_KEY)

  req.session = {
    ...req.session,
    jwt: userJWT
  }

  return res.status(200).send(user)
})

export { router as signinRouter }