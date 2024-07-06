import Link from 'next/link'

const LandingPage = ({ tickets }) => {
  return (
    <div className="m-3">
      <h1>Tickets</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map(({ id, price, title }) => (
            <tr key={id}>
              <td>{title}</td>
              <td>{price}</td>
              <td>
                <Link href="/tickets/[ticketId]" as={`/tickets/${id}`}>
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

LandingPage.getInitialProps = async (context, client, currentUser) => {
  const { data } = await client.get('/api/tickets')
  return {
    client,
    currentUser,
    tickets: data
  }
}

export default LandingPage