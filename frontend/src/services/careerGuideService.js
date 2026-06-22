import api from './api';

export const careerGuideService = {
  generate: (careerInputs) =>
    api.post('/career-guide/generate', { career_inputs: careerInputs }),
  getActive: () => api.get('/career-guide/active'),
  getAll: () => api.get('/career-guide'),
  getById: (id) => api.get(`/career-guide/${id}`),
  update: (id) => api.put(`/career-guide/${id}/update`),
  getMilestones: (id) => api.get(`/career-guide/${id}/milestones`),
  updateMilestone: (milestoneId, isCompleted) =>
    api.patch(`/career-guide/milestones/${milestoneId}`, {
      is_completed: isCompleted,
    }),
};

export default careerGuideService;
