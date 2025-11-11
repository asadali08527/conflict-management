/**
 * Client Meetings Hooks
 * TanStack Query hooks for meeting data
 */

import { useQuery } from '@tanstack/react-query';
import { meetingService } from '@/services/client/meetingService';
import { GetMeetingsParams } from '@/types/client/meeting.types';

/**
 * Hook to fetch all meetings with filters
 */
export const useClientMeetings = (params: GetMeetingsParams = {}) => {
  return useQuery({
    queryKey: ['client-meetings', params],
    queryFn: () => meetingService.getMeetings(params),
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });
};

/**
 * Hook to fetch a single meeting by ID
 */
export const useClientMeetingDetail = (meetingId: string) => {
  return useQuery({
    queryKey: ['client-meeting-detail', meetingId],
    queryFn: () => meetingService.getMeetingById(meetingId),
    enabled: !!meetingId,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });
};
