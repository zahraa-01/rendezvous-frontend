import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../api/client'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem('access_token')
  )
  const [user, setUser] = useState(null)

  const fetchUser = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/user/')
      setUser(data)
      setIsAuthenticated(true)
    } catch {
      setUser(null)
      setIsAuthenticated(false)
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    }
  }, [])

  useEffect(() => {
    if (localStorage.getItem('access_token')) {
      fetchUser()
    }
  }, [fetchUser])

  const login = async (username, password) => {
    const { data } = await api.post('/auth/token/', { username, password })
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    setIsAuthenticated(true)
    await fetchUser()
  }

  const register = async (username, email, password) => {
    await api.post('/auth/register/', { username, email, password })
    await login(username, password)
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, register, logout }}>
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