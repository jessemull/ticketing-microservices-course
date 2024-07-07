import axios from 'axios'

const buildClient = ({ req }) => {
  if (typeof window === 'undefined') {
    return axios.create({
      baseURL: 'https://jessemull-ticketing-app-prod.one/',
      headers: req.headers
    })
  } else {
    return axios.create({
      baseUrl: '/'
    })
  }
}

export default buildClient