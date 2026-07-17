import api from './client';

export const candidatesApi = {
  getAll: () => api.get('/candidates').then(r => r.data),
  getMyApplications: () => api.get('/candidates/my-applications').then(r => r.data),
  apply: (jobId) => api.post('/candidates/apply', { jobId }).then(r => r.data),
  updateStage: (applicationId, stage, matchScore) =>
    api.put(`/candidates/applications/${applicationId}/stage`, { stage, matchScore }).then(r => r.data),
  remove: (applicationId) => api.delete(`/candidates/applications/${applicationId}`).then(r => r.data),
};
