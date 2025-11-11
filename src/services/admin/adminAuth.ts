import { apiRequest, API_CONFIG } from '@/lib/api';
import { AdminLoginPayload, AdminRegisterPayload, AdminAuthResponse } from '@/types/admin.types';

export const adminAuthService = {
  register: async (payload: AdminRegisterPayload): Promise<AdminAuthResponse> => {
    const response = await apiRequest<AdminAuthResponse>(
      API_CONFIG.ENDPOINTS.ADMIN.AUTH.REGISTER,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    // Store admin token separately from regular user token
    if (response.data.token) {
      localStorage.setItem('admin_auth_token', response.data.token);
      localStorage.setItem('admin_user', JSON.stringify(response.data.user));
    }

    return response;
  },

  login: async (payload: AdminLoginPayload): Promise<AdminAuthResponse> => {
    const response = await apiRequest<AdminAuthResponse>(
      API_CONFIG.ENDPOINTS.ADMIN.AUTH.LOGIN,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    // Store admin token separately from regular user token
    if (response.data.token) {
      localStorage.setItem('admin_auth_token', response.data.token);
      localStorage.setItem('admin_user', JSON.stringify(response.data.user));
    }

    return response;
  },

  logout: () => {
    localStorage.removeItem('admin_auth_token');
    localStorage.removeItem('admin_user');
  },

  getStoredToken: (): string | null => {
    return localStorage.getItem('admin_auth_token');
  },

  getStoredUser: () => {
    const user = localStorage.getItem('admin_user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('admin_auth_token');
  },
};
