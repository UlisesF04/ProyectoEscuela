import axios from 'axios'
import { API_BASE_URL } from '../constants/business'

const api = axios.create({
  baseURL: API_BASE_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    if (error.response?.status === 403) {
      const msg = error.response?.data?.message || 'No tenés permisos para realizar esta acción'
      window.dispatchEvent(new CustomEvent('api:forbidden', { detail: { message: msg } }))
    }
    return Promise.reject(error)
  }
)

export default api
