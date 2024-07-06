import mongoose, { Document, Model } from 'mongoose'

interface PaymentAttributes {
  orderId: string
  stripeId: string
}

interface PaymentDocument extends Document {
  orderId: string
  stripeId: string
}

interface PaymentModel extends Model<PaymentDocument>{
  build(attributes: PaymentAttributes): PaymentDocument
}

const schema = new mongoose.Schema({
  orderId: {
    required: true,
    type: String
  },
  stripeId: {
    required: true,
    type: String
  },
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id
      delete ret._id
      delete ret.__v
    }
  }
})

schema.statics.build = (attributes: PaymentAttributes) => {
  return new Payment({
    orderId: attributes.orderId,
    stripeId: attributes.stripeId
  })
}

const Payment = mongoose.model<PaymentDocument, PaymentModel>('Payment', schema)

export { Payment }