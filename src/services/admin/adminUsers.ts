import { apiRequest, API_CONFIG } from '@/lib/api';
import {
  GetUsersParams,
  GetUsersResponse,
  GetAdminsResponse,
  ToggleUserStatusResponse,
} from '@/types/admin.types';

// Helper to get admin auth headers
const getAdminAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('admin_auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const adminUsersService = {
  /**
   * Get all users with pagination and filtering
   */
  getUsers: async (params: GetUsersParams = {}): Promise<GetUsersResponse> => {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.role) queryParams.append('role', params.role);
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params.search) queryParams.append('search', params.search);

    const endpoint = `${API_CONFIG.ENDPOINTS.ADMIN.USERS.LIST}?${queryParams.toString()}`;

    return apiRequest<GetUsersResponse>(endpoint, {
      method: 'GET',
      headers: getAdminAuthHeaders(),
    });
  },

  /**
   * Get all admin users with case statistics
   */
  getAdmins: async (): Promise<GetAdminsResponse> => {
    return apiRequest<GetAdminsResponse>(
      API_CONFIG.ENDPOINTS.ADMIN.USERS.ADMINS,
      {
        method: 'GET',
        headers: getAdminAuthHeaders(),
      }
    );
  },

  /**
   * Toggle user active status
   */
  toggleUserStatus: async (userId: string): Promise<ToggleUserStatusResponse> => {
    return apiRequest<ToggleUserStatusResponse>(
      API_CONFIG.ENDPOINTS.ADMIN.USERS.TOGGLE_STATUS(userId),
      {
        method: 'PATCH',
        headers: getAdminAuthHeaders(),
      }
    );
  },
};
