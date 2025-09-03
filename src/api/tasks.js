import axios from 'axios'

const API_BASE_URL = 'http://127.0.0.1:8000/api'

export const tasksAPI = {
  getTasks: async (token, params = {}) => {
    const response = await axios.get(`${API_BASE_URL}/tasks`, {
      headers: { Authorization: `Bearer ${token}` },
      params
    })
    return response.data
  },

  createTask: async (token, task) => {
    const response = await axios.post(`${API_BASE_URL}/tasks`, task, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
  },

  updateTask: async (token, taskId, updates) => {
    const response = await axios.put(`${API_BASE_URL}/tasks/${taskId}`, updates, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
  },

  deleteTask: async (token, taskId) => {
    const response = await axios.delete(`${API_BASE_URL}/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
  }
}

