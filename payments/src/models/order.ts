import mongoose, { Document, Model } from 'mongoose'
import { OrderStatus } from '@mytix/common'
import { updateIfCurrentPlugin } from 'mongoose-update-if-current'

interface OrderAttributes {
  id: string
  price: number
  status: OrderStatus
  userId: string
  version: number
}

interface OrderDocument extends Document {
  price: number
  status: OrderStatus
  userId: string
  version: number
}

interface OrderModel extends Model<OrderDocument>{
  build(attributes: OrderAttributes): OrderDocument
}

const schema = new mongoose.Schema({
  price: {
    required: true,
    type: Number
  },
  status: {
    default: OrderStatus.Created,
    enum: Object.values(OrderStatus),
    required: true,
    type: String
  },
  userId: {
    required: true,
    type: String
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

schema.statics.build = (attributes: OrderAttributes) => {
  return new Order({
    _id: attributes.id,
    price: attributes.price,
    status: attributes.status,
    userId: attributes.userId,
    version: attributes.version,
  })
}

const Order = mongoose.model<OrderDocument, OrderModel>('Order', schema)

export { Order }