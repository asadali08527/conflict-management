# Case Submission API Integration Guide

This guide provides complete instructions for integrating the multi-step case submission API with your frontend application.

## Base URL
```
http://localhost:8000/api/case-submission
```

## Authentication
- Most endpoints support both authenticated and anonymous users
- Include JWT token in header if user is logged in: `Authorization: Bearer <token>`
- Anonymous submissions are supported for better user experience

---

## 1. Session Management

### Create New Session
**Endpoint:** `POST /session`
**Purpose:** Initialize a new case submission session

**Request Headers:**
```http
Content-Type: application/json
Authorization: Bearer <token> (optional)
```

**Request Body:**
```json
{
  "userId": "user-uuid",        // Optional - if user is logged in
  "startedAt": "2024-01-15T10:00:00Z"  // Optional - defaults to current time
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "sessionId": "45fafe52-7705-4810-94ef-c040f56301e6",
  "message": "Session created successfully",
  "startedAt": "2024-01-15T10:00:00Z"
}
```

**Frontend Usage:**
```javascript
const createSession = async () => {
  const response = await fetch('/api/case-submission/session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Include auth header if user is logged in
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    body: JSON.stringify({})
  });

  const data = await response.json();
  if (data.success) {
    localStorage.setItem('caseSessionId', data.sessionId);
    return data.sessionId;
  }
};
```

---

### Get Session Data
**Endpoint:** `GET /session/:sessionId`
**Purpose:** Retrieve current session data and progress

**Response (200 OK):**
```json
{
  "success": true,
  "sessionId": "45fafe52-7705-4810-94ef-c040f56301e6",
  "currentStep": 3,
  "completedSteps": [1, 2],
  "status": "draft",
  "data": {
    "caseOverview": { /* Step 1 data */ },
    "partiesInvolved": { /* Step 2 data */ }
  },
  "lastModified": "2024-01-15T10:45:00Z"
}
```

**Frontend Usage:**
```javascript
const getSessionData = async (sessionId) => {
  const response = await fetch(`/api/case-submission/session/${sessionId}`);
  const data = await response.json();

  if (data.success) {
    return {
      currentStep: data.currentStep,
      completedSteps: data.completedSteps,
      savedData: data.data
    };
  }
};
```

---

## 2. Step-by-Step Submission

### Step 1: Case Overview
**Endpoint:** `POST /step1`
**Purpose:** Submit basic conflict information

**Request Body:**
```json
{
  "stepId": 1,
  "sessionId": "45fafe52-7705-4810-94ef-c040f56301e6",
  "caseOverview": {
    "conflictType": "Family Conflict",           // Required - enum value
    "description": "Detailed description...",    // Required - 10-1000 chars
    "urgencyLevel": "medium",                    // Required - low/medium/high/urgent
    "estimatedValue": "5000"                     // Optional
  }
}
```

