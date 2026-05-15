import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [isLoading, setIsLoading] = useState(false)

  const isAuthenticated = !!token

  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUser({ id: payload.id, email: payload.email, rol: payload.rol })
      } catch {
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
      }
    }
  }, [token])

  const login = useCallback(async (email, password) => {
    setIsLoading(true)
    try {
      const response = await api.post('/auth/login', { email, password })
      const { token: newToken, user: userData } = response.data
      localStorage.setItem('token', newToken)
      setToken(newToken)
      setUser(userData)
      return userData
    } catch (error) {
      const message = error.response?.data?.message || 'Error al iniciar sesión'
      throw new Error(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout')
    } catch {
    } finally {
      localStorage.removeItem('token')
      setToken(null)
      setUser(null)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
