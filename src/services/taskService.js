import api from './api'

export const taskService = {
  async getAll(projectId) {
    const response = await api.get(`/projects/${projectId}/tasks`)
    return response.data
  },

  async getById(id) {
    const response = await api.get(`/tasks/${id}`)
    return response.data
  },

  async create(projectId, taskData) {
    const response = await api.post(`/projects/${projectId}/tasks`, taskData)
    return response.data
  },

  async update(id, taskData) {
    const response = await api.put(`/tasks/${id}`, taskData)
    return response.data
  },

  async delete(id) {
    const response = await api.delete(`/tasks/${id}`)
    return response.data
  },

  async updateStatus(id, status) {
    const response = await api.patch(`/tasks/${id}/status`, { status })
    return response.data
  },

  async assignTask(id, userId) {
    const response = await api.patch(`/tasks/${id}/assign`, { userId })
    return response.data
  },

  async updatePosition(id, status, position) {
    const response = await api.patch(`/tasks/${id}/position`, { status, position })
    return response.data
  },

  async getComments(id) {
    const response = await api.get(`/tasks/${id}/comments`)
    return response.data
  },

  async addComment(taskId, content) {
    const response = await api.post(`/tasks/${taskId}/comments`, { content })
    return response.data
  },

  async uploadAttachment(taskId, file) {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post(`/tasks/${taskId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  }
}
