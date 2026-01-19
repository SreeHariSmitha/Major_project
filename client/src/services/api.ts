import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  validateStatus: () => true, // Don't throw on any status code
});

// Request interceptor to add authentication token
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  (response) => {
    // If status is 401 (Unauthorized), clear auth state and redirect to login
    if (response.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      // Redirect to login page
      window.location.href = '/login';
    }
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Auth API endpoints
// Auth API endpoints
export const authApi = {
  register: async (data: any) => {
    const response = await apiClient.post('/api/v1/auth/register', data);
    return response.data;
  },
  login: async (data: any) => {
    const response = await apiClient.post('/api/v1/auth/login', data);
    return response.data;
  },
  getProfile: async () => {
    const response = await apiClient.get('/api/v1/auth/profile');
    return response.data;
  },
  updateProfile: async (data: any) => {
    const response = await apiClient.put('/api/v1/auth/profile', data);
    return response.data;
  },
  refreshToken: async (refreshToken: string) => {
    const response = await apiClient.post('/api/v1/auth/refresh', { refreshToken });
    return response.data;
  },
};

// Ideas API endpoints - Story 3.1, 3.2, etc.
export const ideasApi = {
  createIdea: async (data: any) => {
    const response = await apiClient.post('/api/v1/ideas', data);
    return response.data;
  },
  listIdeas: async (params?: any) => {
    const response = await apiClient.get('/api/v1/ideas', { params });
    return response.data;
  },
  getIdea: async (id: string) => {
    const response = await apiClient.get(`/api/v1/ideas/${id}`);
    return response.data;
  },
  updateIdea: async (id: string, data: any) => {
    const response = await apiClient.put(`/api/v1/ideas/${id}`, data);
    return response.data;
  },
  deleteIdea: async (id: string) => {
    const response = await apiClient.delete(`/api/v1/ideas/${id}`);
    return response.data;
  },
  archiveIdea: async (id: string, archived: boolean) => {
    const response = await apiClient.patch(`/api/v1/ideas/${id}/archive`, { archived });
    return response.data;
  },
  searchIdeas: async (q: string) => {
    const response = await apiClient.get('/api/v1/ideas/search', { params: { q } });
    return response.data;
  },
  // Phase 1 API endpoints - Story 4.1-4.7
  generatePhase1: async (id: string) => {
    const response = await apiClient.post(`/api/v1/ideas/${id}/generate/phase1`);
    return response.data;
  },
  confirmPhase1: async (id: string) => {
    const response = await apiClient.post(`/api/v1/ideas/${id}/confirm/phase1`);
    return response.data;
  },
};

export default apiClient;
