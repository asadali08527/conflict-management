// Panelist Management Types

export type AvailabilityStatus = 'available' | 'busy' | 'unavailable';
export type SpecializationType = 'marriage' | 'land' | 'property' | 'family' | 'divorce' | 'business' | 'employment' | 'neighbor' | 'inheritance' | 'other';
export type AssignmentStatus = 'active' | 'removed' | 'completed';

// Panelist Model
export interface Education {
  degree: string;
  institution: string;
  yearCompleted: number;
}

export interface Experience {
  years: number;
  description: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  alternatePhone?: string;
}

export interface Availability {
  status: AvailabilityStatus;
  maxCases: number;
  currentCaseLoad?: number;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface ImageInfo {
  url?: string;
  key?: string;
}

export interface PanelistStatistics {
  totalCases?: number;
  activeCases?: number;
  resolvedCases?: number;
  successRate?: number;
  averageRating?: number;
}

export interface Panelist {
  _id: string;
  name: string;
  age: number;
  image?: ImageInfo;
  occupation: string;
  education: Education;
  specializations: SpecializationType[];
  experience: Experience;
  contactInfo: ContactInfo;
  availability: Availability;
  address?: Address;
  bio?: string;
  certifications?: string[];
  languages?: string[];
  rating?: number;
  statistics?: PanelistStatistics;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Panel Assignment
export interface PanelistAssignment {
  panelist: Panelist | string;
  assignedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  assignedAt: string;
  status: AssignmentStatus;
}

export interface CaseWithPanel {
  _id: string;
  caseId: string;
  title: string;
  type: string;
  status: string;
  assignedPanelists: PanelistAssignment[];
  panelAssignedAt?: string;
}

// API Request Payloads
export interface CreatePanelistPayload {
  name: string;
  age: number;
  occupation: string;
  education: Education;
  specializations: SpecializationType[];
  experience: Experience;
  contactInfo: ContactInfo;
  availability: {
    maxCases: number;
  };
  address?: Address;
  bio?: string;
  certifications?: string[];
  languages?: string[];
  image?: ImageInfo;
}

export interface UpdatePanelistPayload {
  name?: string;
  age?: number;
  occupation?: string;
  education?: Education;
  specializations?: SpecializationType[];
  experience?: Experience;
  contactInfo?: ContactInfo;
  availability?: Partial<Availability>;
  address?: Address;
  bio?: string;
  certifications?: string[];
  languages?: string[];
  image?: ImageInfo;
}

export interface AssignPanelPayload {
  panelistIds: string[];
}

// API Query Parameters
export interface GetPanelistsParams {
  page?: number;
  limit?: number;
  specialization?: SpecializationType;
  availability?: AvailabilityStatus;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface GetAvailablePanelistsParams {
  caseType?: string;
}

export interface GetPanelistCasesParams {
  page?: number;
  limit?: number;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// API Response Types
export interface PaginationInfo {
  current: number;
  pages: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface GetPanelistsResponse {
  status: string;
  data: {
    panelists: Panelist[];
    pagination: PaginationInfo;
  };
}

export interface GetPanelistResponse {
  status: string;
  data: {
    panelist: Panelist;
    assignedCases: CaseWithPanel[];
    caseHistory: number;
    totalCasesHandled: number;
  };
}

export interface GetAvailablePanelistsResponse {
  status: string;
  data: {
    panelists: Panelist[];
    count: number;
  };
}

export interface CreatePanelistResponse {
  status: string;
  message: string;
  data: {
    panelist: Panelist;
  };
}

export interface UpdatePanelistResponse {
  status: string;
  message: string;
  data: {
    panelist: Panelist;
  };
}

export interface DeactivatePanelistResponse {
  status: string;
  message: string;
  data: {
    panelist: Panelist;
  };
}

// Panel Statistics
export interface PanelStatistics {
  overview: {
    total: number;
    active: number;
    available: number;
    busy: number;
    casesWithPanel: number;
    totalActiveAssignments: number;
  };
  specializationDistribution: Array<{
    _id: SpecializationType;
    count: number;
  }>;
  availabilityDistribution: Array<{
    _id: AvailabilityStatus;
    count: number;
  }>;
  workload: {
    totalCapacity: number;
    currentLoad: number;
    averageLoad: number;
  };
  topPerformers: Panelist[];
}

export interface GetPanelStatisticsResponse {
  status: string;
  data: PanelStatistics;
}

// Panelist Cases
export interface GetPanelistCasesResponse {
  status: string;
  data: {
    panelist: {
      id: string;
      name: string;
      occupation: string;
      currentCaseLoad: number;
    };
    cases: CaseWithPanel[];
    pagination: PaginationInfo;
  };
}

// Panel Assignment Responses
export interface AssignPanelResponse {
  status: string;
  message: string;
  data: {
    case: CaseWithPanel;
  };
}

export interface RemovePanelistResponse {
  status: string;
  message: string;
  data: {
    case: CaseWithPanel;
  };
}

// Account Management Payloads
export interface CreatePanelistAccountPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface ResetPanelistPasswordPayload {
  newPassword: string;
}

// Account Management Responses
export interface CreatePanelistAccountResponse {
  status: string;
  message: string;
  data: {
    panelist: Panelist;
    credentials: {
      email: string;
      temporaryPassword: string;
    };
  };
}

export interface ResetPanelistPasswordResponse {
  status: string;
  message: string;
  data: {
    panelist: Panelist;
    newPassword: string;
  };
}

// Performance Metrics
export interface PanelistPerformance {
  panelist: {
    id: string;
    name: string;
    occupation: string;
  };
  statistics: {
    totalCases: number;
    activeCases: number;
    completedCases: number;
    resolvedCases: number;
    successRate: number;
    averageResolutionTime: number; // in days
  };
  ratings: {
    averageRating: number;
    totalRatings: number;
    ratingDistribution: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
  };
  recentCases: Array<{
    caseId: string;
    title: string;
    status: string;
    assignedAt: string;
    resolvedAt?: string;
  }>;
  monthlyPerformance: Array<{
    month: string;
    casesHandled: number;
    casesResolved: number;
    averageRating: number;
  }>;
}

export interface GetPanelistPerformanceResponse {
  status: string;
  data: PanelistPerformance;
}
