import { apiRequest, API_CONFIG, getApiUrl } from '@/lib/api';
import {
  GetCasesParams,
  GetCasesResponse,
  DetailedCaseResponse,
  UpdateCaseStatusPayload,
  UpdateCaseStatusResponse,
  AddNotePayload,
  AddNoteResponse,
  AssignCasePayload,
  AssignCaseResponse,
  UpdatePriorityPayload,
  UpdatePriorityResponse,
  CaseFilesResponse,
  DashboardStatsResponse,
  StatisticsByAdminResponse,
} from '@/types/admin.types';

// Helper to get admin auth headers
const getAdminAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('admin_auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const adminCasesService = {
  /**
   * Get dashboard statistics
   */
  getDashboardStats: async (): Promise<DashboardStatsResponse> => {
    return apiRequest<DashboardStatsResponse>(
      API_CONFIG.ENDPOINTS.ADMIN.DASHBOARD.STATS,
      {
        method: 'GET',
        headers: getAdminAuthHeaders(),
      }
    );
  },

  /**
   * Get statistics by admin
   */
  getStatisticsByAdmin: async (): Promise<StatisticsByAdminResponse> => {
    return apiRequest<StatisticsByAdminResponse>(
      API_CONFIG.ENDPOINTS.ADMIN.STATISTICS.BY_ADMIN,
      {
        method: 'GET',
        headers: getAdminAuthHeaders(),
      }
    );
  },

  /**
   * Get all cases with pagination, filtering, and search
   */
  getCases: async (params: GetCasesParams = {}): Promise<GetCasesResponse> => {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.status) queryParams.append('status', params.status);
    if (params.type) queryParams.append('type', params.type);
    if (params.priority) queryParams.append('priority', params.priority);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params.search) queryParams.append('search', params.search);

    const endpoint = `${API_CONFIG.ENDPOINTS.ADMIN.CASES.LIST}?${queryParams.toString()}`;

    return apiRequest<GetCasesResponse>(endpoint, {
      method: 'GET',
      headers: getAdminAuthHeaders(),
    });
  },

  /**
   * Get my assigned cases
   */
  getMyAssignments: async (params: GetCasesParams = {}): Promise<GetCasesResponse> => {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.status) queryParams.append('status', params.status);
    if (params.type) queryParams.append('type', params.type);
    if (params.priority) queryParams.append('priority', params.priority);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const endpoint = `${API_CONFIG.ENDPOINTS.ADMIN.CASES.MY_ASSIGNMENTS}?${queryParams.toString()}`;

    return apiRequest<GetCasesResponse>(endpoint, {
      method: 'GET',
      headers: getAdminAuthHeaders(),
    });
  },

  /**
   * Get detailed case information including both parties' submissions
   */
  getCaseDetails: async (caseId: string): Promise<DetailedCaseResponse> => {
    const endpoint = API_CONFIG.ENDPOINTS.ADMIN.CASES.DETAILED(caseId);
    const token = localStorage.getItem('admin_auth_token');

    const response = await fetch(getApiUrl(endpoint), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      cache: 'no-store', // Force fresh data, no caching
      redirect: 'follow',
    });

    console.log(`getCaseDetails: Status ${response.status}`, response);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch case details: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('getCaseDetails: Response data', data);
    return data;
  },

  /**
   * Get all files for a case
   */
  getCaseFiles: async (caseId: string): Promise<CaseFilesResponse> => {
    return apiRequest<CaseFilesResponse>(
      API_CONFIG.ENDPOINTS.ADMIN.CASES.FILES(caseId),
      {
        method: 'GET',
        headers: getAdminAuthHeaders(),
      }
    );
  },

  /**
   * Update case status with optional resolution details, feedback, and next steps
   */
  updateCaseStatus: async (
    caseId: string,
    payload: UpdateCaseStatusPayload
  ): Promise<UpdateCaseStatusResponse> => {
    return apiRequest<UpdateCaseStatusResponse>(
      API_CONFIG.ENDPOINTS.ADMIN.CASES.UPDATE_STATUS(caseId),
      {
        method: 'PATCH',
        headers: getAdminAuthHeaders(),
        body: JSON.stringify(payload),
      }
    );
  },

  /**
   * Assign case to an admin
   */
  assignCase: async (
    caseId: string,
    payload: AssignCasePayload
  ): Promise<AssignCaseResponse> => {
    return apiRequest<AssignCaseResponse>(
      API_CONFIG.ENDPOINTS.ADMIN.CASES.ASSIGN(caseId),
      {
        method: 'PATCH',
        headers: getAdminAuthHeaders(),
        body: JSON.stringify(payload),
      }
    );
  },

  /**
   * Unassign case
   */
  unassignCase: async (caseId: string): Promise<AssignCaseResponse> => {
    return apiRequest<AssignCaseResponse>(
      API_CONFIG.ENDPOINTS.ADMIN.CASES.UNASSIGN(caseId),
      {
        method: 'PATCH',
        headers: getAdminAuthHeaders(),
      }
    );
  },

  /**
   * Update case priority
   */
  updateCasePriority: async (
    caseId: string,
    payload: UpdatePriorityPayload
  ): Promise<UpdatePriorityResponse> => {
    return apiRequest<UpdatePriorityResponse>(
      API_CONFIG.ENDPOINTS.ADMIN.CASES.UPDATE_PRIORITY(caseId),
      {
        method: 'PATCH',
        headers: getAdminAuthHeaders(),
        body: JSON.stringify(payload),
      }
    );
  },

  /**
   * Add a note to a case
   */
  addNote: async (
    caseId: string,
    payload: AddNotePayload
  ): Promise<AddNoteResponse> => {
    return apiRequest<AddNoteResponse>(
      API_CONFIG.ENDPOINTS.ADMIN.CASES.ADD_NOTE(caseId),
      {
        method: 'POST',
        headers: getAdminAuthHeaders(),
        body: JSON.stringify(payload),
      }
    );
  },
};
