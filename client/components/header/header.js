import Link from 'next/link'
import Router from 'next/router'
import useRequest from '../../hooks/useRequest'
import Toast from '../toast/toast'

const Header = ({ currentUser }) => {
  const onSuccess = () => {
    const bootstrap = require('bootstrap')
    const toast = document.getElementById('sign-out-toast')
    const instance = bootstrap.Toast.getOrCreateInstance(toast)
    instance.show()
    Router.push('/')
  }

  const { doRequest } = useRequest({
    method: 'post',
    onSuccess,
    url: '/api/users/signout'
  })

  const onSignOut = () => {
    doRequest()
  }

  return (
    <>
      <nav className="p-3 bg-dark text-white d-flex align-items-center justify-content-between">
        <h1>
          <Link className="navbar-brand" href="/">
            MyTix
          </Link>
        </h1>
        {currentUser ? 
          <div>
            <Link className="btn btn-outline-light me-2" href="/tickets/new">Sell Tickets</Link>
            <Link className="btn btn-outline-light me-2" href="/orders">My Orders</Link>
            <button className="btn btn-outline-light me-2" id="sign-out-btn" onClick={onSignOut}>Sign Out</button>
          </div> : 
          <div>
            <Link className="btn btn-outline-light me-2" href="/auth/signup">Sign Up</Link>
            <Link className="btn btn-outline-light me-2" href="/auth/signin">Sign In</Link>
          </div>
        }
      </nav>
      <Toast id="sign-out-toast" message="You are now signed out!" />
    </>
    
  )
}

export default Header