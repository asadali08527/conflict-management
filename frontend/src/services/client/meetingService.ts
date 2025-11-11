/**
 * Client Meeting Service
 * Handles API calls for meeting management
 */

import { clientApiClient, ApiResponse, extractData } from './api';
import {
  MeetingsListResponse,
  MeetingDetailResponse,
  GetMeetingsParams,
} from '@/types/client/meeting.types';

/**
 * Get all meetings for the logged-in client
 * GET /api/client/meetings
 */
export const getMeetings = async (params: GetMeetingsParams = {}): Promise<MeetingsListResponse> => {
  const response = await clientApiClient.get<ApiResponse<MeetingsListResponse>>(
    '/api/client/meetings',
    { params }
  );
  return extractData(response.data);
};

/**
 * Get meeting by ID
 * GET /api/client/meetings/:meetingId
 */
export const getMeetingById = async (meetingId: string): Promise<MeetingDetailResponse> => {
  const response = await clientApiClient.get<ApiResponse<MeetingDetailResponse>>(
    `/api/client/meetings/${meetingId}`
  );
  return extractData(response.data);
};

// Export all services as a single object
export const meetingService = {
  getMeetings,
  getMeetingById,
};
