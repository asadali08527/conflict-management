import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { meetingService, MeetingListParams } from '@/services/panelist/meetingService';
import {
  CreateMeetingPayload,
  UpdateMeetingPayload,
  MeetingNotesPayload,
} from '@/types/panelist/meeting.types';
import { toast } from 'sonner';

export const usePanelistMeetings = (params: MeetingListParams = {}) => {
  const queryClient = useQueryClient();

  // Get meetings list
  const meetingsQuery = useQuery({
    queryKey: ['panelist-meetings', params],
    queryFn: () => meetingService.getMeetings(params),
  });

  // Create meeting mutation
  const createMeetingMutation = useMutation({
    mutationFn: (payload: CreateMeetingPayload) => meetingService.createMeeting(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['panelist-meetings'] });
      queryClient.invalidateQueries({ queryKey: ['panelist-dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['panelist-upcoming-meetings'] });
      toast.success('Meeting scheduled successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to schedule meeting');
    },
  });

  return {
    meetings: meetingsQuery.data?.data?.meetings || [],
    pagination: meetingsQuery.data?.data?.pagination,
    isLoading: meetingsQuery.isLoading,
    error: meetingsQuery.error,

    createMeeting: createMeetingMutation.mutate,
    isCreating: createMeetingMutation.isPending,

    refetch: meetingsQuery.refetch,
  };
};

export const usePanelistMeeting = (meetingId: string) => {
  const queryClient = useQueryClient();

  // Get meeting details
  const meetingQuery = useQuery({
    queryKey: ['panelist-meeting', meetingId],
    queryFn: () => meetingService.getMeetingById(meetingId),
    enabled: !!meetingId,
  });

  // Update meeting mutation
  const updateMeetingMutation = useMutation({
    mutationFn: (payload: UpdateMeetingPayload) =>
      meetingService.updateMeeting(meetingId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['panelist-meeting', meetingId] });
      queryClient.invalidateQueries({ queryKey: ['panelist-meetings'] });
      toast.success('Meeting updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update meeting');
    },
  });

  // Cancel meeting mutation
  const cancelMeetingMutation = useMutation({
    mutationFn: () => meetingService.cancelMeeting(meetingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['panelist-meeting', meetingId] });
      queryClient.invalidateQueries({ queryKey: ['panelist-meetings'] });
      queryClient.invalidateQueries({ queryKey: ['panelist-dashboard-stats'] });
      toast.success('Meeting cancelled successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to cancel meeting');
    },
  });

  // Add meeting notes mutation
  const addNotesMutation = useMutation({
    mutationFn: (payload: MeetingNotesPayload) =>
      meetingService.addMeetingNotes(meetingId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['panelist-meeting', meetingId] });
      queryClient.invalidateQueries({ queryKey: ['panelist-meetings'] });
      toast.success('Meeting notes added and marked as completed');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add notes');
    },
  });

  return {
    meeting: meetingQuery.data?.data,
    isLoading: meetingQuery.isLoading,
    error: meetingQuery.error,

    updateMeeting: updateMeetingMutation.mutate,
    isUpdating: updateMeetingMutation.isPending,

    cancelMeeting: cancelMeetingMutation.mutate,
    isCancelling: cancelMeetingMutation.isPending,

    addNotes: addNotesMutation.mutate,
    isAddingNotes: addNotesMutation.isPending,

    refetch: meetingQuery.refetch,
  };
};
