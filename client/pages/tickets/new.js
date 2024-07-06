import React, { useState } from 'react'
import Router from 'next/router'
import useRequest from '../../hooks/useRequest'

const NewTicket = () => {
  const [price, setPrice] = useState('')
  const [title, setTitle] = useState('')

  const onSuccess = (data) => {
    Router.push('/')
  }

  const { doRequest, errors } = useRequest({
    body: {
      price,
      title
    },
    method: 'post',
    onSuccess,
    url: '/api/tickets',
  })

  const onPriceBlur = (event) => {
    const parsed = parseFloat(event.target.value)
    if (isNaN(parsed)) {
      return
    } else {
      setPrice(parsed.toFixed(2))
    }
  }

  const onPriceChange = (event) => {
    setPrice(event.target.value)
  }

  const onTitleChange = (event) => {
    setTitle(event.target.value)
  }

  const onSubmit = (event) => {
    event.preventDefault()
    doRequest()
  }

  return (
    <div className="ps-3 pt-2 w-25">
     <form onSubmit={onSubmit}>
       <h1>Create a Ticket</h1>
      <div className="form-group">
        <label>Title</label>
        <input className="form-control" onChange={onTitleChange} value={title}/>
      </div>
      <div className="mt-2 form-group">
        <label>Price</label>
        <input className="form-control" onBlur={onPriceBlur} onChange={onPriceChange} type="number" value={price} />
      </div>
      {errors}
      <button className="mt-3 btn btn-primary">Submit</button>
     </form>
    </div>
  )
}

NewTicket.getInitialProps = (context, client, currentUser) => {
  return {
    client,
    currentUser
  }
}

export default NewTicket