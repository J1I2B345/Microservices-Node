import request from 'supertest'
import { OrderStatus } from '@jbev/common'

import { app } from "../../app"
import { createMongooseId } from '../../test/utils'
import { Order } from '../../models/order'
import { stripe } from '../../stripe'
import { Payment } from '../../models/payments'

// jest.mock("../../stripe")
it('returns a 404 when purchasing an order that does not exist', async () => {
    await request(app).post("/api/payments").set('Cookie', global.signin())
        .send({
            token: 'adfasdf', orderId: createMongooseId()
        })
        .expect(404)
})

it('returns a 401 when purchasing an order that doesnt belong to the user', async () => {
    const order = Order.build({
        id: createMongooseId(),
        price: 10,
        status: OrderStatus.Created,
        userId: createMongooseId(),
        version: 0
    })
    await order.save()
    await request(app).post("/api/payments").set('Cookie', global.signin())
        .send({
            token: 'adfasdf', orderId: order.id
        })
        .expect(401)
})

it('returns a 400 when purchasing a cancelled order', async () => {
    const userId = createMongooseId()
    const order = Order.build({
        id: createMongooseId(),
        price: 10,
        status: OrderStatus.Cancelled,
        userId,
        version: 0
    })
    await order.save()
    await request(app).post("/api/payments").set('Cookie', global.signin(userId))
        .send({
            token: 'adfasdf', orderId: order.id
        })
        .expect(400)

})

it('returns a 204 with valid inputs', async () => {
    const userId = createMongooseId()
    const price = Math.floor(Math.random() * 1000000)
    const order = Order.build({
        id: createMongooseId(),
        price,
        status: OrderStatus.Created,
        userId,
        version: 0
    })
    await order.save()
    await request(app).post("/api/payments").set('Cookie', global.signin(userId))
        .send({
            token: 'tok_visa', orderId: order.id
        })
        .expect(201)

    // with mock stripe
    // const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0]
    // expect(stripe.charges.create).toHaveBeenCalled()
    // expect(chargeOptions.source).toBe('tok_visa')
    // expect(chargeOptions.amount).toBe(10 * 100)
    // expect(chargeOptions.currency).toBe('usd')

    // with real stripe
    const stripeCharges = await stripe.charges.list({ limit: 50 })
    const stripeCharge = stripeCharges.data.find(charge => charge.amount === price * 100)
    expect(stripeCharge).toBeDefined()
    expect(stripeCharge!.currency).toBe('usd')

    const payment = await Payment.findOne({
        orderId: order.id,
        stripeId: stripeCharge!.id
    })
    expect(payment).not.toBeNull()
})