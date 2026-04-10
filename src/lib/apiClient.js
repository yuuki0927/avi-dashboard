import axios from 'axios'

const TOKEN_KEY = 'mediage_auth_token'

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
  get:    (url, config)       => axios.get(url, authConfig(config)),
  post:   (url, data, config) => axios.post(url, data, authConfig(config)),
  put:    (url, data, config) => axios.put(url, data, authConfig(config)),
  delete: (url, config)       => axios.delete(url, authConfig(config)),
}

export default api
