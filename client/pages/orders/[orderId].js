import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Router from 'next/router'
import StripeCheckout from 'react-stripe-checkout'
import useRequest from '../../hooks/useRequest'

const calculateSecondsLeft = (expiresAt) => (new Date(expiresAt) - new Date()) / 1000

const ShowOrder = ({ currentUser, order = {} }) => {
  const { email } = currentUser
  const { id: orderId, expiresAt, ticket: { id: ticketId, price, title } } = order
  const [secondsLeft, setSecondsLeft] = useState(Math.round(calculateSecondsLeft(expiresAt)))

  const onSuccess = (payment) => {
    Router.push('/orders')
  }

  const { doRequest, errors } = useRequest({
    body: {
      orderId
    },
    method: 'post',
    onSuccess,
    url: '/api/payments',
  })

  const handlePayment = ({ id }) => {
    doRequest({ token: id })
  }

  useEffect(() => {
    const intervalID = setInterval(() => {
      setSecondsLeft(Math.round(calculateSecondsLeft(expiresAt)))
    }, 1000)
    return () => {
      clearInterval(intervalID)
    }
  }, [expiresAt])

  if (secondsLeft <= 0) {
    return (
      <div className="m-3">
        <h1>{`Purchasing ${title}`}</h1>
        <div>Order expired...</div>
        {errors}
        <div className="mt-1">
          <Link href="/tickets/[ticketId]" as={`/tickets/${ticketId}`}>
            Back to Ticket
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="m-3">
      <h1>{`Purchasing ${title}`}</h1>
      <div>{`You have ${secondsLeft} to purchase the ticket...`}</div>
      {errors}
      <div className="mt-3">
        <StripeCheckout amount={price * 100} email={email} stripeKey='pk_test_51PZNwURupa7tzgfFpIzHgrVQzGn4U6tjYGXVRAwigOmylRYUjYs2UFPh3nJIuG9O6zlorj8nrm3uhlv6W3YiLLke009r645zcO' token={handlePayment} />
      </div>
    </div>
  )
}

ShowOrder.getInitialProps = async (context, client, currentUser) => {
  const { orderId } = context.query
  const { data } = await client.get(`/api/orders/${orderId}`)
  return {
    client,
    currentUser,
    order: data
  }
}

export default ShowOrder