import Router from 'next/router'
import useRequest from '../../hooks/useRequest'
import { useState } from 'react'

const SignIn = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const onSuccess = () => {
    Router.push('/')
  }

  const { doRequest, errors } = useRequest({
    body: {
      email,
      password
    },
    method: 'post',
    onSuccess,
    url: '/api/users/signin',
  })

  const onEmailChange = (event) => {
    setEmail(event.target.value)
  }

  const onPasswordChange = (event) => {
    setPassword(event.target.value)
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    doRequest()
  } 

  return (
    <div className="ps-3 pt-2 w-25">
      <form onSubmit={onSubmit}>
        <h1>Sign In</h1>
        <div className="form-group">
          <label>E-mail</label>
          <input className="form-control" onChange={onEmailChange}></input>
        </div>
        <div className="mt-2 form-group">
          <label>Password</label>
          <input className="form-control" onChange={onPasswordChange} type="password"></input>
        </div>
        {errors}
        <button className="mt-3 btn btn-primary">Sign In</button>
      </form>
    </div>
  )
}

export default SignIn