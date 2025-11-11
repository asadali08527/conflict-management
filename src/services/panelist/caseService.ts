import apiClient, { ApiResponse, PaginationParams, PaginationResponse } from './api';
import {
  PanelistCase,
  CaseDocument,
  CaseNote,
  TimelineActivity,
  CaseParty,
  CreateNotePayload,
  CreateDocumentPayload,
} from '@/types/panelist/case.types';

export interface CaseListParams extends PaginationParams {
  status?: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
  type?: 'marriage' | 'land' | 'property' | 'family';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  search?: string;
}

export const caseService = {
  // Get list of cases
  getCases: async (
    params: CaseListParams = {}
  ): Promise<
    ApiResponse<{ cases: PanelistCase[]; pagination: PaginationResponse }>
  > => {
    const response = await apiClient.get<
      ApiResponse<{ cases: PanelistCase[]; pagination: PaginationResponse }>
    >('/api/panelist/cases', { params });
    return response.data;
  },

  // Get case details
  getCaseById: async (
    caseId: string
  ): Promise<
    ApiResponse<{
      case: PanelistCase;
      myResolution: any;
      allResolutions: any[];
    }>
  > => {
    const response = await apiClient.get<
      ApiResponse<{
        case: PanelistCase;
        myResolution: any;
        allResolutions: any[];
      }>
    >(`/api/panelist/cases/${caseId}`);
    return response.data;
  },

  // Get case parties
  getCaseParties: async (
    caseId: string
  ): Promise<
    ApiResponse<{ parties: CaseParty[]; createdBy: any }>
  > => {
    const response = await apiClient.get<
      ApiResponse<{ parties: CaseParty[]; createdBy: any }>
    >(`/api/panelist/cases/${caseId}/parties`);
    return response.data;
  },

  // Get case documents
  getCaseDocuments: async (
    caseId: string
  ): Promise<ApiResponse<{ documents: CaseDocument[] }>> => {
    const response = await apiClient.get<
      ApiResponse<{ documents: CaseDocument[] }>
    >(`/api/panelist/cases/${caseId}/documents`);
    return response.data;
  },

  // Upload document
  uploadDocument: async (
    caseId: string,
    payload: CreateDocumentPayload
  ): Promise<ApiResponse<CaseDocument>> => {
    const response = await apiClient.post<ApiResponse<CaseDocument>>(
      `/api/panelist/cases/${caseId}/documents`,
      payload
    );
    return response.data;
  },

  // Add note
  addNote: async (
    caseId: string,
    payload: CreateNotePayload
  ): Promise<ApiResponse<CaseNote>> => {
    const response = await apiClient.post<ApiResponse<CaseNote>>(
      `/api/panelist/cases/${caseId}/notes`,
      payload
    );
    return response.data;
  },

  // Get timeline
  getTimeline: async (
    caseId: string,
    params: PaginationParams = {}
  ): Promise<
    ApiResponse<{ activities: TimelineActivity[]; pagination: PaginationResponse }>
  > => {
    const response = await apiClient.get<
      ApiResponse<{ activities: TimelineActivity[]; pagination: PaginationResponse }>
    >(`/api/panelist/cases/${caseId}/timeline`, { params });
    return response.data;
  },
};
