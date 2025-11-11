import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminMeetingsService } from '@/services/admin/adminMeetings';
import {
  ScheduleMeetingPayload,
  UpdateMeetingPayload,
} from '@/types/admin.types';
import { toast } from 'sonner';

export const useScheduleMeeting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ScheduleMeetingPayload) =>
      adminMeetingsService.scheduleMeeting(payload),
    onSuccess: (data) => {
      toast.success('Meeting scheduled successfully');
      // Invalidate case details to show the new meeting
      if (data.data.meeting.case?._id) {
        queryClient.invalidateQueries({
          queryKey: ['admin-case-details', data.data.meeting.case._id],
        });
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to schedule meeting: ${error.message}`);
    },
  });
};

export const useUpdateMeeting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      meetingId,
      payload,
    }: {
      meetingId: string;
      payload: UpdateMeetingPayload;
    }) => adminMeetingsService.updateMeeting(meetingId, payload),
    onSuccess: (data) => {
      toast.success('Meeting updated successfully');
      // Invalidate case details to show the updated meeting
      if (data.data.meeting.case?._id) {
        queryClient.invalidateQueries({
          queryKey: ['admin-case-details', data.data.meeting.case._id],
        });
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to update meeting: ${error.message}`);
    },
  });
};
