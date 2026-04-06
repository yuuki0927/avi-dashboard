import React, { createContext, useContext, useState, useCallback } from 'react'
import { isMockMode, setMockMode } from '../lib/apiClient'

const MockContext = createContext(null)

export function MockProvider({ children }) {
  const [mockMode, setMockModeState] = useState(() => isMockMode())

  const toggleMockMode = useCallback(() => {
    const next = !mockMode
    setMockMode(next)
    setMockModeState(next)
  }, [mockMode])

  return (
    <MockContext.Provider value={{ mockMode, toggleMockMode }}>
      {children}
    </MockContext.Provider>
  )
}

export const useMock = () => useContext(MockContext)
