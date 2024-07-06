import 'bootstrap/dist/css/bootstrap.css'
import buildClient from '../api/buildClient'
import Header from '../components/header/header'

const AppComponent = ({ Component, currentUser, pageProps }) => {
  return (
    <div>
      <Header currentUser={currentUser} />
      <Component currentUser={currentUser} {...pageProps} />
    </div>
  )
}

AppComponent.getInitialProps = async (context) => {
  const { Component, ctx } = context
  const { req } = ctx
  const client = buildClient({ req })
  const  { data: { currentUser } } = await client.get('/api/users/currentuser')

  let pageProps = {}

  if (Component.getInitialProps) {
    pageProps = await Component.getInitialProps(ctx, client, currentUser)
  }

  return {
    currentUser,
    pageProps
  }
}

export default AppComponent