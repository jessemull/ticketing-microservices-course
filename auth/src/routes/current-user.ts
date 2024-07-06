import { Router } from 'express'
import { currentUser } from '@mytix/common'

const router = Router()

router.get('/api/users/currentuser', currentUser, (req, res) => {
  return res.send({ currentUser: req.currentUser || null })
})

export { router as currentUserRouter }