import app from './app'
import mongoose from 'mongoose'
import { wrapper } from './nats-client'
import { OrderCancelledListener } from './events/listeners/order-cancelled-listener'
import { OrderCreatedListener } from './events/listeners/order-created-listener'

const start = async () => {
  console.log('Starting the payments service...')
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
    new OrderCancelledListener(wrapper.client).listen()
    new OrderCreatedListener(wrapper.client).listen()
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


