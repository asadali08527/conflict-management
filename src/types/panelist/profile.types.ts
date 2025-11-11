// Panelist Profile Types

export interface Certification {
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate?: string;
}

export interface ProfileData {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
  };
  panelist: {
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
    certifications?: Certification[];
    languages?: string[];
    availability: {
      status: 'available' | 'busy' | 'unavailable';
      maxCases: number;
      currentCaseLoad: number;
    };
    rating: {
      average: number;
      count: number;
    };
    statistics: {
      totalCasesHandled: number;
      casesResolved: number;
      averageResolutionTime?: number;
    };
    image?: {
      url?: string;
      key?: string;
    };
  };
}

export interface ProfileResponse {
  status: string;
  data: ProfileData;
}

export interface UpdateProfilePayload {
  bio?: string;
  languages?: string[];
  certifications?: Certification[];
}

export interface UpdateAvailabilityPayload {
  status: 'available' | 'busy' | 'unavailable';
  maxCases?: number;
}

export interface UpdateProfilePicturePayload {
  url: string;
  key: string;
}

export interface UpdateAccountInfoPayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

export interface UpdateProfileResponse {
  status: string;
  message: string;
  data: {
    user?: any;
    panelist?: any;
  };
}
