import axios from 'axios'

const API_BASE_URL = 'http://127.0.0.1:8000/api'

export const authAPI = {
  login: async (email, password) => {
    const response = await axios.post(`${API_BASE_URL}/login`, {
      email,
      password
    })
    return response.data
  },

  register: async (username, email, password) => {
    const response = await axios.post(`${API_BASE_URL}/register`, {
      username,
      email,
      password
    })
    return response.data
  }
}

