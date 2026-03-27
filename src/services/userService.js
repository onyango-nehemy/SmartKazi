import api from './api'

export const userService = {
  async getAll() {
    const response = await api.get('/users')
    return response.data
  },

  async getById(id) {
    const response = await api.get(`/users/${id}`)
    return response.data
  },

  async update(id, userData) {
    const response = await api.patch(`/users/${id}`, userData)
    return response.data
  },

  async delete(id) {
    const response = await api.delete(`/users/${id}`)
    return response.data
  },
}