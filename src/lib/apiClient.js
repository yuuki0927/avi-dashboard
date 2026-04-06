// Axios wrapper — in mock mode routes requests to in-memory handlers instead of the server
import axios from 'axios'
import { mockRequest } from './mockHandlers.js'

const MOCK_KEY = 'mediage_mock_mode'

export const isMockMode = () => localStorage.getItem(MOCK_KEY) === 'true'

export const setMockMode = (enabled) => {
  if (enabled) localStorage.setItem(MOCK_KEY, 'true')
  else localStorage.removeItem(MOCK_KEY)
}

const api = {
  get:    (url, config)       => isMockMode() ? mockRequest('get',    url, null) : axios.get(url, config),
  post:   (url, data, config) => isMockMode() ? mockRequest('post',   url, data) : axios.post(url, data, config),
  put:    (url, data, config) => isMockMode() ? mockRequest('put',    url, data) : axios.put(url, data, config),
  delete: (url, config)       => isMockMode() ? mockRequest('delete', url, null) : axios.delete(url, config),
}

export default api
