import mongoose from 'mongoose'
import { updateIfCurrentPlugin } from 'mongoose-update-if-current'
import { TicketDocument } from './ticket'
import { OrderStatus } from '@mytix/common'

// Interface describing required properties to create a new order.

interface OrderAttributes {
  expiresAt: Date
  status: OrderStatus
  ticket: TicketDocument
  userId: string
}

// Interface that describes the properties on a order model.

interface OrderModel extends mongoose.Model<any> {
  build(order: OrderAttributes): OrderDocument
}

// Interface that describe the properties on a order document.

interface OrderDocument extends mongoose.Document {
  expiresAt: Date
  status: OrderStatus
  ticket: TicketDocument
  userId: string
  version: number
}

const schema = new mongoose.Schema({
  expiresAt: {
    type: mongoose.Schema.Types.Date
  },
  status: {
    type: String,
    required: true,
    enum: Object.values(OrderStatus),
    default: OrderStatus.Created
  },
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket'
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

schema.statics.build = (order: OrderAttributes) => {
  return new Order(order)
}

const Order = mongoose.model<OrderAttributes, OrderModel>('Order', schema)

export { Order, OrderStatus }