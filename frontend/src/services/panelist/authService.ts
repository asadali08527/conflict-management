import apiClient, { ApiResponse } from './api';
import { LoginPayload, LoginResponse } from '@/types/panelist/auth.types';

export const authService = {
  // Login
  login: async (payload: LoginPayload): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      '/api/panelist/auth/login',
      payload
    );
    return response.data;
  },

  // Get current user
  getCurrentUser: async (): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.get<ApiResponse<LoginResponse>>(
      '/api/panelist/auth/me'
    );
    return response.data;
  },

  // Change password
  changePassword: async (payload: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse> => {
    const response = await apiClient.patch<ApiResponse>(
      '/api/panelist/auth/change-password',
      payload
    );
    return response.data;
  },

  // Logout
  logout: async (): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/api/panelist/auth/logout');
    return response.data;
  },
};
