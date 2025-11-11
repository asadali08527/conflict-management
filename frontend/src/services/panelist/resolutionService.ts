import apiClient, { ApiResponse } from './api';
import {
  Resolution,
  SubmitResolutionPayload,
  UpdateResolutionPayload,
  ResolutionProgress,
} from '@/types/panelist/resolution.types';

export const resolutionService = {
  // Submit resolution
  submitResolution: async (
    caseId: string,
    payload: SubmitResolutionPayload
  ): Promise<
    ApiResponse<{
      resolution: Resolution;
      resolutionComplete: boolean;
      progress: ResolutionProgress;
    }>
  > => {
    const response = await apiClient.post<
      ApiResponse<{
        resolution: Resolution;
        resolutionComplete: boolean;
        progress: ResolutionProgress;
      }>
    >(`/api/panelist/cases/${caseId}/resolution/submit`, payload);
    return response.data;
  },

  // Update draft resolution
  updateDraft: async (
    caseId: string,
    payload: UpdateResolutionPayload
  ): Promise<ApiResponse<Resolution>> => {
    const response = await apiClient.patch<ApiResponse<Resolution>>(
      `/api/panelist/cases/${caseId}/resolution/update`,
      payload
    );
    return response.data;
  },

  // Get resolution status
  getResolutionStatus: async (
    caseId: string
  ): Promise<
    ApiResponse<{
      myResolution: Resolution | null;
      allResolutions: any[];
      progress: ResolutionProgress;
    }>
  > => {
    const response = await apiClient.get<
      ApiResponse<{
        myResolution: Resolution | null;
        allResolutions: any[];
        progress: ResolutionProgress;
      }>
    >(`/api/panelist/cases/${caseId}/resolution/status`);
    return response.data;
  },
};
