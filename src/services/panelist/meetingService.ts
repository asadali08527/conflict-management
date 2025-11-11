import apiClient, { ApiResponse, PaginationParams, PaginationResponse } from './api';
import {
  Meeting,
  CreateMeetingPayload,
  UpdateMeetingPayload,
  MeetingNotesPayload,
} from '@/types/panelist/meeting.types';

export interface MeetingListParams extends PaginationParams {
  status?: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  caseId?: string;
  upcoming?: boolean;
  past?: boolean;
}

export const meetingService = {
  // Create new meeting
  createMeeting: async (
    payload: CreateMeetingPayload
  ): Promise<ApiResponse<Meeting>> => {
    const response = await apiClient.post<ApiResponse<Meeting>>(
      '/api/panelist/meetings',
      payload
    );
    return response.data;
  },

  // Get list of meetings
  getMeetings: async (
    params: MeetingListParams = {}
  ): Promise<
    ApiResponse<{ meetings: Meeting[]; pagination: PaginationResponse }>
  > => {
    const response = await apiClient.get<
      ApiResponse<{ meetings: Meeting[]; pagination: PaginationResponse }>
    >('/api/panelist/meetings', { params });
    return response.data;
  },

  // Get meeting by ID
  getMeetingById: async (meetingId: string): Promise<ApiResponse<Meeting>> => {
    const response = await apiClient.get<ApiResponse<Meeting>>(
      `/api/panelist/meetings/${meetingId}`
    );
    return response.data;
  },

  // Update meeting
  updateMeeting: async (
    meetingId: string,
    payload: UpdateMeetingPayload
  ): Promise<ApiResponse<Meeting>> => {
    const response = await apiClient.patch<ApiResponse<Meeting>>(
      `/api/panelist/meetings/${meetingId}`,
      payload
    );
    return response.data;
  },

  // Cancel meeting
  cancelMeeting: async (meetingId: string): Promise<ApiResponse> => {
    const response = await apiClient.delete<ApiResponse>(
      `/api/panelist/meetings/${meetingId}`
    );
    return response.data;
  },

  // Add meeting notes
  addMeetingNotes: async (
    meetingId: string,
    payload: MeetingNotesPayload
  ): Promise<ApiResponse<Meeting>> => {
    const response = await apiClient.post<ApiResponse<Meeting>>(
      `/api/panelist/meetings/${meetingId}/notes`,
      payload
    );
    return response.data;
  },
};
