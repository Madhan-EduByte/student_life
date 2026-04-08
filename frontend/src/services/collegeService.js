import api from './api';

export const collegeService = {
  getAll: (params) => api.get('/colleges', { params }),
  getById: (id) => api.get(`/colleges/${id}`),
  getMatches: () => api.get('/colleges/match'),
};

export default collegeService;
