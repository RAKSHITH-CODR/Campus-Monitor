import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }
    throw error.response?.data || error;
  }
);

// Auth APIs
export const authAPI = {
  register: (name, email, password) => api.post('/api/auth/register', { name, email, password }),
  login: (email, password) => api.post('/api/auth/login', { email, password }),
};

// Rooms APIs
export const roomsAPI = {
  getAll: (page = 1, limit = 15) => api.get(`/api/rooms?page=${page}&limit=${limit}`),
  getById: (id) => api.get(`/api/rooms/${id}`),
  create: (data) => api.post('/api/rooms', data),
  update: (id, data) => api.patch(`/api/rooms/${id}`, data),
};

// Sensors APIs
export const sensorsAPI = {
  save: (data) => api.post('/api/sensors/save', data),
  getLive: (room) => api.get(`/api/sensors/live?room=${room}`),
  getHistory: (room, days = 7) => api.get(`/api/sensors/history?room=${room}&days=${days}`),
};

// Alerts APIs
export const alertsAPI = {
  getAll: (page = 1, limit = 15, filters = {}) => {
    const params = new URLSearchParams({ page, limit, ...filters });
    return api.get(`/api/alerts?${params}`);
  },
  getActive: (page = 1, limit = 15) => api.get(`/api/alerts/active?page=${page}&limit=${limit}`),
  resolve: (id) => api.patch(`/api/alerts/${id}/resolve`),
  export: (format = 'csv', filters = {}) => {
    const params = new URLSearchParams({ format, ...filters });
    return api.get(`/api/alerts/export?${params}`);
  },
};

// Analytics APIs
export const analyticsAPI = {
  getTemperature: (room) => api.get(`/api/analytics/temperature?room=${room}`),
  getEnergy: (room) => api.get(`/api/analytics/energy?room=${room}`),
  getAQI: (room) => api.get(`/api/analytics/aqi?room=${room}`),
  getStatistics: (room) => api.get(`/api/analytics/statistics?room=${room}`),
};

// AI APIs
export const aiAPI = {
  analyze: (room) => api.post('/api/ai/analyze', { room }),
};

// Settings APIs
export const settingsAPI = {
  getSettings: () => api.get('/api/settings'),
  updateSettings: (data) => api.patch('/api/settings', data),
  resetSettings: () => api.post('/api/settings/reset'),
};

// User Management APIs (Admin only)
export const userAPI = {
  getAll: (page = 1, limit = 15) => api.get(`/api/auth/users?page=${page}&limit=${limit}`),
  updateUserRole: (userId, role) => api.patch(`/api/auth/users/${userId}/role`, { role }),
  deleteUser: (userId) => api.delete(`/api/auth/users/${userId}`),
};

export { api };

export default api;
