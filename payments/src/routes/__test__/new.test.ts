import mongoose from "mongoose"
import app from "../../app"
import request from "supertest"
import { Order } from "../../models/order"
import { OrderStatus } from "@mytix/common"
import { stripe } from "../../stripe"
import { Payment } from "../../models/payment"

describe('new', () => {
  it('returns a 404 when purchasing an order that does not exist', async () => {
    const response = await request(app)
      .post('/api/payments')
      .set('Cookie', signin())
      .send({
        token: 'token',
        orderId: new mongoose.Types.ObjectId().toHexString()
      })
    expect(response.status).toEqual(404)
  })
  it(`returns a 401 when purchasing an order that doesn't belong to the user`, async () => {
    const order = Order.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      price: 100.00,
      status: OrderStatus.Created,
      userId: new mongoose.Types.ObjectId().toHexString(),
      version: 0,
    })
    await order.save()

    const response = await request(app)
      .post('/api/payments')
      .set('Cookie', signin())
      .send({
        token: 'token',
        orderId: order.id
      })
    expect(response.status).toEqual(401)
  })
  it('returns a 400 when purchasing a cancelled order', async () => {
    const order = Order.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      price: 100.00,
      status: OrderStatus.Cancelled,
      userId: new mongoose.Types.ObjectId().toHexString(),
      version: 0,
    })
    await order.save()

    const user = signin(order.userId)

    const response = await request(app)
      .post('/api/payments')
      .set('Cookie', user)
      .send({
        token: 'token',
        orderId: order.id
      })
    expect(response.status).toEqual(400)
  })
  it('creates a purchase', async () => {
    const order = Order.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      price: 100.00,
      status: OrderStatus.Created,
      userId: new mongoose.Types.ObjectId().toHexString(),
      version: 0,
    })
    await order.save()

    const user = signin(order.userId)

    const response = await request(app)
      .post('/api/payments')
      .set('Cookie', user)
      .send({
        token: 'token',
        orderId: order.id
      })
    
    const charge = (stripe.charges.create as jest.Mock).mock.calls[0][0]

    const payment = await Payment.findOne({ orderId: order.id })

    expect(response.status).toEqual(201)
    expect(charge).toEqual({ currency: 'usd', amount: order.price * 100, source: 'token' })
    expect(payment.orderId).toEqual(order.id)
  })
})