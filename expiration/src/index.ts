import { OrderCreatedListener } from './events/listeners/order-created-listener'
import { wrapper } from './nats-client'

const start = async () => {
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
    wrapper.client.on('close', () => {
      console.log('NATS connection closed!')
      process.exit()
    })
    await new OrderCreatedListener(wrapper.client).listen()
    process.on('SIGINT', () => wrapper.client.close())
    process.on('SIGTERM', () => wrapper.client.close)
  } catch (err) {
    console.error(err)
  }
}

start()