**Conflict Type Options:**
- "Business Dispute"
- "Family Conflict"
- "Workplace Issue"
- "Neighbor Dispute"
- "Contract Disagreement"
- "Property Dispute"
- "Consumer Complaint"
- "Partnership Conflict"
- "Employment Issue"
- "Other"

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Step 1 data saved successfully",
  "sessionId": "45fafe52-7705-4810-94ef-c040f56301e6",
  "nextStep": 2,
  "validationErrors": null
}
```

**Frontend Usage:**
```javascript
const submitStep1 = async (sessionId, formData) => {
  const payload = {
    stepId: 1,
    sessionId,
    caseOverview: {
      conflictType: formData.conflictType,
      description: formData.description,
      urgencyLevel: formData.urgencyLevel,
      estimatedValue: formData.estimatedValue || ""
    }
  };

  const response = await fetch('/api/case-submission/step1', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  return await response.json();
};
```

---

### Step 2: Parties Involved
**Endpoint:** `POST /step2`
**Purpose:** Collect information about all parties in the conflict

**Request Body:**
```json
{
  "stepId": 2,
  "sessionId": "45fafe52-7705-4810-94ef-c040f56301e6",
  "partiesInvolved": {
    "parties": [
      {
        "name": "John Doe",                    // Required - 2-100 chars
        "role": "Primary Claimant",           // Required - enum value
        "email": "john@example.com",          // Required - valid email
        "phone": "555-0123",                  // Optional
        "relationship": "Family Members"       // Required - enum value
      }
    ]
  }
}
```

**Role Options:**
- "Primary Claimant"
- "Respondent"
- "Business Owner"
- "Employee"
- "Customer"
- "Vendor/Supplier"
- "Family Member"
- "Neighbor"
- "Partner"
- "Other"

**Relationship Options:**
- "Business Partners"
- "Employer/Employee"
- "Customer/Business"
- "Family Members"
- "Neighbors"
- "Friends"
- "Colleagues"
- "Strangers"
- "Other"

**Frontend Usage:**
```javascript
const submitStep2 = async (sessionId, parties) => {
  const payload = {
    stepId: 2,
    sessionId,
    partiesInvolved: { parties }
  };

  const response = await fetch('/api/case-submission/step2', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  return await response.json();
};
```

---

### Step 3: Conflict Background
**Endpoint:** `POST /step3`
**Purpose:** Detailed conflict history and key issues

**Request Body:**
```json
{
  "stepId": 3,
  "sessionId": "45fafe52-7705-4810-94ef-c040f56301e6",
  "conflictBackground": {
    "timeline": "The conflict started in January...",           // Required - 20-2000 chars
    "keyIssues": [                                             // Required - 1-10 items
      "Communication breakdown",
      "Financial disagreements"
    ],
    "previousAttempts": "We tried mediation in March...",      // Required - 10-1000 chars
    "emotionalImpact": "This has caused significant stress..." // Required - 10-1000 chars
  }
}
```

**Frontend Usage:**
```javascript
const submitStep3 = async (sessionId, formData) => {
  const payload = {
    stepId: 3,
    sessionId,
    conflictBackground: {
      timeline: formData.timeline,
      keyIssues: formData.keyIssues, // Array of strings
      previousAttempts: formData.previousAttempts,
      emotionalImpact: formData.emotionalImpact
    }
  };

  const response = await fetch('/api/case-submission/step3', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  return await response.json();
};
```

---

### Step 4: Desired Outcomes
**Endpoint:** `POST /step4`
**Purpose:** What parties hope to achieve through mediation

**Request Body:**
```json
{
  "stepId": 4,
  "sessionId": "45fafe52-7705-4810-94ef-c040f56301e6",
  "desiredOutcomes": {
    "primaryGoals": [                                    // Required - 1-5 items
      "Reach fair financial settlement",
      "Improve communication"
    ],
    "successMetrics": "Clear agreement on responsibilities", // Required - 10-500 chars
    "constraints": "Must complete within 60 days",          // Required - 10-500 chars
    "timeline": "2-3 months"                                // Required - 5-200 chars
  }
}
```

**Frontend Usage:**
```javascript
const submitStep4 = async (sessionId, formData) => {
  const payload = {
    stepId: 4,
    sessionId,
    desiredOutcomes: {
      primaryGoals: formData.primaryGoals, // Array of strings
      successMetrics: formData.successMetrics,
      constraints: formData.constraints,
      timeline: formData.timeline
    }
  };

  const response = await fetch('/api/case-submission/step4', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  return await response.json();
};
```

---

### Step 5: Scheduling Preferences
**Endpoint:** `POST /step5`
**Purpose:** Logistics and communication preferences

**Request Body:**
```json
{
  "stepId": 5,
  "sessionId": "45fafe52-7705-4810-94ef-c040f56301e6",
  "schedulingPreferences": {
    "availability": [                              // Required - min 1 item
      "Weekdays 9AM-5PM",
      "Weekend mornings"
    ],
    "preferredLocation": "online",                 // Required - online/in-person/hybrid
    "timeZone": "America/New_York",               // Required
    "communicationPreference": "email"            // Required - email/phone/text/app
  }
}
```

**Frontend Usage:**
```javascript
const submitStep5 = async (sessionId, formData) => {
  const payload = {
    stepId: 5,
    sessionId,
    schedulingPreferences: {
      availability: formData.availability, // Array of strings
      preferredLocation: formData.preferredLocation,
      timeZone: formData.timeZone,
      communicationPreference: formData.communicationPreference
    }
  };

  const response = await fetch('/api/case-submission/step5', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  return await response.json();
};
```

---

### Step 6: Document Upload
**Endpoint:** `POST /step6`
**Purpose:** Upload supporting documents
**Content-Type:** `multipart/form-data`

**Form Data Structure:**
```javascript
const formData = new FormData();
formData.append('stepId', '6');
formData.append('sessionId', sessionId);

// Add files
files.forEach((file, index) => {
  formData.append('files', file);
});

// Add descriptions (optional)
const descriptions = ['Contract document', 'Email correspondence'];
formData.append('descriptions', JSON.stringify(descriptions));
```

**File Constraints:**
- Max file size: 10MB per file
- Max files: 5 total
- Supported formats: PDF, DOC, DOCX, JPG, PNG, TXT

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Step 6 data saved successfully",
  "sessionId": "45fafe52-7705-4810-94ef-c040f56301e6",
  "uploadedFiles": [
    {
      "fileName": "contract.pdf",
      "fileSize": 1024000,
      "fileType": "application/pdf",
      "uploadUrl": "https://storage.example.com/files/uuid-file-id"
    }
  ],
  "nextStep": "final_submission",
  "validationErrors": null
}
```

**Frontend Usage:**
```javascript
const submitStep6 = async (sessionId, files, descriptions = []) => {
  const formData = new FormData();
  formData.append('stepId', '6');
  formData.append('sessionId', sessionId);

  files.forEach((file) => {
    formData.append('files', file);
  });

  if (descriptions.length > 0) {
    formData.append('descriptions', JSON.stringify(descriptions));
  }

  const response = await fetch('/api/case-submission/step6', {
    method: 'POST',
    body: formData // Don't set Content-Type header for FormData
  });

  return await response.json();
};
```

---

## 3. Final Submission

### Complete Case Submission
**Endpoint:** `POST /submit`
**Purpose:** Submit the complete case for processing

**Request Body:**
```json
{
  "sessionId": "45fafe52-7705-4810-94ef-c040f56301e6",
  "submittedAt": "2024-01-15T10:30:00Z",      // Optional - defaults to current time
  "submitterUserId": "user-uuid"              // Optional - if user is logged in
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "caseId": "CASE-2024-001234",
  "message": "Case submitted successfully",
  "estimatedProcessingTime": "2-3 business days",
  "nextSteps": "You will receive a confirmation email within 24 hours",
  "trackingUrl": "/case/CASE-2024-001234/status"
}
```

**Frontend Usage:**
```javascript
const submitCase = async (sessionId, userId = null) => {
  const payload = {
    sessionId,
    submittedAt: new Date().toISOString(),
    ...(userId && { submitterUserId: userId })
  };

  const response = await fetch('/api/case-submission/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const result = await response.json();

  if (result.success) {
    // Clear session data from localStorage
    localStorage.removeItem('caseSessionId');

    // Redirect to success page or show confirmation
    return result;
  }

  throw new Error(result.message);
};
```

---

## 4. Error Handling

### Validation Errors
```json
{
  "success": false,
  "status": "error",
  "message": "conflictType is required"
}
```

### Session Not Found
```json
{
  "success": false,
  "error": "SESSION_NOT_FOUND",
  "message": "Session not found"
}
```

### File Upload Errors
```json
{
  "success": false,
  "error": "FILE_UPLOAD_ERROR",
  "message": "File size too large. Maximum 10MB per file."
}
```

### Rate Limiting
```json
{
  "success": false,
  "error": "RATE_LIMIT_ERROR",
  "message": "Too many requests"
}
```

**Frontend Error Handling:**
```javascript
const handleApiError = (response) => {
  if (!response.success) {
    switch (response.error) {
      case 'SESSION_NOT_FOUND':
        // Redirect to create new session
        break;
      case 'VALIDATION_ERROR':
        // Show validation errors on form
        break;
      case 'FILE_UPLOAD_ERROR':
        // Show file upload specific error
        break;
      default:
        // Show generic error message
        break;
    }
  }
};
```

---

## 5. Complete Integration Example

### React Hook for Case Submission
```javascript
import { useState, useEffect } from 'react';

export const useCaseSubmission = () => {
  const [sessionId, setSessionId] = useState(
    localStorage.getItem('caseSessionId')
  );
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [savedData, setSavedData] = useState({});

  // Initialize session
  const initializeSession = async () => {
    if (!sessionId) {
      const response = await fetch('/api/case-submission/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      const data = await response.json();
      if (data.success) {
        setSessionId(data.sessionId);
        localStorage.setItem('caseSessionId', data.sessionId);
      }
    }
  };

  // Load existing session data
  const loadSessionData = async () => {
    if (!sessionId) return;

    const response = await fetch(`/api/case-submission/session/${sessionId}`);
    const data = await response.json();

    if (data.success) {
      setCurrentStep(data.currentStep);
      setCompletedSteps(data.completedSteps);
      setSavedData(data.data);
    }
  };

  // Submit step data
  const submitStep = async (step, stepData) => {
    const endpoint = `/api/case-submission/step${step}`;
    const payload = {
      stepId: step,
      sessionId,
      ...stepData
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.success) {
      setCompletedSteps(prev => [...prev, step]);
      setCurrentStep(result.nextStep === 'final_submission' ? 7 : result.nextStep);
    }

    return result;
  };

  // Submit files (Step 6)
  const submitFiles = async (files, descriptions = []) => {
    const formData = new FormData();
    formData.append('stepId', '6');
    formData.append('sessionId', sessionId);

    files.forEach(file => formData.append('files', file));
    if (descriptions.length) {
      formData.append('descriptions', JSON.stringify(descriptions));
    }

    const response = await fetch('/api/case-submission/step6', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (result.success) {
      setCompletedSteps(prev => [...prev, 6]);
      setCurrentStep(7);
    }

    return result;
  };

  // Final submission
  const submitCase = async (userId = null) => {
    const response = await fetch('/api/case-submission/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        submittedAt: new Date().toISOString(),
        ...(userId && { submitterUserId: userId })
      })
    });

    const result = await response.json();

    if (result.success) {
      localStorage.removeItem('caseSessionId');
      setSessionId(null);
    }

    return result;
  };

  useEffect(() => {
    initializeSession();
  }, []);

  useEffect(() => {
    if (sessionId) {
      loadSessionData();
    }
  }, [sessionId]);

  return {
    sessionId,
    currentStep,
    completedSteps,
    savedData,
    submitStep,
    submitFiles,
    submitCase,
    initializeSession
  };
};
```

### Usage in Component
```javascript
import { useCaseSubmission } from './hooks/useCaseSubmission';

const CaseSubmissionForm = () => {
  const {
    currentStep,
    completedSteps,
    savedData,
    submitStep,
    submitFiles,
    submitCase
  } = useCaseSubmission();

  const handleStep1Submit = async (formData) => {
    try {
      const result = await submitStep(1, {
        caseOverview: formData
      });

      if (result.success) {
        // Move to next step
        setActiveStep(2);
      }
    } catch (error) {
      console.error('Step 1 submission failed:', error);
    }
  };

  // Render step components based on currentStep
  return (
    <div>
      {currentStep === 1 && (
        <CaseOverviewStep
          onSubmit={handleStep1Submit}
          initialData={savedData.caseOverview}
        />
      )}
      {/* Other steps... */}
    </div>
  );
};
```

---

## 6. Testing Endpoints

You can test all endpoints using curl or Postman. Here are some example curl commands:

```bash
# Create session
curl -X POST http://localhost:8000/api/case-submission/session \
  -H "Content-Type: application/json" \
  -d '{}'

# Submit Step 1
curl -X POST http://localhost:8000/api/case-submission/step1 \
  -H "Content-Type: application/json" \
  -d '{
    "stepId": 1,
    "sessionId": "YOUR_SESSION_ID",
    "caseOverview": {
      "conflictType": "Family Conflict",
      "description": "Test description with more than 10 characters",
      "urgencyLevel": "medium"
    }
  }'

# Get session data
curl -X GET http://localhost:8000/api/case-submission/session/YOUR_SESSION_ID
```

This guide provides everything needed for seamless frontend integration with the case submission API. All endpoints are tested and working correctly.