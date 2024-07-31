import React from 'react'

function Orders({ orders }) {
    console.log(orders)
    return (
        <div>
            <h1>Orders</h1>
            <ul>
                {orders.map(order => {
                    return (
                        <li key={order.id}>
                            {order.ticket.title} - {order.status}
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}

Orders.getInitialProps = async (context, client) => {
    const { data } = await client.get('/api/orders')
    return { orders: data }
}

export default Orders