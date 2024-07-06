import Router from 'next/router'
import useRequest from "../../hooks/useRequest"

const ShowTicket = ({ ticket = {} }) => {
  const { id, price, title } = ticket

  const onSuccess = (data) => {
    const { id } = data
    Router.push('/orders/[orderId]', `/orders/${id}`)
  }

  const { doRequest, errors } = useRequest({
    body: {
      ticketId: id
    },
    method: 'post',
    onSuccess,
    url: '/api/orders',
  })

  const onPurchaseClick = () => {
    doRequest()
  }

  return (
    <div className="m-3 w-25">
      <h1>Ticket Information</h1>
      <h4 className="mt-2">Title</h4>
      <div>{title}</div>
      <h4 className="mt-2">Price</h4>
      <div>{price}</div>
      {errors}
      <button className="mt-3 btn btn-primary" onClick={onPurchaseClick}>Purchase</button>
    </div>
  )
}

ShowTicket.getInitialProps = async (context, client, currentUser) => {
  const { ticketId } = context.query
  const { data } = await client.get(`/api/tickets/${ticketId}`)
  return {
    client,
    currentUser,
    ticket: data
  }
}

export default ShowTicket