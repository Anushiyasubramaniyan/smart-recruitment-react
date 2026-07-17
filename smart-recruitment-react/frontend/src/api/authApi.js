import api from './client';

export const authApi = {
  register: (payload) => api.post('/auth/register', payload).then(r => r.data),
  login: (payload) => api.post('/auth/login', payload).then(r => r.data),
  getProfile: () => api.get('/auth/profile').then(r => r.data),
};
