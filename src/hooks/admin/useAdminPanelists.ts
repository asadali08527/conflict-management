import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminPanelistsService } from '@/services/admin/adminPanelists';
import {
  GetPanelistsParams,
  GetAvailablePanelistsParams,
  CreatePanelistPayload,
  UpdatePanelistPayload,
  GetPanelistCasesParams,
  AssignPanelPayload,
  CreatePanelistAccountPayload,
  ResetPanelistPasswordPayload,
} from '@/types/panelist.types';
import { toast } from 'sonner';

/**
 * Fetch all panelists with filters and pagination
 */
export const useAdminPanelists = (params: GetPanelistsParams = {}) => {
  return useQuery({
    queryKey: ['admin-panelists', params],
    queryFn: () => adminPanelistsService.getPanelists(params),
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Fetch available panelists
 */
export const useAvailablePanelists = (params: GetAvailablePanelistsParams = {}) => {
  return useQuery({
    queryKey: ['available-panelists', params],
    queryFn: () => adminPanelistsService.getAvailablePanelists(params),
    staleTime: 30000,
  });
};

/**
 * Fetch panelist by ID with details
 */
export const usePanelistDetails = (panelistId: string | null) => {
  return useQuery({
    queryKey: ['panelist-details', panelistId],
    queryFn: () => adminPanelistsService.getPanelistById(panelistId!),
    enabled: !!panelistId,
    staleTime: 30000,
  });
};

/**
 * Fetch cases for a specific panelist
 */
export const usePanelistCases = (panelistId: string | null, params: GetPanelistCasesParams = {}) => {
  return useQuery({
    queryKey: ['panelist-cases', panelistId, params],
    queryFn: () => adminPanelistsService.getPanelistCases(panelistId!, params),
    enabled: !!panelistId,
    staleTime: 30000,
  });
};

/**
 * Fetch panelist statistics
 */
export const usePanelistStatistics = () => {
  return useQuery({
    queryKey: ['panelist-statistics'],
    queryFn: () => adminPanelistsService.getPanelistStatistics(),
    staleTime: 60000, // 1 minute
  });
};

/**
 * Fetch panel statistics (dashboard)
 */
export const usePanelStatistics = () => {
  return useQuery({
    queryKey: ['panel-statistics'],
    queryFn: () => adminPanelistsService.getPanelStatistics(),
    staleTime: 60000, // 1 minute
  });
};

/**
 * Create a new panelist
 */
export const useCreatePanelist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePanelistPayload) =>
      adminPanelistsService.createPanelist(payload),
    onSuccess: () => {
      toast.success('Panelist created successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-panelists'] });
      queryClient.invalidateQueries({ queryKey: ['panelist-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['panel-statistics'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to create panelist: ${error.message}`);
    },
  });
};

/**
 * Update panelist information
 */
export const useUpdatePanelist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      panelistId,
      payload,
    }: {
      panelistId: string;
      payload: UpdatePanelistPayload;
    }) => adminPanelistsService.updatePanelist(panelistId, payload),
    onSuccess: (data, variables) => {
      toast.success('Panelist updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-panelists'] });
      queryClient.invalidateQueries({ queryKey: ['panelist-details', variables.panelistId] });
      queryClient.invalidateQueries({ queryKey: ['panelist-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['panel-statistics'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update panelist: ${error.message}`);
    },
  });
};

/**
 * Deactivate a panelist
 */
export const useDeactivatePanelist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (panelistId: string) =>
      adminPanelistsService.deactivatePanelist(panelistId),
    onSuccess: (data, panelistId) => {
      toast.success('Panelist deactivated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-panelists'] });
      queryClient.invalidateQueries({ queryKey: ['panelist-details', panelistId] });
      queryClient.invalidateQueries({ queryKey: ['panelist-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['panel-statistics'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to deactivate panelist: ${error.message}`);
    },
  });
};

/**
 * Assign panel to a case
 */
export const useAssignPanelToCase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      caseId,
      payload,
    }: {
      caseId: string;
      payload: AssignPanelPayload;
    }) => adminPanelistsService.assignPanelToCase(caseId, payload),
    onSuccess: (data, variables) => {
      toast.success('Panel assigned to case successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-cases'] });
      queryClient.invalidateQueries({ queryKey: ['admin-case-details', variables.caseId] });
      queryClient.invalidateQueries({ queryKey: ['admin-panelists'] });
      queryClient.invalidateQueries({ queryKey: ['panelist-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['panel-statistics'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to assign panel: ${error.message}`);
    },
  });
};

/**
 * Remove panelist from case
 */
export const useRemovePanelistFromCase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      caseId,
      panelistId,
    }: {
      caseId: string;
      panelistId: string;
    }) => adminPanelistsService.removePanelistFromCase(caseId, panelistId),
    onSuccess: (data, variables) => {
      toast.success('Panelist removed from case successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-cases'] });
      queryClient.invalidateQueries({ queryKey: ['admin-case-details', variables.caseId] });
      queryClient.invalidateQueries({ queryKey: ['panelist-cases', variables.panelistId] });
      queryClient.invalidateQueries({ queryKey: ['admin-panelists'] });
      queryClient.invalidateQueries({ queryKey: ['panelist-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['panel-statistics'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove panelist: ${error.message}`);
    },
  });
};

/**
 * Create panelist account
 */
export const useCreatePanelistAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      panelistId,
      payload,
    }: {
      panelistId: string;
      payload: CreatePanelistAccountPayload;
    }) => adminPanelistsService.createPanelistAccount(panelistId, payload),
    onSuccess: (data, variables) => {
      toast.success('Panelist account created successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-panelists'] });
      queryClient.invalidateQueries({ queryKey: ['panelist-details', variables.panelistId] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to create account: ${error.message}`);
    },
  });
};

/**
 * Reset panelist password
 */
export const useResetPanelistPassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      panelistId,
      payload,
    }: {
      panelistId: string;
      payload: ResetPanelistPasswordPayload;
    }) => adminPanelistsService.resetPanelistPassword(panelistId, payload),
    onSuccess: (data, variables) => {
      toast.success('Password reset successfully');
      queryClient.invalidateQueries({ queryKey: ['panelist-details', variables.panelistId] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to reset password: ${error.message}`);
    },
  });
};

/**
 * Fetch panelist performance metrics
 */
export const usePanelistPerformance = (panelistId: string | null) => {
  return useQuery({
    queryKey: ['panelist-performance', panelistId],
    queryFn: () => adminPanelistsService.getPanelistPerformance(panelistId!),
    enabled: !!panelistId,
    staleTime: 60000, // 1 minute
  });
};
