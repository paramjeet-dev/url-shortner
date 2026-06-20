import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('pckd_user') || 'null');
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export const shortenUrl = (data) => api.post('/urls', data);
export const getAnalytics = (code) => api.get(`/urls/${code}/analytics`);
export const loginUser = (credentials) => api.post('/auth/login', credentials);
export const signupUser = (userData) => api.post('/auth/signup', userData);
export const getUserLinks = () => api.get('/urls'); // expects array of user's links
export const deleteLink = (code) => api.delete(`/urls/${code}`);
export const updateLinkTitle = (code, title) => api.put(`/urls/${code}/title`, { title });
export const extendLinkExpiry = (code, days) => api.post(`/urls/${code}/extend`, { days });

export default api;