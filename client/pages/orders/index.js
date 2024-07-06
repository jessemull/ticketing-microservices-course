import Link from 'next/link'
import React from 'react'

const ShowOrders = ({ orders }) => {
  return (
    <div className="m-3">
      <h1>Orders</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(({ id, status, ticket: { title } }) => (
            <tr key={id}>
              <td>{title}</td>
              <td>{status}</td>
              <td>
                <Link href="/orders/[orderId]" as={`/orders/${id}`}>
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

ShowOrders.getInitialProps = async (context, client, currentUser) => {
  const { data } = await client.get(`/api/orders`)
  return {
    client,
    currentUser,
    orders: data
  }
}

export default ShowOrders