import axios from 'axios';
import { logout } from '../redux/slices/authSlice';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Automatically inject JWT headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle expired sessions and auth rejections
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Dispatch logout in Redux dynamically to prevent circular dependencies
      import('../redux/store').then(({ store }) => {
        store.dispatch(logout());
      }).catch(err => {
        console.error('Redux store import failed in interceptor:', err);
      });

      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.replace('/login');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
