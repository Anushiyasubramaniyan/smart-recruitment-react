import axios from 'axios';

// Vite exposes env vars prefixed with VITE_ via import.meta.env
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sra_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalize error responses so components can just read err.message
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong.';
    return Promise.reject(new Error(message));
  }
);

export default api;
