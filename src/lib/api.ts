export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  ENDPOINTS: {
    AUTH: {
      REGISTER: '/api/auth/register',
      LOGIN: '/api/auth/login',
      GOOGLE: '/api/auth/google',
    },
    ADMIN: {
      AUTH: {
        LOGIN: '/api/admin/auth/login',
        REGISTER: '/api/admin/auth/register',
      },
      DASHBOARD: {
        STATS: '/api/admin/dashboard/stats',
      },
      STATISTICS: {
        BY_ADMIN: '/api/admin/statistics/by-admin',
      },
      CASES: {
        LIST: '/api/admin/cases',
        DETAILED: (id: string) => `/api/admin/cases/${id}/detailed`,
        FILES: (id: string) => `/api/admin/cases/${id}/files`,
        MY_ASSIGNMENTS: '/api/admin/cases/my-assignments',
        UPDATE_STATUS: (id: string) => `/api/admin/cases/${id}/status`,
        ASSIGN: (id: string) => `/api/admin/cases/${id}/assign`,
        UNASSIGN: (id: string) => `/api/admin/cases/${id}/unassign`,
        UPDATE_PRIORITY: (id: string) => `/api/admin/cases/${id}/priority`,
        ADD_NOTE: (id: string) => `/api/admin/cases/${id}/notes`,
        MEETINGS: (caseId: string) => `/api/admin/cases/${caseId}/meetings`,
      },
      USERS: {
        LIST: '/api/admin/users',
        ADMINS: '/api/admin/users/admins',
        TOGGLE_STATUS: (id: string) => `/api/admin/users/${id}/toggle-status`,
      },
      MEETINGS: {
        CREATE: '/api/admin/meetings',
        LIST: '/api/admin/meetings',
        GET: (id: string) => `/api/admin/meetings/${id}`,
        UPDATE: (id: string) => `/api/admin/meetings/${id}`,
        CANCEL: (id: string) => `/api/admin/meetings/${id}/cancel`,
      },
      PANELISTS: {
        LIST: '/api/panelists',
        CREATE: '/api/panelists',
        GET: (id: string) => `/api/panelists/${id}`,
        UPDATE: (id: string) => `/api/panelists/${id}`,
        DEACTIVATE: (id: string) => `/api/panelists/${id}`,
        AVAILABLE: '/api/panelists/available',
        STATISTICS: '/api/panelists/statistics',
        GET_CASES: (id: string) => `/api/panelists/${id}/cases`,
        ASSIGN_PANEL: (caseId: string) =>
          `/api/panelists/cases/${caseId}/assign-panel`,
        REMOVE_PANELIST: (caseId: string, panelistId: string) =>
          `/api/panelists/cases/${caseId}/panelists/${panelistId}`,
        CREATE_ACCOUNT: (id: string) => `/api/panelists/${id}/create-account`,
        RESET_PASSWORD: (id: string) => `/api/panelists/${id}/reset-password`,
        PERFORMANCE: (id: string) => `/api/panelists/${id}/performance`,
      },
      PANEL: {
        STATISTICS: '/api/admin/statistics/panel',
      },
    },
    CASE_SUBMISSION: {
      CREATE_SESSION: '/api/case-submission/session',
      JOIN_CASE: '/api/case-submission/join-case',
      GET_SESSION: '/api/case-submission/session',
      STEP_1: '/api/case-submission/step1',
      STEP_2: '/api/case-submission/step2',
      STEP_3: '/api/case-submission/step3',
      STEP_4: '/api/case-submission/step4',
      STEP_5: '/api/case-submission/step5',
      STEP_6: '/api/case-submission/step6',
      SUBMIT: '/api/case-submission/submit',
      GET_DRAFT: '/api/case-submission/draft',
    },
    FILES: {
      CONFIG: '/api/files/config',
      GENERATE_UPLOAD_URL: '/api/files/generate-upload-url',
      SAVE_FILE_RECORD: '/api/files/save-file-record',
      DOWNLOAD_URL: (fileKey: string) =>
        `/api/files/download-url/${encodeURIComponent(fileKey)}`,
      DELETE: (fileKey: string) => `/api/files/${encodeURIComponent(fileKey)}`,
    },
  },
};

export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

export const getAuthHeaders = (
  includeContentType: boolean = true
): HeadersInit => {
  const token = localStorage.getItem('auth_token');

  console.log('🔑 Raw token from localStorage:', token);
  console.log('🔑 Token length:', token?.length);
  console.log('🔑 First 20 chars:', token?.substring(0, 20));

  return {
    ...(includeContentType && { 'Content-Type': 'application/json' }),
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  // Check if the body is FormData to avoid setting Content-Type header
  const isFormData = options.body instanceof FormData;

  const headers = isFormData
    ? getAuthHeaders(false) // Don't include Content-Type for FormData
    : getAuthHeaders(true); // Include Content-Type for JSON

  // ✅ ADD THIS DEBUG LOG
  console.log('📤 Request Headers Object:', headers);
  console.log('📤 Authorization header:', headers['Authorization']);
  console.log('📤 Endpoint:', endpoint);

  try {
    const response = await fetch(getApiUrl(endpoint), {
      headers,
      ...options,
      // Disable caching to avoid 304 responses that have no body
      cache: 'no-cache',
    });

    console.log(`API Request: ${endpoint}, Status: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    // Parse JSON response
    const data = await response.json();
    console.log(`API Response for ${endpoint}:`, data);
    return data;
  } catch (error) {
    console.error(`API Error for ${endpoint}:`, error);
    throw error;
  }
};
