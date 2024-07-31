import mongoose from "mongoose";

import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledEvent, OrderStatus } from "@jbev/common";
import { OrderCancelledListener } from "../order-cancelled-listerner";


const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client)
    const userId = new mongoose.Types.ObjectId().toHexString()
    const orderId = new mongoose.Types.ObjectId().toHexString()
    const ticket = Ticket.build({
        title: "concert",
        price: 20,
        userId,
    })
    ticket.set({orderId})
    await ticket.save()

    const data: OrderCancelledEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 1,
        ticket: {
            id: ticket.id,
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
    expect(updatedTicket!.orderId).toBe(undefined)
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