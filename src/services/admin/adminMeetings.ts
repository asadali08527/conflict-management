import { apiRequest, API_CONFIG } from '@/lib/api';
import {
  ScheduleMeetingPayload,
  ScheduleMeetingResponse,
  UpdateMeetingPayload,
  UpdateMeetingResponse,
  GetMeetingsParams,
  GetMeetingsResponse,
  GetMeetingResponse,
  CancelMeetingPayload,
  CancelMeetingResponse,
} from '@/types/admin.types';

// Helper to get admin auth headers
const getAdminAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('admin_auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const adminMeetingsService = {
  /**
   * Get all meetings with pagination and filtering
   */
  getMeetings: async (params: GetMeetingsParams = {}): Promise<GetMeetingsResponse> => {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.status) queryParams.append('status', params.status);
    if (params.meetingType) queryParams.append('meetingType', params.meetingType);
    if (params.caseId) queryParams.append('caseId', params.caseId);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const endpoint = `${API_CONFIG.ENDPOINTS.ADMIN.MEETINGS.LIST}?${queryParams.toString()}`;

    return apiRequest<GetMeetingsResponse>(endpoint, {
      method: 'GET',
      headers: getAdminAuthHeaders(),
    });
  },

  /**
   * Get a specific meeting by ID
   */
  getMeeting: async (meetingId: string): Promise<GetMeetingResponse> => {
    return apiRequest<GetMeetingResponse>(
      API_CONFIG.ENDPOINTS.ADMIN.MEETINGS.GET(meetingId),
      {
        method: 'GET',
        headers: getAdminAuthHeaders(),
      }
    );
  },

  /**
   * Get all meetings for a specific case
   */
  getCaseMeetings: async (caseId: string): Promise<GetMeetingsResponse> => {
    return apiRequest<GetMeetingsResponse>(
      API_CONFIG.ENDPOINTS.ADMIN.CASES.MEETINGS(caseId),
      {
        method: 'GET',
        headers: getAdminAuthHeaders(),
      }
    );
  },

  /**
   * Schedule a new meeting for a case
   */
  scheduleMeeting: async (
    payload: ScheduleMeetingPayload
  ): Promise<ScheduleMeetingResponse> => {
    return apiRequest<ScheduleMeetingResponse>(
      API_CONFIG.ENDPOINTS.ADMIN.MEETINGS.CREATE,
      {
        method: 'POST',
        headers: getAdminAuthHeaders(),
        body: JSON.stringify(payload),
      }
    );
  },

  /**
   * Update an existing meeting
   */
  updateMeeting: async (
    meetingId: string,
    payload: UpdateMeetingPayload
  ): Promise<UpdateMeetingResponse> => {
    return apiRequest<UpdateMeetingResponse>(
      API_CONFIG.ENDPOINTS.ADMIN.MEETINGS.UPDATE(meetingId),
      {
        method: 'PATCH',
        headers: getAdminAuthHeaders(),
        body: JSON.stringify(payload),
      }
    );
  },

  /**
   * Cancel a meeting
   */
  cancelMeeting: async (
    meetingId: string,
    payload?: CancelMeetingPayload
  ): Promise<CancelMeetingResponse> => {
    return apiRequest<CancelMeetingResponse>(
      API_CONFIG.ENDPOINTS.ADMIN.MEETINGS.CANCEL(meetingId),
      {
        method: 'PATCH',
        headers: getAdminAuthHeaders(),
        body: JSON.stringify(payload || {}),
      }
    );
  },
};
