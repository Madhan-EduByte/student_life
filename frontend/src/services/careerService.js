import api from './api';

export const careerService = {
  getAll: (params) => api.get('/careers', { params }),
  getById: (id) => api.get(`/careers/${id}`),
  simulate: (careerId, duration = '1_day') =>
    api.get(`/careers/simulate/${careerId}`, { params: { duration } }),
  getMatches: (criteria = {}) => {
    const params = new URLSearchParams();
    if (criteria.interests) params.append('interests', Array.isArray(criteria.interests) ? criteria.interests.join(',') : criteria.interests);
    if (criteria.strengths) params.append('strengths', Array.isArray(criteria.strengths) ? criteria.strengths.join(',') : criteria.strengths);
    if (criteria.preferred_stream) params.append('stream', criteria.preferred_stream);
    
    const queryString = params.toString();
    const url = queryString ? `/careers/match?${queryString}` : '/careers/match';
    return api.get(url);
  },
};

export default careerService;
