import { apiRequest, API_CONFIG } from '@/lib/api';
import { RegisterPayload, LoginPayload, AuthResponse } from '@/types/auth';

export const authService = {
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>(API_CONFIG.ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  },

  googleLogin: async (idToken: string): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>(API_CONFIG.ENDPOINTS.AUTH.GOOGLE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),
    });
  },
};