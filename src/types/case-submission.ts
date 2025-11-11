// Session Management Types
export interface CreateSessionPayload {
  userId?: string;
  startedAt: string;
}

export interface CreateSessionResponse {
  sessionId: string;
  userId?: string;
  startedAt: string;
}

// Party B Join Case Types
export interface JoinCasePayload {
  parentSessionId: string;
  userId?: string;
}

export interface JoinCaseResponse {
  success: boolean;
  sessionId: string;
  message: string;
  parentSessionId: string;
  startedAt: string;
}

// Step Payloads and Responses
export interface StepPayloadBase {
  stepId: number;
  sessionId: string;
}

export interface Step1Payload extends StepPayloadBase {
  stepId: 1;
  caseOverview: {
    conflictType: string;
    description: string;
    urgencyLevel: 'low' | 'medium' | 'high' | 'urgent';
    estimatedValue?: string;
  };
}

export interface Step2Payload extends StepPayloadBase {
  stepId: 2;
  partiesInvolved: {
    parties: Array<{
      name: string;
      role: string;
      email: string;
      phone?: string;
      relationship: string;
    }>;
  };
}

export interface Step3Payload extends StepPayloadBase {
  stepId: 3;
  conflictBackground: {
    timeline: string;
    keyIssues: string[];
    previousAttempts: string;
    emotionalImpact: string;
  };
}

export interface Step4Payload extends StepPayloadBase {
  stepId: 4;
  desiredOutcomes: {
    primaryGoals: string[];
    successMetrics: string;
    constraints: string;
    timeline: string;
  };
}

export interface Step5Payload extends StepPayloadBase {
  stepId: 5;
  schedulingPreferences: {
    availability: string[];
    preferredLocation: 'online' | 'in-person' | 'hybrid';
    timeZone: string;
    communicationPreference: 'email' | 'phone' | 'text' | 'app';
  };
}

export interface Step6FormData extends StepPayloadBase {
  stepId: 6;
}

// Common Step Response
export interface StepResponse {
  success: boolean;
  message: string;
  sessionId: string;
  nextStep: number | 'final_submission';
  validationErrors?: Record<string, string> | null;
}

// Step 6 specific response
export interface Step6Response extends StepResponse {
  uploadedFiles?: Array<{
    fileName: string;
    fileSize: number;
    fileType: string;
    uploadUrl: string;
  }>;
}

// Final Submission
export interface FinalSubmissionPayload {
  sessionId: string;
  submittedAt: string;
  submitterUserId?: string;
}

export interface FinalSubmissionResponse {
  success: boolean;
  caseId: string;
  message: string;
  submitterType: 'party_a' | 'party_b';
  estimatedProcessingTime: string;
  nextSteps: string;
  trackingUrl?: string;
}

// Session Data Retrieval
export interface SessionData {
  sessionId: string;
  currentStep: number;
  completedSteps: number[];
  data: {
    caseOverview?: Step1Payload['caseOverview'];
    partiesInvolved?: Step2Payload['partiesInvolved'];
    conflictBackground?: Step3Payload['conflictBackground'];
    desiredOutcomes?: Step4Payload['desiredOutcomes'];
    schedulingPreferences?: Step5Payload['schedulingPreferences'];
    documents?: {
      files: Array<{
        fileName: string;
        fileSize: number;
        fileType: string;
        uploadUrl: string;
        description?: string;
      }>;
    };
  };
  lastModified: string;
}

// Error Types
export interface CaseSubmissionError {
  success: false;
  error:
    | 'VALIDATION_ERROR'
    | 'SESSION_NOT_FOUND'
    | 'FILE_UPLOAD_ERROR'
    | 'RATE_LIMIT_ERROR'
    | 'SERVER_ERROR'
    | 'CASE_NOT_SUBMITTED'
    | 'PARTY_B_ALREADY_JOINED'
    | 'INCOMPLETE_SUBMISSION';
  message: string;
  validationErrors?: Record<string, string>;
  stepId?: number;
  existingSessionId?: string;
}

// Union types for all step payloads
export type StepPayload =
  | Step1Payload
  | Step2Payload
  | Step3Payload
  | Step4Payload
  | Step5Payload;

// All response types
export type StepResponseType = StepResponse | Step6Response;
