import api from './api'

export const projectService = {
  async getAll() {
    const response = await api.get('/projects')
    return response.data
  },

  async getById(id) {
    const response = await api.get(`/projects/${id}`)
    return response.data
  },

  async create(projectData) {
    const response = await api.post('/projects', projectData)
    return response.data
  },

  async update(id, projectData) {
    const response = await api.put(`/projects/${id}`, projectData)
    return response.data
  },

  async delete(id) {
    const response = await api.delete(`/projects/${id}`)
    return response.data
  },

  async getMembers(id) {
    const response = await api.get(`/projects/${id}/members`)
    return response.data
  },

  async addMember(projectId, userId, role = 'MEMBER') {
    const response = await api.post(`/projects/${projectId}/members`, { userId, role })
    return response.data
  },

  async removeMember(projectId, userId) {
    const response = await api.delete(`/projects/${projectId}/members/${userId}`)
    return response.data
  },

  async getAnalytics(id) {
    const response = await api.get(`/projects/${id}/analytics`)
    return response.data
  }
}
