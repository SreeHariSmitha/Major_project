import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  validateStatus: () => true, // Don't throw on any status code
});

// Add interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authApi = {
  register: async (data) => {
    const response = await apiClient.post('/api/v1/auth/register', data);
    return response.data;
  },
};

export default apiClient;
