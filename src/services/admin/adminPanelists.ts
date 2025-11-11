import { apiRequest, API_CONFIG } from '@/lib/api';
import {
  GetPanelistsParams,
  GetPanelistsResponse,
  GetPanelistResponse,
  GetAvailablePanelistsParams,
  GetAvailablePanelistsResponse,
  CreatePanelistPayload,
  CreatePanelistResponse,
  UpdatePanelistPayload,
  UpdatePanelistResponse,
  DeactivatePanelistResponse,
  GetPanelistCasesParams,
  GetPanelistCasesResponse,
  AssignPanelPayload,
  AssignPanelResponse,
  RemovePanelistResponse,
  GetPanelStatisticsResponse,
  CreatePanelistAccountPayload,
  CreatePanelistAccountResponse,
  ResetPanelistPasswordPayload,
  ResetPanelistPasswordResponse,
  GetPanelistPerformanceResponse,
} from '@/types/panelist.types';

// Helper to get admin auth headers
const getAdminAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('admin_auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const adminPanelistsService = {
  /**
   * Get all panelists with pagination, filtering, and search
   */
  getPanelists: async (params: GetPanelistsParams = {}): Promise<GetPanelistsResponse> => {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.specialization) queryParams.append('specialization', params.specialization);
    if (params.availability) queryParams.append('availability', params.availability);
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params.search) queryParams.append('search', params.search);

    const endpoint = `${API_CONFIG.ENDPOINTS.ADMIN.PANELISTS.LIST}?${queryParams.toString()}`;

    return apiRequest<GetPanelistsResponse>(endpoint, {
      method: 'GET',
      headers: getAdminAuthHeaders(),
    });
  },

  /**
   * Get available panelists (optionally filtered by case type)
   */
  getAvailablePanelists: async (
    params: GetAvailablePanelistsParams = {}
  ): Promise<GetAvailablePanelistsResponse> => {
    const queryParams = new URLSearchParams();
    if (params.caseType) queryParams.append('caseType', params.caseType);

    const endpoint = `${API_CONFIG.ENDPOINTS.ADMIN.PANELISTS.AVAILABLE}?${queryParams.toString()}`;

    return apiRequest<GetAvailablePanelistsResponse>(endpoint, {
      method: 'GET',
      headers: getAdminAuthHeaders(),
    });
  },

  /**
   * Get panelist by ID with details
   */
  getPanelistById: async (panelistId: string): Promise<GetPanelistResponse> => {
    return apiRequest<GetPanelistResponse>(
      API_CONFIG.ENDPOINTS.ADMIN.PANELISTS.GET(panelistId),
      {
        method: 'GET',
        headers: getAdminAuthHeaders(),
      }
    );
  },

  /**
   * Create a new panelist
   */
  createPanelist: async (payload: CreatePanelistPayload): Promise<CreatePanelistResponse> => {
    return apiRequest<CreatePanelistResponse>(
      API_CONFIG.ENDPOINTS.ADMIN.PANELISTS.CREATE,
      {
        method: 'POST',
        headers: getAdminAuthHeaders(),
        body: JSON.stringify(payload),
      }
    );
  },

  /**
   * Update panelist information
   */
  updatePanelist: async (
    panelistId: string,
    payload: UpdatePanelistPayload
  ): Promise<UpdatePanelistResponse> => {
    return apiRequest<UpdatePanelistResponse>(
      API_CONFIG.ENDPOINTS.ADMIN.PANELISTS.UPDATE(panelistId),
      {
        method: 'PATCH',
        headers: getAdminAuthHeaders(),
        body: JSON.stringify(payload),
      }
    );
  },

  /**
   * Deactivate a panelist
   */
  deactivatePanelist: async (panelistId: string): Promise<DeactivatePanelistResponse> => {
    return apiRequest<DeactivatePanelistResponse>(
      API_CONFIG.ENDPOINTS.ADMIN.PANELISTS.DEACTIVATE(panelistId),
      {
        method: 'DELETE',
        headers: getAdminAuthHeaders(),
      }
    );
  },

  /**
   * Get cases for a specific panelist
   */
  getPanelistCases: async (
    panelistId: string,
    params: GetPanelistCasesParams = {}
  ): Promise<GetPanelistCasesResponse> => {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.status) queryParams.append('status', params.status);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const endpoint = `${API_CONFIG.ENDPOINTS.ADMIN.PANELISTS.GET_CASES(panelistId)}?${queryParams.toString()}`;

    return apiRequest<GetPanelistCasesResponse>(endpoint, {
      method: 'GET',
      headers: getAdminAuthHeaders(),
    });
  },

  /**
   * Assign panel to a case
   */
  assignPanelToCase: async (
    caseId: string,
    payload: AssignPanelPayload
  ): Promise<AssignPanelResponse> => {
    return apiRequest<AssignPanelResponse>(
      API_CONFIG.ENDPOINTS.ADMIN.PANELISTS.ASSIGN_PANEL(caseId),
      {
        method: 'POST',
        headers: getAdminAuthHeaders(),
        body: JSON.stringify(payload),
      }
    );
  },

  /**
   * Remove panelist from a case
   */
  removePanelistFromCase: async (
    caseId: string,
    panelistId: string
  ): Promise<RemovePanelistResponse> => {
    return apiRequest<RemovePanelistResponse>(
      API_CONFIG.ENDPOINTS.ADMIN.PANELISTS.REMOVE_PANELIST(caseId, panelistId),
      {
        method: 'DELETE',
        headers: getAdminAuthHeaders(),
      }
    );
  },

  /**
   * Get panelist statistics
   */
  getPanelistStatistics: async (): Promise<GetPanelStatisticsResponse> => {
    return apiRequest<GetPanelStatisticsResponse>(
      API_CONFIG.ENDPOINTS.ADMIN.PANELISTS.STATISTICS,
      {
        method: 'GET',
        headers: getAdminAuthHeaders(),
      }
    );
  },

  /**
   * Get panel statistics (dashboard)
   */
  getPanelStatistics: async (): Promise<GetPanelStatisticsResponse> => {
    return apiRequest<GetPanelStatisticsResponse>(
      API_CONFIG.ENDPOINTS.ADMIN.PANEL.STATISTICS,
      {
        method: 'GET',
        headers: getAdminAuthHeaders(),
      }
    );
  },

  /**
   * Create panelist account
   */
  createPanelistAccount: async (
    panelistId: string,
    payload: CreatePanelistAccountPayload
  ): Promise<CreatePanelistAccountResponse> => {
    return apiRequest<CreatePanelistAccountResponse>(
      API_CONFIG.ENDPOINTS.ADMIN.PANELISTS.CREATE_ACCOUNT(panelistId),
      {
        method: 'POST',
        headers: getAdminAuthHeaders(),
        body: JSON.stringify(payload),
      }
    );
  },

  /**
   * Reset panelist password
   */
  resetPanelistPassword: async (
    panelistId: string,
    payload: ResetPanelistPasswordPayload
  ): Promise<ResetPanelistPasswordResponse> => {
    return apiRequest<ResetPanelistPasswordResponse>(
      API_CONFIG.ENDPOINTS.ADMIN.PANELISTS.RESET_PASSWORD(panelistId),
      {
        method: 'POST',
        headers: getAdminAuthHeaders(),
        body: JSON.stringify(payload),
      }
    );
  },

  /**
   * Get panelist performance metrics
   */
  getPanelistPerformance: async (
    panelistId: string
  ): Promise<GetPanelistPerformanceResponse> => {
    return apiRequest<GetPanelistPerformanceResponse>(
      API_CONFIG.ENDPOINTS.ADMIN.PANELISTS.PERFORMANCE(panelistId),
      {
        method: 'GET',
        headers: getAdminAuthHeaders(),
      }
    );
  },
};
