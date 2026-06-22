import api from './api';

export const collegeService = {
  getAll: (params) => api.get('/colleges', { params }),
  getById: (id) => api.get(`/colleges/${id}`),
  getMatches: (criteria = {}) => {
    const params = new URLSearchParams();
    if (criteria.location) params.append('location', criteria.location);
    if (criteria.budget_range) params.append('budget_range', criteria.budget_range);
    if (criteria.preferred_stream) params.append('preferred_stream', criteria.preferred_stream);
    
    const queryString = params.toString();
    const url = queryString ? `/colleges/match?${queryString}` : '/colleges/match';
    return api.get(url);
  },
};

export default collegeService;
