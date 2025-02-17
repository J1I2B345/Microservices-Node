
import mongoose from "mongoose"
import { OrderCancelledEvent, OrderStatus } from "@jbev/common"

import { natsWrapper } from "../../../nats-wrapper"
import { Order } from "../../../models/order"
import { OrderCancelledListener } from "../order-cancelled-listener"


const createMongoId = () => new mongoose.Types.ObjectId().toHexString()
const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client)

    const order = Order.build({
        id: createMongoId(),
        price: 10,
        status: OrderStatus.Created,
        userId: createMongoId(),
        version: 0
    })
    await order.save()

    const data: OrderCancelledEvent['data'] = {
        id: order.id,
        ticket: {
            id: createMongoId()
        },
        version: 1
    }

    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }
    return {
        msg, data, listener, order
    }
}

it("updates the status of the order", async () => {
    const { listener, data, msg, order } = await setup()
    await listener.onMessage(data, msg)
    const updatedOrder = await Order.findById(data.id)
    expect(updatedOrder?.status).toBe(OrderStatus.Cancelled)
})

it("acks the message", async () => {
    const { listener, data, msg } = await setup()
    await listener.onMessage(data, msg)
    expect(msg.ack).toHaveBeenCalled()
})