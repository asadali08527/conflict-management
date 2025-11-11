// Panelist Resolution Types

export interface Resolution {
  _id: string;
  caseId: string;
  panelist: {
    _id: string;
    name: string;
  };
  resolutionStatus: 'resolved' | 'no_outcome';
  resolutionNotes: string;
  outcome?: string;
  recommendations?: string;
  isSubmitted: boolean;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitResolutionPayload {
  resolutionStatus: 'resolved' | 'no_outcome';
  resolutionNotes: string;
  outcome?: string;
  recommendations?: string;
}

export interface UpdateResolutionDraftPayload {
  resolutionStatus?: 'resolved' | 'no_outcome';
  resolutionNotes?: string;
  outcome?: string;
  recommendations?: string;
}

export interface ResolutionProgress {
  total: number;
  submitted: number;
  pending: number;
}

export interface SubmitResolutionResponse {
  status: string;
  data: {
    resolution: Resolution;
    resolutionComplete: boolean;
    progress: ResolutionProgress;
  };
}

export interface UpdateResolutionResponse {
  status: string;
  data: {
    resolution: Resolution;
  };
}

export interface ResolutionStatusResponse {
  status: string;
  data: {
    myResolution?: Resolution;
    allResolutions: Array<{
      panelist: {
        _id: string;
        name: string;
      };
      isSubmitted: boolean;
      submittedAt?: string;
    }>;
    progress: ResolutionProgress;
  };
}
