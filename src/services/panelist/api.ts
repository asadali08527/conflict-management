import axios, { AxiosInstance, AxiosError } from 'axios';

// API base URL - update this with your actual API URL
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('panelistAuthToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem('panelistAuthToken');
      localStorage.removeItem('panelistUser');
      localStorage.removeItem('panelistInfo');

      // Only redirect if not already on login page
      if (window.location.pathname !== '/panelist/login') {
        window.location.href = '/panelist/login';
      }
    }

    return Promise.reject(error);
  }
);

// API Response wrapper type
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

// Pagination type
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationResponse {
  current: number;
  pages: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default apiClient;
