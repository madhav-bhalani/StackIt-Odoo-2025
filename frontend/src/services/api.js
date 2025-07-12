import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
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

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (data) => api.put('/auth/change-password', data),
  logout: () => api.post('/auth/logout'),
};

// Questions API
export const questionsAPI = {
  getAll: (params) => api.get('/questions', { params }),
  getById: (id) => api.get(`/questions/${id}`),
  create: (questionData) => api.post('/questions', questionData),
  update: (id, questionData) => api.put(`/questions/${id}`, questionData),
  delete: (id) => api.delete(`/questions/${id}`),
  vote: (id, voteType) => api.post(`/questions/${id}/vote`, { voteType }),
};

// Answers API
export const answersAPI = {
  create: (questionId, answerData) => api.post(`/questions/${questionId}/answers`, answerData),
  update: (id, answerData) => api.put(`/answers/${id}`, answerData),
  delete: (id) => api.delete(`/answers/${id}`),
  vote: (id, voteType) => api.post(`/answers/${id}/vote`, { voteType }),
  accept: (id) => api.post(`/answers/${id}/accept`),
};

// Tags API
export const tagsAPI = {
  getAll: () => api.get('/tags'),
  getPopular: () => api.get('/tags/popular'),
};

// AI API
export const aiAPI = {
  generateAnswer: (questionId) => api.post(`/ai/generate-answer/${questionId}`),
  suggestTags: (questionContent) => api.post('/ai/suggest-tags', { content: questionContent }),
  summarize: (content) => api.post('/ai/summarize', { content }),
};

// Notifications API
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
};

export default api; 