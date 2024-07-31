import React from 'react'
import Router from 'next/router'
import useRequest from '../hooks/use-request'



function NewTicket(props) {
    const [title, setTitle] = React.useState('')
    const [price, setPrice] = React.useState('')
    console.log(props)
    const onSubmit = (event) => {
        event.preventDefault()
        doRequest()
    }
    const { doRequest, errors } = useRequest({
        url: '/api/tickets',
        method: 'post',
        body: {
            title, price
        },
        onSuccess: (ticket) => {
            console.log(ticket)
            return Router.push('/')
        }
    })
    function onBlur() {
        const value = parseFloat(price)
        if (isNaN(value)) {
            return
        }
        setPrice(value.toFixed(2))
    }

    return (
        <div>NewTicket
            <h1>Create a Ticket</h1>
            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <label>Title</label>
                    <input onChange={(e) => {
                        setTitle(e.target.value)
                    }} />
                </div>
                <div className='form-group'>
                    <label>Price</label>
                    <input onChange={(e) => {
                        setPrice(e.target.value)
                    }}
                        onBlur={onBlur}
                        value={price}
                    />
                </div>
                <button className='btn btn-primary'>Submit</button>
                {errors}
            </form>
        </div>
    )
}

export default NewTicket