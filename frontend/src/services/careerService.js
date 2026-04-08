import api from './api';

export const careerService = {
  getAll: (params) => api.get('/careers', { params }),
  getById: (id) => api.get(`/careers/${id}`),
  simulate: (careerId, duration = '1_day') =>
    api.get(`/careers/simulate/${careerId}`, { params: { duration } }),
};

export default careerService;
