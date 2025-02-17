import { Message } from 'node-nats-streaming'
import mongoose from 'mongoose'
import { TicketUpdatedEvent } from '@jbev/common'

import { natsWrapper } from '../../../nats-wrapper'
import { Ticket } from '../../../models/ticket'
import { TicketUpdateListener } from '../ticket-updated-listener'

const setup = async () => {
    // create an instance of the listener
    const listener = new TicketUpdateListener(natsWrapper.client)

    // create and save a ticket
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    })
    await ticket.save()



    // create a fake data event
    const data: TicketUpdatedEvent['data'] = {
        id: ticket.id,
        version: ticket.version + 1,
        title: 'concert v2',
        price: 5,
        userId: new mongoose.Types.ObjectId().toHexString()
    }

    // create a fake message object
    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }


    // return all of this stuff
    return { listener, data, msg, ticket }
}



it('finds, updates, and saves a ticket', async () => {
    // call the onMessage function with the data object + message object
    const { listener, data, msg, ticket } = await setup()
    await listener.onMessage(data, msg)

    // write assertions to make sure a ticket was created
    const updatedTicket = await Ticket.findById(ticket.id)

    expect(updatedTicket).toBeDefined()
    console.log('updatedTicket', updatedTicket)
    expect(updatedTicket!.title).toEqual(data.title)
    expect(updatedTicket!.price).toEqual(data.price)
    expect(updatedTicket!.version).toEqual(data.version)

})

it('acks the message', async () => {
    // call the onMessage function with the data object + message object
    const { listener, data, msg } = await setup()
    await listener.onMessage(data, msg)

    // write assertions to make sure ack function is called
    expect(msg.ack).toHaveBeenCalled()
})

it('does not call ack if the event has a skipped version number', async () => {
    const { listener, data, msg } = await setup()

    data.version = 10

    try {
        await listener.onMessage(data, msg)
    } catch (err) {

    }

    expect(msg.ack).not.toHaveBeenCalled()
})

