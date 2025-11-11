import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resolutionService } from '@/services/panelist/resolutionService';
import {
  SubmitResolutionPayload,
  UpdateResolutionPayload,
} from '@/types/panelist/resolution.types';
import { toast } from 'sonner';

export const usePanelistResolution = (caseId: string) => {
  const queryClient = useQueryClient();

  // Get resolution status
  const resolutionStatusQuery = useQuery({
    queryKey: ['panelist-resolution-status', caseId],
    queryFn: () => resolutionService.getResolutionStatus(caseId),
    enabled: !!caseId,
  });

  // Submit resolution mutation
  const submitResolutionMutation = useMutation({
    mutationFn: (payload: SubmitResolutionPayload) =>
      resolutionService.submitResolution(caseId, payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['panelist-resolution-status', caseId] });
      queryClient.invalidateQueries({ queryKey: ['panelist-case', caseId] });
      queryClient.invalidateQueries({ queryKey: ['panelist-dashboard-stats'] });

      if (response.data?.resolutionComplete) {
        toast.success('Resolution submitted! All panelists have submitted their resolutions.');
      } else {
        toast.success(
          `Resolution submitted successfully! ${response.data?.progress.submitted}/${response.data?.progress.total} panelists have submitted.`
        );
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit resolution');
    },
  });

  // Update draft mutation
  const updateDraftMutation = useMutation({
    mutationFn: (payload: UpdateResolutionPayload) =>
      resolutionService.updateDraft(caseId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['panelist-resolution-status', caseId] });
      toast.success('Draft saved successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to save draft');
    },
  });

  return {
    myResolution: resolutionStatusQuery.data?.data?.myResolution,
    allResolutions: resolutionStatusQuery.data?.data?.allResolutions || [],
    progress: resolutionStatusQuery.data?.data?.progress,
    isLoading: resolutionStatusQuery.isLoading,
    error: resolutionStatusQuery.error,

    submitResolution: submitResolutionMutation.mutate,
    isSubmitting: submitResolutionMutation.isPending,

    updateDraft: updateDraftMutation.mutate,
    isUpdatingDraft: updateDraftMutation.isPending,

    refetch: resolutionStatusQuery.refetch,
  };
};
