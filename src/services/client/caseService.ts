/**
 * Client Case Service
 * Handles API calls for case management
 */

import { clientApiClient, ApiResponse, extractData } from './api';
import {
  CasesListResponse,
  CaseDetail,
  CaseTimelineResponse,
  CaseDocumentsResponse,
  CaseNotesResponse,
  CasePanelResponse,
  CaseResolutionResponse,
  GetCasesParams,
} from '@/types/client/case.types';

/**
 * Get all cases for the logged-in client
 * GET /api/client/cases
 */
export const getCases = async (params: GetCasesParams = {}): Promise<CasesListResponse> => {
  const response = await clientApiClient.get<ApiResponse<CasesListResponse>>(
    '/api/client/cases',
    { params }
  );
  return extractData(response.data);
};

/**
 * Get case by ID
 * GET /api/client/cases/:caseId
 */
export const getCaseById = async (caseId: string): Promise<CaseDetail> => {
  const response = await clientApiClient.get<ApiResponse<{ case: CaseDetail }>>(
    `/api/client/cases/${caseId}`
  );
  const data = extractData(response.data);
  return data.case;
};

/**
 * Get case timeline/activity history
 * GET /api/client/cases/:caseId/timeline
 */
export const getCaseTimeline = async (caseId: string): Promise<CaseTimelineResponse> => {
  const response = await clientApiClient.get<ApiResponse<CaseTimelineResponse>>(
    `/api/client/cases/${caseId}/timeline`
  );
  return extractData(response.data);
};

/**
 * Get case documents (Phase 3)
 * GET /api/client/cases/:caseId/documents
 */
export const getCaseDocuments = async (caseId: string): Promise<CaseDocumentsResponse> => {
  const response = await clientApiClient.get<ApiResponse<CaseDocumentsResponse>>(
    `/api/client/cases/${caseId}/documents`
  );
  return extractData(response.data);
};

/**
 * Get case notes (Phase 3)
 * GET /api/client/cases/:caseId/notes
 */
export const getCaseNotes = async (caseId: string): Promise<CaseNotesResponse> => {
  const response = await clientApiClient.get<ApiResponse<CaseNotesResponse>>(
    `/api/client/cases/${caseId}/notes`
  );
  return extractData(response.data);
};

/**
 * Get case panel (assigned panelists) (Phase 3)
 * GET /api/client/cases/:caseId/panel
 */
export const getCasePanel = async (caseId: string): Promise<CasePanelResponse> => {
  const response = await clientApiClient.get<ApiResponse<CasePanelResponse>>(
    `/api/client/cases/${caseId}/panel`
  );
  return extractData(response.data);
};

/**
 * Get case resolution status (Phase 3)
 * GET /api/client/cases/:caseId/resolution
 */
export const getCaseResolution = async (caseId: string): Promise<CaseResolutionResponse> => {
  const response = await clientApiClient.get<ApiResponse<CaseResolutionResponse>>(
    `/api/client/cases/${caseId}/resolution`
  );
  return extractData(response.data);
};

// Export all services as a single object
export const caseService = {
  getCases,
  getCaseById,
  getCaseTimeline,
  getCaseDocuments,
  getCaseNotes,
  getCasePanel,
  getCaseResolution,
};
