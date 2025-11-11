/**
 * Client Case Types
 * Based on CLIENT_API_DOCUMENTATION.md
 */

export type CaseStatus = 'open' | 'assigned' | 'panel_assigned' | 'in_progress' | 'resolved' | 'closed';

export type CaseType = 'marriage' | 'land' | 'property' | 'family';

export type CasePriority = 'low' | 'medium' | 'high' | 'urgent';

export type ResolutionStatus = 'not_started' | 'in_progress' | 'partial' | 'complete';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface Panelist {
  _id: string;
  name: string;
  occupation: string;
  specializations: string[];
  rating?: {
    average: number;
    count?: number;
  };
  bio?: string;
  isActive?: boolean;
}

export interface AssignedPanelist {
  panelist: Panelist;
  assignedAt: string;
  status: 'active' | 'inactive';
}

export interface ResolutionProgress {
  total: number;
  submitted: number;
  lastUpdated?: string;
}

export interface CaseListItem {
  _id: string;
  caseId: string;
  title: string;
  description: string;
  type: CaseType;
  status: CaseStatus;
  priority: CasePriority;
  assignedTo?: User;
  assignedPanelists: AssignedPanelist[];
  resolutionStatus?: ResolutionStatus;
  resolutionProgress?: ResolutionProgress;
  activePanelistsCount: number;
  createdAt: string;
}

export interface Party {
  name: string;
  email: string;
  phone?: string;
  relationshipToDispute: string;
}

export interface Document {
  name: string;
  url: string;
  key: string;
  size: number;
  mimetype: string;
  uploadedAt: string;
}

export interface Note {
  _id: string;
  content: string;
  createdBy?: User;
  panelistId?: Panelist;
  createdByType: 'admin' | 'panelist';
  noteType: 'general' | 'progress' | 'internal';
  createdAt: string;
}

export interface CaseDetail {
  _id: string;
  caseId: string;
  title: string;
  description: string;
  type: CaseType;
  status: CaseStatus;
  priority: CasePriority;
  createdBy: User;
  assignedTo?: User;
  assignedPanelists: AssignedPanelist[];
  parties: Party[];
  documents: Document[];
  notes: Note[];
  resolutionStatus?: ResolutionStatus;
  resolutionProgress?: ResolutionProgress;
  createdAt: string;
}

export interface CasesListResponse {
  cases: CaseListItem[];
  pagination: {
    current: number;
    pages: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface TimelineActivity {
  _id: string;
  activityType: string;
  description: string;
  performedBy: {
    userId?: User;
    panelistId?: Panelist;
  };
  createdAt: string;
}

export interface CaseTimelineResponse {
  activities: TimelineActivity[];
  count: number;
}

export interface SubmissionFile {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadUrl: string;
  description?: string;
  uploadedAt: string;
}

export interface CaseDocumentsResponse {
  caseDocuments: Document[];
  submissionFiles: {
    source: string;
    files: SubmissionFile[];
  }[];
  totalDocuments: number;
}

export interface CaseNotesResponse {
  notes: Note[];
  count: number;
}

export interface PanelistInfo {
  panelist: {
    id: string;
    name: string;
    occupation: string;
    specializations: string[];
    rating: {
      average: number;
      count: number;
    };
    bio: string;
    isActive: boolean;
  };
  assignedAt: string;
  assignedBy: {
    name: string;
  };
}

export interface CasePanelResponse {
  panelists: PanelistInfo[];
  count: number;
  panelAssignedAt?: string;
}

export interface Resolution {
  id: string;
  panelist: {
    name: string;
    occupation: string;
    specializations: string[];
    rating: number;
  };
  recommendation: string;
  reasoning: string;
  submittedAt: string;
}

export interface CaseResolutionResponse {
  resolutionStatus: ResolutionStatus;
  resolutionProgress: ResolutionProgress;
  finalizedAt: string | null;
  finalizedBy: any[];
  resolutions: Resolution[];
}

export interface GetCasesParams {
  page?: number;
  limit?: number;
  status?: CaseStatus;
  type?: CaseType;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
