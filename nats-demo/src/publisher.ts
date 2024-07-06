import nats from 'node-nats-streaming'
import { TicketCreatedPublisher } from './ticket-created-publisher'

console.clear()

const stan = nats.connect('ticketing', 'publisher', {
  url: 'http://localhost:4222'
})

stan.on('connect', async () => {
  console.log('Publisher connected to NATS!')

  const publisher = new TicketCreatedPublisher(stan)

  publisher.publish({
    id: 'id',
    price: 100.00,
    title: 'title',
  })
})
