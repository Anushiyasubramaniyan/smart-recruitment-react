import api from './client';

export const adminApi = {
  getAllUsers: () => api.get('/admin/users').then(r => r.data),
  createUser: (payload) => api.post('/admin/users', payload).then(r => r.data),
  updateUser: (id, payload) => api.put(`/admin/users/${id}`, payload).then(r => r.data),
  updateUserStatus: (id, status) => api.put(`/admin/users/${id}/status`, { status }).then(r => r.data),
  removeUser: (id) => api.delete(`/admin/users/${id}`).then(r => r.data),
  getStats: () => api.get('/admin/stats').then(r => r.data),
};
