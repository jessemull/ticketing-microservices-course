import Queue from 'bull'
import { ExpirationCompletePublisher } from '../events/publishers/expiration-complete-publisher'
import { wrapper } from '../nats-client'

interface Payload {
  orderId: string
}

const queue = new Queue<Payload>('order:expiration', {
  redis: {
    host: process.env.REDIS_HOST
  }
})

queue.process(async ({ data: { orderId } }) => {
  new ExpirationCompletePublisher(wrapper.client).publish({
    orderId
  })
})

export {
  queue
}