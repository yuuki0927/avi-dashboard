import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { getToken, setToken } from '../lib/apiClient'

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)      // { id, name, email, role, status, current_clinic_id }
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = getToken()
    if (!token) { setLoading(false); return }
    axios.get(`${BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => setUser(r.data))
      .catch(() => setToken(null))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    setError('')
    try {
      const res = await axios.post(`${BASE}/api/auth/login`, { email, password })
      setToken(res.data.token)
      setUser(res.data.user)
      return true
    } catch (e) {
      setError(e.response?.data?.error || 'ログインに失敗しました')
      return false
    }
  }, [])

  const loginWithData = useCallback((token, userData) => {
    setToken(token)
    setUser(userData)
  }, [])

  const logout = useCallback(async () => {
    const token = getToken()
    if (token) {
      axios.post(`${BASE}/api/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {})
    }
    setToken(null)
    setUser(null)
  }, [])

  const switchClinic = useCallback(async (clinicId) => {
    const token = getToken()
    if (!token) return
    try {
      await axios.post(`${BASE}/api/auth/switch-clinic`, { clinic_id: clinicId ?? null }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setUser(prev => ({ ...prev, current_clinic_id: clinicId ?? null }))
    } catch (e) {
      console.error('switch-clinic failed', e)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, loginWithData, logout, switchClinic, error, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
