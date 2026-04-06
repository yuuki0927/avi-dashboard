// Axios wrapper — in mock mode routes requests to in-memory handlers instead of the server
import axios from 'axios'
import { mockRequest } from './mockHandlers.js'

const MOCK_KEY = 'mediage_mock_mode'
const TOKEN_KEY = 'mediage_auth_token'

export const isMockMode = () => localStorage.getItem(MOCK_KEY) === 'true'

export const setMockMode = (enabled) => {
  if (enabled) localStorage.setItem(MOCK_KEY, 'true')
  else localStorage.removeItem(MOCK_KEY)
}

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

function authConfig(config = {}) {
  const token = getToken()
  if (!token) return config
  return {
    ...config,
    headers: { ...(config.headers || {}), Authorization: `Bearer ${token}` },
  }
}

const api = {
  get:    (url, config)       => isMockMode() ? mockRequest('get',    url, null) : axios.get(url, authConfig(config)),
  post:   (url, data, config) => isMockMode() ? mockRequest('post',   url, data) : axios.post(url, data, authConfig(config)),
  put:    (url, data, config) => isMockMode() ? mockRequest('put',    url, data) : axios.put(url, data, authConfig(config)),
  delete: (url, config)       => isMockMode() ? mockRequest('delete', url, null) : axios.delete(url, authConfig(config)),
}

export default api
