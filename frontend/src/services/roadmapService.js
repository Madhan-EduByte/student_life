import api from './api';

export const roadmapService = {
  generate: (careerInputs) =>
    api.post('/roadmap/generate', { career_inputs: careerInputs }),
  getActive: () => api.get('/roadmap/active'),
  getAll: () => api.get('/roadmap'),
  getById: (id) => api.get(`/roadmap/${id}`),
  update: (id) => api.put(`/roadmap/${id}/update`),
  getMilestones: (id) => api.get(`/roadmap/${id}/milestones`),
  updateMilestone: (milestoneId, isCompleted) =>
    api.patch(`/roadmap/milestones/${milestoneId}`, {
      is_completed: isCompleted,
    }),
};

export default roadmapService;
