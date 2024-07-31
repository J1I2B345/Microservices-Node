import React from 'react'
import Router from 'next/router'

import useRequest from '../hooks/use-request'

function TicketShow({ ticket }) {
    console.log(ticket)

    const { doRequest, errors } = useRequest({
        url: '/api/orders',
        method: 'post',
        body: {
            ticketId: ticket.id
        },
        onSuccess: (order) => {
            console.log(order)
            console.log('order.id', order.id)
            Router.push('/orders/[orderId]', `/orders/${order.id}`)
        }
    })
    
    return (
        <div>
            TicketShow
            <h1>{ticket.title}</h1>
            <h4>Price: {ticket.price}</h4>
            {errors}
            <button onClick={() => {
                console.log('purchase')
                return doRequest()
            }} className='btn btn-primary'>Purchase</button>
        </div>
    )
}

TicketShow.getInitialProps = async (context, client) => {
    const { ticketId } = context.query
    const { data } = await client.get(`/api/tickets/${ticketId}`)
    return { ticket: data }
}

export default TicketShow