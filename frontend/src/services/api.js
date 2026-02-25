import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Attach JWT token to every request if present
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// Assignments
export const getAssignments = () => API.get('/assignments');
export const getAssignment = (id) => API.get(`/assignments/${id}`);

// Query execution
export const executeQuery = (data) => API.post('/query/execute', data);
export const getUserAttempts = (assignmentId) => API.get(`/query/attempts/${assignmentId}`);

// Hints
export const getHint = (data) => API.post('/hints', data);

export default API;
