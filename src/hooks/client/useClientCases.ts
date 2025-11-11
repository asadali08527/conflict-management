/**
 * Client Cases Hooks
 * TanStack Query hooks for case data
 */

import { useQuery } from '@tanstack/react-query';
import { caseService } from '@/services/client/caseService';
import { GetCasesParams } from '@/types/client/case.types';

/**
 * Hook to fetch all cases with filters
 */
export const useClientCases = (params: GetCasesParams = {}) => {
  return useQuery({
    queryKey: ['client-cases', params],
    queryFn: () => caseService.getCases(params),
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });
};

/**
 * Hook to fetch a single case by ID
 */
export const useClientCaseDetail = (caseId: string) => {
  return useQuery({
    queryKey: ['client-case-detail', caseId],
    queryFn: () => caseService.getCaseById(caseId),
    enabled: !!caseId,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });
};

/**
 * Hook to fetch case timeline
 */
export const useClientCaseTimeline = (caseId: string) => {
  return useQuery({
    queryKey: ['client-case-timeline', caseId],
    queryFn: () => caseService.getCaseTimeline(caseId),
    enabled: !!caseId,
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Hook to fetch case documents (Phase 3)
 */
export const useClientCaseDocuments = (caseId: string) => {
  return useQuery({
    queryKey: ['client-case-documents', caseId],
    queryFn: () => caseService.getCaseDocuments(caseId),
    enabled: !!caseId,
    staleTime: 60000, // 1 minute
  });
};

/**
 * Hook to fetch case notes (Phase 3)
 */
export const useClientCaseNotes = (caseId: string) => {
  return useQuery({
    queryKey: ['client-case-notes', caseId],
    queryFn: () => caseService.getCaseNotes(caseId),
    enabled: !!caseId,
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Hook to fetch case panel (Phase 3)
 */
export const useClientCasePanel = (caseId: string) => {
  return useQuery({
    queryKey: ['client-case-panel', caseId],
    queryFn: () => caseService.getCasePanel(caseId),
    enabled: !!caseId,
    staleTime: 60000, // 1 minute
  });
};

/**
 * Hook to fetch case resolution (Phase 3)
 */
export const useClientCaseResolution = (caseId: string) => {
  return useQuery({
    queryKey: ['client-case-resolution', caseId],
    queryFn: () => caseService.getCaseResolution(caseId),
    enabled: !!caseId,
    staleTime: 30000, // 30 seconds
  });
};
