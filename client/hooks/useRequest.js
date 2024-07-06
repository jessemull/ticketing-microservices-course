import axios from 'axios'
import { useState } from 'react'

const Errors = ({ errors = [] }) => {
  return (
    <div className="mt-2 alert alert-danger">
      {errors.map(({ message }) => <li className="my-0" key={message}>{message}</li>)}
    </div>
  )
}

const useRequest = ({ body, method, onSuccess, url }) => {
  const [errors, setErrors] = useState(null)

  const doRequest = async (data = {}) => {
    setErrors(null)
    try {
      const response = await axios[method](url, { ...body, ...data })
      onSuccess(response.data)
    } catch (err) {
      setErrors(<Errors errors={err && err.response ? err.response.data : [{ message: 'Something went wrong.' }]} />)
    }
  }

  return {
    doRequest,
    errors
  }
}

export default useRequest