import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminCasesService } from '@/services/admin/adminCases';
import {
  GetCasesParams,
  UpdateCaseStatusPayload,
  AddNotePayload,
} from '@/types/admin.types';
import { toast } from 'sonner';

export const useAdminCases = (params: GetCasesParams = {}) => {
  return useQuery({
    queryKey: ['admin-cases', params],
    queryFn: () => adminCasesService.getCases(params),
    staleTime: 30000, // 30 seconds
  });
};

export const useCaseDetails = (caseId: string | null) => {
  return useQuery({
    queryKey: ['admin-case-details', caseId],
    queryFn: () => adminCasesService.getCaseDetails(caseId!),
    enabled: !!caseId,
    staleTime: 30000,
  });
};

export const useUpdateCaseStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      caseId,
      payload,
    }: {
      caseId: string;
      payload: UpdateCaseStatusPayload;
    }) => adminCasesService.updateCaseStatus(caseId, payload),
    onSuccess: (data, variables) => {
      toast.success('Case status updated successfully');
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['admin-cases'] });
      queryClient.invalidateQueries({ queryKey: ['admin-case-details', variables.caseId] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update case status: ${error.message}`);
    },
  });
};

export const useAddCaseNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      caseId,
      payload,
    }: {
      caseId: string;
      payload: AddNotePayload;
    }) => adminCasesService.addNote(caseId, payload),
    onSuccess: (data, variables) => {
      toast.success('Note added successfully');
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['admin-case-details', variables.caseId] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to add note: ${error.message}`);
    },
  });
};
