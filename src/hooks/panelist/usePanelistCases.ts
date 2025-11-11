import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { caseService, CaseListParams } from '@/services/panelist/caseService';
import { CreateNotePayload, CreateDocumentPayload } from '@/types/panelist/case.types';
import { toast } from 'sonner';

export const usePanelistCases = (params: CaseListParams = {}) => {
  const queryClient = useQueryClient();

  // Get cases list
  const casesQuery = useQuery({
    queryKey: ['panelist-cases', params],
    queryFn: () => caseService.getCases(params),
  });

  return {
    cases: casesQuery.data?.data?.cases || [],
    pagination: casesQuery.data?.data?.pagination,
    isLoading: casesQuery.isLoading,
    error: casesQuery.error,
    refetch: casesQuery.refetch,
  };
};

export const usePanelistCase = (caseId: string) => {
  const queryClient = useQueryClient();

  // Get case details
  const caseQuery = useQuery({
    queryKey: ['panelist-case', caseId],
    queryFn: () => caseService.getCaseById(caseId),
    enabled: !!caseId,
  });

  // Get case parties
  const partiesQuery = useQuery({
    queryKey: ['panelist-case-parties', caseId],
    queryFn: () => caseService.getCaseParties(caseId),
    enabled: !!caseId,
  });

  // Get case documents
  const documentsQuery = useQuery({
    queryKey: ['panelist-case-documents', caseId],
    queryFn: () => caseService.getCaseDocuments(caseId),
    enabled: !!caseId,
  });

  // Get case timeline
  const timelineQuery = useQuery({
    queryKey: ['panelist-case-timeline', caseId],
    queryFn: () => caseService.getTimeline(caseId, { limit: 50 }),
    enabled: !!caseId,
  });

  // Add note mutation
  const addNoteMutation = useMutation({
    mutationFn: (payload: CreateNotePayload) => caseService.addNote(caseId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['panelist-case-timeline', caseId] });
      toast.success('Note added successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add note');
    },
  });

  // Upload document mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: (payload: CreateDocumentPayload) =>
      caseService.uploadDocument(caseId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['panelist-case-documents', caseId] });
      queryClient.invalidateQueries({ queryKey: ['panelist-case-timeline', caseId] });
      toast.success('Document uploaded successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to upload document');
    },
  });

  return {
    case: caseQuery.data?.data?.case,
    myResolution: caseQuery.data?.data?.myResolution,
    allResolutions: caseQuery.data?.data?.allResolutions || [],
    isLoadingCase: caseQuery.isLoading,
    caseError: caseQuery.error,

    parties: partiesQuery.data?.data?.parties || [],
    createdBy: partiesQuery.data?.data?.createdBy,
    isLoadingParties: partiesQuery.isLoading,

    documents: documentsQuery.data?.data?.documents || [],
    isLoadingDocuments: documentsQuery.isLoading,

    timeline: timelineQuery.data?.data?.activities || [],
    timelinePagination: timelineQuery.data?.data?.pagination,
    isLoadingTimeline: timelineQuery.isLoading,

    addNote: addNoteMutation.mutate,
    isAddingNote: addNoteMutation.isPending,

    uploadDocument: uploadDocumentMutation.mutate,
    isUploadingDocument: uploadDocumentMutation.isPending,

    refetchAll: () => {
      caseQuery.refetch();
      partiesQuery.refetch();
      documentsQuery.refetch();
      timelineQuery.refetch();
    },
  };
};
