// Panelist Case Types

export interface CaseParty {
  name: string;
  contact: string;
  role: string;
  phone?: string;
}

export interface CaseCreator {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface PanelistCase {
  _id: string;
  caseId: string;
  title: string;
  description: string;
  type: 'marriage' | 'land' | 'property' | 'family';
  status: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  parties: CaseParty[];
  createdBy: CaseCreator;
  createdAt: string;
  updatedAt: string;
  assignedAt?: string;
  conflictBackground?: string;
  desiredOutcomes?: string;
}

export interface CaseListParams {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  priority?: string;
  search?: string;
}

export interface CasesListResponse {
  status: string;
  data: {
    cases: PanelistCase[];
    pagination: {
      current: number;
      pages: number;
      total: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface CaseDocument {
  _id: string;
  name: string;
  url: string;
  key?: string;
  size: number;
  mimetype: string;
  uploadedAt: string;
  uploadedBy: {
    _id: string;
    name: string;
  };
}

export interface CaseNote {
  _id: string;
  content: string;
  noteType: 'general' | 'progress' | 'internal';
  createdBy: {
    _id: string;
    name: string;
    role: string;
  };
  createdAt: string;
}

export interface TimelineActivity {
  _id: string;
  activityType: string;
  description: string;
  performedBy: {
    _id: string;
    name: string;
    role: string;
  };
  timestamp: string;
  metadata?: {
    [key: string]: any;
  };
}

export interface CaseDetailResponse {
  status: string;
  data: {
    case: PanelistCase;
    myResolution?: any;
    allResolutions?: any[];
  };
}

export interface CasePartiesResponse {
  status: string;
  data: {
    parties: CaseParty[];
    createdBy: CaseCreator;
  };
}

export interface CaseDocumentsResponse {
  status: string;
  data: {
    documents: CaseDocument[];
  };
}

export interface CaseTimelineResponse {
  status: string;
  data: {
    activities: TimelineActivity[];
    pagination: {
      current: number;
      pages: number;
      total: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface UploadDocumentPayload {
  name: string;
  url: string;
  key: string;
  size: number;
  mimetype: string;
}

export interface AddNotePayload {
  content: string;
  noteType: 'general' | 'progress' | 'internal';
}
