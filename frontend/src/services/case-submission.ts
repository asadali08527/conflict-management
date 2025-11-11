import { apiRequest, API_CONFIG } from '@/lib/api';
import {
  CreateSessionPayload,
  CreateSessionResponse,
  JoinCasePayload,
  JoinCaseResponse,
  Step1Payload,
  Step2Payload,
  Step3Payload,
  Step4Payload,
  Step5Payload,
  Step6FormData,
  StepResponse,
  Step6Response,
  FinalSubmissionPayload,
  FinalSubmissionResponse,
  SessionData,
  CaseSubmissionError
} from '@/types/case-submission';

export const caseSubmissionService = {
  // Session Management
  createSession: async (payload: CreateSessionPayload): Promise<CreateSessionResponse> => {
    return apiRequest<CreateSessionResponse>(API_CONFIG.ENDPOINTS.CASE_SUBMISSION.CREATE_SESSION, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Party B Join Case
  joinCase: async (payload: JoinCasePayload): Promise<JoinCaseResponse> => {
    return apiRequest<JoinCaseResponse>(API_CONFIG.ENDPOINTS.CASE_SUBMISSION.JOIN_CASE, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getSession: async (sessionId: string): Promise<SessionData> => {
    return apiRequest<SessionData>(`${API_CONFIG.ENDPOINTS.CASE_SUBMISSION.GET_SESSION}/${sessionId}`, {
      method: 'GET',
    });
  },

  // Step 1: Case Overview
  submitStep1: async (payload: Step1Payload): Promise<StepResponse> => {
    return apiRequest<StepResponse>(API_CONFIG.ENDPOINTS.CASE_SUBMISSION.STEP_1, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Step 2: Parties Involved
  submitStep2: async (payload: Step2Payload): Promise<StepResponse> => {
    return apiRequest<StepResponse>(API_CONFIG.ENDPOINTS.CASE_SUBMISSION.STEP_2, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Step 3: Conflict Background
  submitStep3: async (payload: Step3Payload): Promise<StepResponse> => {
    return apiRequest<StepResponse>(API_CONFIG.ENDPOINTS.CASE_SUBMISSION.STEP_3, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Step 4: Desired Outcomes
  submitStep4: async (payload: Step4Payload): Promise<StepResponse> => {
    return apiRequest<StepResponse>(API_CONFIG.ENDPOINTS.CASE_SUBMISSION.STEP_4, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Step 5: Scheduling Preferences
  submitStep5: async (payload: Step5Payload): Promise<StepResponse> => {
    return apiRequest<StepResponse>(API_CONFIG.ENDPOINTS.CASE_SUBMISSION.STEP_5, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Step 6: Document Upload (file metadata)
  submitStep6: async (payload: Step6FormData): Promise<Step6Response> => {
    return apiRequest<Step6Response>(API_CONFIG.ENDPOINTS.CASE_SUBMISSION.STEP_6, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Final Submission
  submitCase: async (payload: FinalSubmissionPayload): Promise<FinalSubmissionResponse> => {
    return apiRequest<FinalSubmissionResponse>(API_CONFIG.ENDPOINTS.CASE_SUBMISSION.SUBMIT, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Get Draft Data
  getDraft: async (sessionId: string): Promise<SessionData> => {
    return apiRequest<SessionData>(`${API_CONFIG.ENDPOINTS.CASE_SUBMISSION.GET_DRAFT}/${sessionId}`, {
      method: 'GET',
    });
  },
};

// Session management utilities
export const sessionManager = {
  // Get current session ID from localStorage
  getSessionId: (): string | null => {
    return localStorage.getItem('case_submission_session_id');
  },

  // Store session ID in localStorage
  setSessionId: (sessionId: string): void => {
    localStorage.setItem('case_submission_session_id', sessionId);
  },

  // Clear session ID from localStorage
  clearSessionId: (): void => {
    localStorage.removeItem('case_submission_session_id');
  },

  // Party B related methods
  getIsPartyB: (): boolean => {
    return localStorage.getItem('case_submission_is_party_b') === 'true';
  },

  setIsPartyB: (isPartyB: boolean): void => {
    localStorage.setItem('case_submission_is_party_b', isPartyB.toString());
  },

  getParentSessionId: (): string | null => {
    return localStorage.getItem('case_submission_parent_session_id');
  },

  setParentSessionId: (parentSessionId: string): void => {
    localStorage.setItem('case_submission_parent_session_id', parentSessionId);
  },

  // Initialize or get existing session
  initializeSession: async (): Promise<string> => {
    let sessionId = sessionManager.getSessionId();

    if (!sessionId) {
      try {
        const response = await caseSubmissionService.createSession({
          startedAt: new Date().toISOString(),
        });
        sessionId = response.sessionId;
        sessionManager.setSessionId(sessionId);
      } catch (error) {
        throw new Error('Failed to create case submission session');
      }
    }

    return sessionId;
  },

  // Initialize Party B session by joining existing case
  joinAsPartyB: async (parentSessionId: string): Promise<string> => {
    try {
      const response = await caseSubmissionService.joinCase({
        parentSessionId,
      });

      sessionManager.setSessionId(response.sessionId);
      sessionManager.setIsPartyB(true);
      sessionManager.setParentSessionId(parentSessionId);
      sessionManager.setCurrentStep(1); // Start from step 1

      return response.sessionId;
    } catch (error) {
      throw error;
    }
  },

  // Store current step progress
  setCurrentStep: (step: number): void => {
    localStorage.setItem('case_submission_current_step', step.toString());
  },

  // Get current step progress
  getCurrentStep: (): number => {
    const step = localStorage.getItem('case_submission_current_step');
    return step ? parseInt(step, 10) : 1;
  },

  // Clear all session data
  clearSession: (): void => {
    sessionManager.clearSessionId();
    localStorage.removeItem('case_submission_current_step');
    localStorage.removeItem('case_submission_is_party_b');
    localStorage.removeItem('case_submission_parent_session_id');
  },
};

// Error handler utility
export const handleCaseSubmissionError = (error: unknown): string => {
  if (error instanceof Error) {
    try {
      const parsed = JSON.parse(error.message) as CaseSubmissionError;
      if (parsed.validationErrors) {
        return Object.values(parsed.validationErrors).join(', ');
      }
      return parsed.message || 'Something went wrong';
    } catch {
      return error.message;
    }
  }
  return 'An unexpected error occurred';
};