import api from './api';

export const authService = {
  register: (data) => {
    console.log('📤 POST /auth/register', { email: data.email });
    return api.post('/auth/register', data);
  },
  login: (data) => {
    console.log('📤 POST /auth/login', { email: data.email });
    
    const formData = new URLSearchParams();
    formData.append('username', data.email);
    formData.append('password', data.password);

    return api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
  },
  refreshToken: (refreshToken) => {
    console.log('📤 POST /auth/refresh');
    return api.post('/auth/refresh', { refresh_token: refreshToken });
  },
  logout: () => {
    console.log('📤 POST /auth/logout');
    return api.post('/auth/logout');
  },
  getMe: () => {
    console.log('📤 GET /auth/me');
    return api.get('/auth/me');
  },
};

export default authService;
