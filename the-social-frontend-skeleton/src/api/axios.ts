import axios from 'axios'
import { getStoredToken } from '../auth/AuthContext'

const api = axios.create({
  //baseURL: import.meta.env.VITE_API_BASE_URL,
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // If token is invalid/expired, force a clean logout UX
    if (err?.response?.status === 401) {
      localStorage.removeItem('the-social.jwt')
      // Optional: redirect to /login here
    }
    return Promise.reject(err)
  }
)

export default api
