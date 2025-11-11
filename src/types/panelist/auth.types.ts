// Panelist Authentication Types

export interface PanelistUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

export interface PanelistInfo {
  _id: string;
  name: string;
  age: number;
  occupation: string;
  education: {
    degree: string;
    institution: string;
    yearCompleted: number;
  };
  specializations: string[];
  experience: {
    years: number;
    description: string;
  };
  bio?: string;
  certifications?: Array<{
    name: string;
    issuingOrganization: string;
    issueDate: string;
    expiryDate?: string;
  }>;
  languages?: string[];
  availability: {
    status: 'available' | 'busy' | 'unavailable';
    maxCases: number;
    currentCaseLoad: number;
  };
  rating?: {
    average: number;
    count: number;
  };
  statistics?: {
    totalCasesHandled: number;
    casesResolved: number;
    averageResolutionTime?: number;
  };
  image?: {
    url?: string;
    key?: string;
  };
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: string;
  data: {
    user: PanelistUser;
    panelist: PanelistInfo;
    token: string;
  };
}

export interface AuthMeResponse {
  status: string;
  data: {
    user: PanelistUser;
    panelist: PanelistInfo;
  };
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  status: string;
  message: string;
}
