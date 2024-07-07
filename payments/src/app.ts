import 'express-async-errors'
import cookieSession from 'cookie-session'
import express from 'express'
import { json } from 'body-parser'
import { currentUser, errorHandler, NotFoundError } from '@mytix/common'
import { createChargeRouter } from './routes/new'

const app = express()

// Need to route things though a proxy server

app.set('trust proxy', true)

// Use JSON body

app.use(json())
app.use(cookieSession({
  secure: false,
  signed: false
}))

// All routes should have access to user data

app.use(currentUser)

// Routes

app.use(createChargeRouter)

// Handle 404s for routes

app.all('*', async () => {
  throw new NotFoundError()
})

// Error handling

app.use(errorHandler)

export default app


