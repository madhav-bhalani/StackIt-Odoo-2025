import axios from 'axios';
import { 
  transformQuestionForAPI, 
  transformQuestionFromAPI,
  transformAnswerForAPI,
  transformAnswerFromAPI,
  transformVoteType,
  extractAPIData
} from '../utils/dataTransformers';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Simple cache for GET requests to prevent duplicate calls
const requestCache = new Map();
const CACHE_DURATION = 30000; // 30 seconds

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to create cache key
const createCacheKey = (method, url, params) => {
  return `${method}:${url}:${JSON.stringify(params || {})}`;
};

// Helper function to check cache
const getCachedResponse = (cacheKey) => {
  const cached = requestCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

// Helper function to set cache
const setCachedResponse = (cacheKey, data) => {
  requestCache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
};

// Helper function to clear cache
const clearCache = (pattern) => {
  if (pattern) {
    // Clear specific cache entries matching pattern
    for (const [key] of requestCache) {
      if (key.includes(pattern)) {
        requestCache.delete(key);
      }
    }
  } else {
    // Clear all cache
    requestCache.clear();
  }
};

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
      // Don't redirect if this is the getCurrentUser call (auth check)
      // Let the UserContext handle this case
      const isAuthCheck = error.config?.url?.includes('/auth/me');
      
      if (!isAuthCheck) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
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
  getAll: async (params) => {
    const cacheKey = createCacheKey('GET', '/questions', params);
    const cached = getCachedResponse(cacheKey);
    
    if (cached) {
      console.log('📦 Using cached questions data');
      return cached;
    }
    
    const response = await api.get('/questions', { params });
    const data = extractAPIData(response);
    
    // Transform questions if they exist
    if (data.questions && Array.isArray(data.questions)) {
      data.questions = data.questions.map(transformQuestionFromAPI);
    }
    
    const transformedResponse = { ...response, data };
    setCachedResponse(cacheKey, transformedResponse);
    return transformedResponse;
  },
  
  getById: async (id) => {
    const response = await api.get(`/questions/${id}`);
    const data = extractAPIData(response);
    
    // Transform single question
    const transformedQuestion = transformQuestionFromAPI(data);
    
    return { ...response, data: transformedQuestion };
  },
  
  create: async (questionData) => {
    const transformedData = transformQuestionForAPI(questionData);
    const response = await api.post('/questions', transformedData);
    const data = extractAPIData(response);
    
    // Transform created question
    const transformedQuestion = transformQuestionFromAPI(data);
    
    return { ...response, data: transformedQuestion };
  },
  
  update: async (id, questionData) => {
    const transformedData = transformQuestionForAPI(questionData);
    const response = await api.put(`/questions/${id}`, transformedData);
    const data = extractAPIData(response);
    
    // Transform updated question
    const transformedQuestion = transformQuestionFromAPI(data);
    
    return { ...response, data: transformedQuestion };
  },
  
  delete: (id) => api.delete(`/questions/${id}`),
  
  vote: (id, voteType) => {
    const transformedVoteType = transformVoteType(voteType);
    return api.post(`/questions/${id}/vote`, { voteType: transformedVoteType });
  },
};

// Answers API
export const answersAPI = {
  create: async (answerData) => {
    const transformedData = transformAnswerForAPI(answerData);
    const response = await api.post('/answers', transformedData);
    const data = extractAPIData(response);
    
    // Transform created answer
    const transformedAnswer = transformAnswerFromAPI(data);
    
    return { ...response, data: transformedAnswer };
  },
  
  getByQuestionId: async (questionId) => {
    const response = await api.get(`/answers/question/${questionId}`);
    const data = extractAPIData(response);
    
    // Transform answers if they exist
    if (Array.isArray(data)) {
      const transformedAnswers = data.map(transformAnswerFromAPI);
      return { ...response, data: transformedAnswers };
    }
    
    return { ...response, data: data || [] };
  },
  
  update: async (id, answerData) => {
    const transformedData = transformAnswerForAPI(answerData);
    const response = await api.put(`/answers/${id}`, transformedData);
    const data = extractAPIData(response);
    
    // Transform updated answer
    const transformedAnswer = transformAnswerFromAPI(data);
    
    return { ...response, data: transformedAnswer };
  },
  
  delete: (id) => api.delete(`/answers/${id}`),
  
  vote: (id, voteType) => {
    const transformedVoteType = transformVoteType(voteType);
    return api.post(`/answers/${id}/vote`, { voteType: transformedVoteType });
  },
  
  // Note: Accept functionality needs to be implemented in backend
  accept: (id) => api.post(`/answers/${id}/accept`),
};

// Tags API
export const tagsAPI = {
  getAll: () => api.get('/tags'),
  getPopular: () => api.get('/tags/popular'),
};

// AI API
export const aiAPI = {
  generateAnswer: (questionId) => api.post(`/ai/questions/${questionId}/answer`),
  autoGenerateTags: (questionContent) => api.post('/ai/questions/auto-tags', { content: questionContent }),
  summarizeContent: (content) => api.post('/ai/content/summarize', { content }),
};

// Notifications API
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
};

export default api; 