import axios from 'axios'

const API_BASE_URL = 'https://todo.eylx.sa/public/api'

export const authAPI = {
  login: async (email, password) => {
    const response = await axios.post(`${API_BASE_URL}/login`, {
      email,
      password
    }, {
      headers: {
        Accept: 'application/json',
      }
    })
    return response.data
  },

  register: async (username, email, password) => {
    const response = await axios.post(`${API_BASE_URL}/register`, {
      username,
      email,
      password
    }, {
      headers: {
        Accept: 'application/json',
      }
    })
    return response.data
  },

  register: async (username, email, password) => {
    const response = await axios.post(`${API_BASE_URL}/register`, {
      username,
      email,
      password
    }, {
      headers: {
        Accept: 'application/json',
      }
    })
    return response.data
  }
}

