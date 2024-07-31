import { OrderCreatedEvent, OrderStatus } from "@jbev/common"
import { natsWrapper } from "../../../nats-wrapper"
import { OrderCreatedListener } from "../order-created-listener"
import mongoose from "mongoose"
import { Order } from "../../../models/order"


const setup = () => {
    const listener = new OrderCreatedListener(natsWrapper.client)

    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        ticket: { id: new mongoose.Types.ObjectId().toHexString(), price: 10 },
        expiresAt: "123",
        version: 0

    }

    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }
    return {
        msg, data, listener
    }
}

it("replicates the order info", async () => {
    const { listener, data, msg } = setup()
    await listener.onMessage(data, msg)
    const order = await Order.findById(data.id)
    expect(order?.id).toBe(data.id)
    expect(order?.price).toBe(data.ticket.price)
})

it("acks the message", async () => {
    const { listener, data, msg } = setup()
    await listener.onMessage(data, msg)
    expect(msg.ack).toHaveBeenCalled()
})