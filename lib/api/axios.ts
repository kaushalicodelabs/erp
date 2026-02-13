import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add interceptors if needed (e.g., for auth tokens)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global errors here
    const message = error.response?.data?.error || error.message || 'Something went wrong'
    return Promise.reject(new Error(message))
  }
)

export default api
