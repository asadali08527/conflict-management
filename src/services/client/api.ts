/**
 * Client API Client
 * Axios client with authentication interceptors for client endpoints
 */

import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Create axios instance
export const clientApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor - attach auth token
clientApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle 401 errors (auto logout)
clientApiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_info');

      // Redirect to landing page if not already there
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * API Response wrapper type
 */
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

/**
 * Extract data from API response
 */
export const extractData = <T>(response: ApiResponse<T>): T => {
  if (response.status === 'error' || !response.data) {
    throw new Error(response.message || 'An error occurred');
  }
  return response.data;
};
