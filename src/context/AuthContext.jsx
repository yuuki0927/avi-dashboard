import React, { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [error, setError] = useState('')

  const login = (email, password) => {
    setError('')
    if (email === 'admin@mediage.jp' && password === 'password123') {
      setUser({ email, name: '管理者', role: 'admin' })
      return true
    }
    setError('メールアドレスまたはパスワードが正しくありません')
    return false
  }

  const logout = () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
