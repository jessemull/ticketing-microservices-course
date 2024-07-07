import app from './app'
import mongoose from 'mongoose'
import { wrapper } from './nats-client'
import { TicketCreatedListener } from './events/listeners/ticket-created-listener'
import { TicketUpdatedListener } from './events/listeners/ticket-updated-listener'
import { ExpirationCompleteListener } from './events/listeners/expiration-complete-listener'
import { PaymentCreatedListener } from './events/listeners/payment-created-listener'

const start = async () => {
  console.log('Starting the orders service...')
  if (!process.env.JWT_SECRET_KEY) {
    throw new Error('JWT Secret key must be defined.')
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MongoDB URI must be defined.')
  }

  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('MongoDB URI must be defined.')
  }

  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('MongoDB URI must be defined.')
  }

  if (!process.env.NATS_URL) {
    throw new Error('MongoDB URI must be defined.')
  }
  
  try {
    await wrapper.connect(process.env.NATS_CLUSTER_ID, process.env.NATS_CLIENT_ID, process.env.NATS_URL)
    await mongoose.connect(process.env.MONGO_URI)
    new TicketCreatedListener(wrapper.client).listen()
    new TicketUpdatedListener(wrapper.client).listen()
    new ExpirationCompleteListener(wrapper.client).listen()
    new PaymentCreatedListener(wrapper.client).listen()
    wrapper.client.on('close', () => {
      console.log('NATS connection closed!')
      process.exit()
    })
    process.on('SIGINT', () => wrapper.client.close())
    process.on('SIGTERM', () => wrapper.client.close)
  } catch (err) {
    console.error(err)
  }

  console.log('Connected to MongoDB...')
  
  app.listen(3000, () => {
    console.log('Listening on port 3000!')
  })
}

start()


