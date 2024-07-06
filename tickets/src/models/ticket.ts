import mongoose from 'mongoose'
import { updateIfCurrentPlugin } from 'mongoose-update-if-current'

// Interface describing required properties to create a new ticket.

interface TicketAttributes {
  price: number
  orderId?: string
  title: string
  userId: string
}

// Interface that describes the properties on a ticket model.

interface TicketModel extends mongoose.Model<any> {
  build(ticket: TicketAttributes): TicketDocument
}

// Interface that describe the properties on a ticket document.

interface TicketDocument extends mongoose.Document {
  price: number
  orderId?: string
  title: string
  userId: string
  version: number
}

const schema = new mongoose.Schema({
  orderId: {
    type: String
  },
  price: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  }
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id
      delete ret._id
      delete ret.__v
    }
  }
})

schema.set('versionKey', 'version')
schema.plugin(updateIfCurrentPlugin)

schema.statics.build = (ticket: TicketAttributes) => {
  return new Ticket(ticket)
}

const Ticket = mongoose.model<TicketAttributes, TicketModel>('Ticket', schema)

export { Ticket }