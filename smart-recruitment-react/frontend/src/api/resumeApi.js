import api from './client';

export const resumeApi = {
  analyzeText: (payload) => api.post('/resume/analyze', payload).then(r => r.data),
  analyzeFile: (formData) =>
    api.post('/resume/analyze-file', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data),
};
