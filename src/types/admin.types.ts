// Admin authentication types
export interface AdminLoginPayload {
  email: string;
  password: string;
}

export interface AdminRegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
}

export interface AdminUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'admin';
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminAuthResponse {
  status: string;
  message: string;
  data: {
    user: AdminUser;
    token: string;
  };
}

// Case list types
export interface Party {
  name: string;
  contact: string;
  role: string;
}

export interface CaseListItem {
  _id: string;
  caseId: string; // Formatted ID like "CASE-2025-123456"
  title: string;
  description: string;
  type: string;
  status: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  assignedTo: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  assignedAt?: string | null;
  parties: Party[];
  documents?: CaseDocument[];
  notes?: CaseNote[];
  hasPartyBResponse: boolean;
  partyBSubmissionStatus?: 'pending' | 'submitted' | 'rejected';
  sessionId: string;
  linkedSessionId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CaseDocument {
  name: string;
  url: string;
  key: string;
  size: number;
  mimetype: string;
  uploadedAt: string;
}

export interface PaginationInfo {
  current: number;
  pages: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface GetCasesParams {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  priority?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface GetCasesResponse {
  status: string;
  data: {
    cases: CaseListItem[];
    pagination: PaginationInfo;
  };
}

// Detailed case types
export interface CaseNote {
  content: string;
  createdBy: string;
  createdAt: string;
}

export interface DetailedCase {
  _id: string;
  caseId: string;
  title: string;
  description: string;
  type: string;
  status: string;
  priority: string;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  assignedTo: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  assignedAt?: string | null;
  parties: Party[];
  documents?: CaseDocument[];
  notes: CaseNote[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PartySubmissionSteps {
  step1: {
    conflictType: string;
    description: string;
  };
  step2: {
    parties: Array<{
      name: string;
      email: string;
      phone: string;
      role: string;
    }>;
  };
  step3: {
    conflictBackground: string;
  };
  step4: {
    desiredOutcomes: string;
  };
  step5: {
    schedulingPreferences: {
      preferredDays: string[];
      preferredTimes: string[];
    };
  };
  step6: {
    uploadedFiles: string[];
  };
}

export interface SubmissionDocument {
  id?: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadUrl: string;
  storageKey?: string;
  description?: string;
  uploadedAt: string;
}

export interface PartySubmission {
  sessionId: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submittedAt: string;
  steps: PartySubmissionSteps;
  documents: SubmissionDocument[];
}

export interface DetailedCaseResponse {
  status: string;
  data: {
    case: DetailedCase;
    partyA: PartySubmission;
    partyB?: PartySubmission;
    hasPartyBResponse: boolean;
    meetings: Meeting[];
  };
}

// Case status update types
export interface UpdateCaseStatusPayload {
  status: string;
  resolutionDetails?: string;
  adminFeedback?: string;
  nextSteps?: string;
}

export interface UpdateCaseStatusResponse {
  status: string;
  message: string;
  data: {
    case: DetailedCase;
  };
}

// Add note types
export interface AddNotePayload {
  content: string;
  noteType?: string;
}

export interface AddNoteResponse {
  status: string;
  message: string;
  data: {
    case: DetailedCase;
    addedNote: CaseNote;
  };
}

// Meeting types
export interface MeetingAttendee {
  name: string;
  email: string;
  user?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  isParty?: boolean;
  status: 'invited' | 'accepted' | 'declined' | 'tentative';
  role?: string;
}

export interface Meeting {
  _id: string;
  title: string;
  description: string;
  case: {
    _id: string;
    title: string;
    type: string;
  };
  scheduledBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  attendees: MeetingAttendee[];
  scheduledDate: string;
  duration: number;
  meetingType: 'video' | 'phone' | 'in-person';
  meetingLink?: string;
  location?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
  outcome?: string;
  nextSteps?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ScheduleMeetingPayload {
  title: string;
  description: string;
  caseId: string;
  scheduledDate: string;
  duration: number;
  meetingType: 'video' | 'phone' | 'in-person';
  meetingLink?: string;
  location?: string;
  notes?: string;
  includeParties?: boolean;
  attendees?: Partial<MeetingAttendee>[];
}

export interface ScheduleMeetingResponse {
  status: string;
  message: string;
  data: {
    meeting: Meeting;
  };
}

export interface UpdateMeetingPayload {
  status?: string;
  outcome?: string;
  nextSteps?: string;
  updateCase?: boolean;
}

export interface UpdateMeetingResponse {
  status: string;
  message: string;
  data: {
    meeting: Meeting;
  };
}

// Dashboard types
export interface DashboardStats {
  cases: {
    total: number;
    open: number;
    assigned: number;
    resolved: number;
    closed: number;
    recent: number;
  };
  users: {
    total: number;
    active: number;
    admins: number;
    clients: number;
  };
  casesByType: {
    [key: string]: number;
  };
}

export interface DashboardStatsResponse {
  status: string;
  data: DashboardStats;
}

// Statistics types
export interface AdminStatistics {
  _id: string;
  adminName: string;
  adminEmail: string;
  totalCases: number;
  openCases: number;
  assignedCases: number;
  inProgressCases: number;
  resolvedCases: number;
  closedCases: number;
  activeCases: number;
}

export interface StatisticsByAdminResponse {
  status: string;
  data: {
    statistics: AdminStatistics[];
  };
}

// User management types
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'admin' | 'client';
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  role?: 'admin' | 'client';
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface GetUsersResponse {
  status: string;
  data: {
    users: User[];
    pagination: PaginationInfo;
  };
}

export interface AdminWithStats {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  assignedCasesCount: number;
  activeCasesCount: number;
}

export interface GetAdminsResponse {
  status: string;
  data: {
    admins: AdminWithStats[];
  };
}

export interface ToggleUserStatusResponse {
  status: string;
  message: string;
  data: {
    user: User;
  };
}

// Case assignment types
export interface AssignCasePayload {
  assignedTo: string; // User ID
}

export interface AssignCaseResponse {
  status: string;
  message: string;
  data: {
    case: CaseListItem;
  };
}

// Priority update types
export interface UpdatePriorityPayload {
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface UpdatePriorityResponse {
  status: string;
  message: string;
  data: {
    case: CaseListItem;
  };
}

// Case files types
export interface CaseFilesResponse {
  status: string;
  data: {
    caseId: string;
    caseIdFormatted: string;
    caseTitle: string;
    caseDocuments: CaseDocument[];
    submissionFiles: {
      party: string;
      sessionId: string;
      files: SubmissionDocument[];
    }[];
    totalFiles: number;
  };
}

// Meeting list types
export interface GetMeetingsParams {
  page?: number;
  limit?: number;
  status?: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  meetingType?: 'video' | 'phone' | 'in-person';
  caseId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface GetMeetingsResponse {
  status: string;
  data: {
    meetings: Meeting[];
    pagination: PaginationInfo;
  };
}

export interface GetMeetingResponse {
  status: string;
  data: {
    meeting: Meeting;
  };
}

export interface CancelMeetingPayload {
  reason?: string;
}

export interface CancelMeetingResponse {
  status: string;
  message: string;
  data: {
    meeting: Meeting;
  };
}
