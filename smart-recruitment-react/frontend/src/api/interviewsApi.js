import api from './client';

export const interviewsApi = {
  getAll: () => api.get('/interviews').then(r => r.data),
  schedule: (payload) => api.post('/interviews', payload).then(r => r.data),
  updateStatus: (id, status) => api.put(`/interviews/${id}/status`, { status }).then(r => r.data),
  remove: (id) => api.delete(`/interviews/${id}`).then(r => r.data),
};
