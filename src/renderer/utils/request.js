import axios from 'axios'

// create an axios instance
const service = axios.create({
  timeout: 10000, // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent

    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  response => {
    const res = response.data

    return res
  },
  error => {
    return Promise.reject(error)
  }
)

export default service
