import api from './api';

// Register new user
export const register = (userData) => api.post('/auth/register', userData);

// Login user
export const login = (credentials) => api.post('/auth/login', credentials);

// Google OAuth login/register
export const googleAuth = (credential) => api.post('/auth/google', { credential });



