import mongoose from "mongoose";

import { OrderCreatedListener } from "../order-created-listener";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedEvent, OrderStatus } from "@jbev/common";


const setup = async () => {
    const listener = new OrderCreatedListener(natsWrapper.client)
    const userId = new mongoose.Types.ObjectId().toHexString()
    const ticket = Ticket.build({
        title: "concert",
        price: 20,
        userId,
    })

    await ticket.save()

    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        version: 0,
        userId,
        expiresAt: "123",
        ticket: {
            id: ticket.id,
            price: ticket.price
        }
    }

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }
    return { msg, data, ticket, listener }
}

it('sets the userId of the ticket', async () => {
    const { msg, data, ticket, listener } = await setup()
    await listener.onMessage(data, msg)
    const updatedTicket = await Ticket.findById(ticket.id)
    expect(updatedTicket!.orderId).toBe(data.id)
})
it('acks the message', async () => {
    const { msg, data, listener } = await setup()
    await listener.onMessage(data, msg)
    expect(msg.ack).toHaveBeenCalled()
})

it('publish a ticket updated event', async () => {
    const { msg, data, listener } = await setup()
    await listener.onMessage(data, msg)
    expect(natsWrapper.client.publish).toHaveBeenCalled()
})