// frontend/src/api/api.js
import axios from 'axios';

// Force localhost for local development
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Debug: Log the base URL on module load
if (import.meta.env.DEV) {
  console.log('%c🔧 API Configuration', 'color: #4CAF50; font-weight: bold; font-size: 14px;');
  console.log('Base URL:', baseURL);
  console.log('Environment:', import.meta.env.MODE);
}

const api = axios.create({
  baseURL: baseURL
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
