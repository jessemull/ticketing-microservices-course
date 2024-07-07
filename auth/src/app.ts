import 'express-async-errors'
import cookieSession from 'cookie-session'
import express from 'express'
import { json } from 'body-parser'
import { currentUserRouter } from './routes/current-user'
import { signinRouter } from './routes/signin'
import { signupRouter } from './routes/signup'
import { signoutRouter } from './routes/signout'
import { errorHandler, NotFoundError } from '@mytix/common'

const app = express()

// Need to route things though a proxy server

app.set('trust proxy', true)

// Use JSON body

app.use(json())
app.use(cookieSession({
  secure: false,
  signed: false
}))

// Routes

app.use(currentUserRouter)
app.use(signinRouter)
app.use(signupRouter)
app.use(signoutRouter)

// Handle 404s for routes

app.all('*', async () => {
  throw new NotFoundError()
})

// Error handling

app.use(errorHandler)

export default app


