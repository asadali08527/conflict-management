# Case Submission API Guide

This document outlines the step-by-step case submission process and the corresponding backend API endpoints needed to support the frontend `/submit-case` page.

## Overview

The case submission process consists of **6 sequential steps**, each requiring separate API endpoints for data validation, temporary storage, and final submission. The frontend collects data progressively and allows users to navigate between steps.

## Frontend Route Structure

- **Main Page**: `/submit-case` → `CaseSubmission.tsx`
- **Form Component**: `CaseSubmissionForm.tsx`
- **Steps**: 6 individual step components in `/components/case-submission/steps/`

---

## Step-by-Step API Requirements

### Step 1: Case Overview
**Route**: `CaseOverviewStep.tsx`
**Purpose**: Collect basic conflict information and priority level

#### API Endpoint: `POST /api/case-submission/step1`

**Payload Structure**:
```json
{
  "stepId": 1,
  "sessionId": "uuid-session-id",
  "caseOverview": {
    "conflictType": "string", // Required - One of: Business Dispute, Family Conflict, Workplace Issue, Neighbor Dispute, Contract Disagreement, Property Dispute, Consumer Complaint, Partnership Conflict, Employment Issue, Other
    "description": "string", // Required - Brief overview text (min 10 chars, max 1000 chars)
    "urgencyLevel": "string", // Required - One of: low, medium, high, urgent
    "estimatedValue": "string" // Optional - Financial impact estimate
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Step 1 data saved successfully",
  "sessionId": "uuid-session-id",
  "nextStep": 2,
  "validationErrors": null
}
```

**Validation Rules**:
- `conflictType`: Must be from predefined list
- `description`: Required, 10-1000 characters
- `urgencyLevel`: Required, valid enum value
- `estimatedValue`: Optional string

---

### Step 2: Parties Involved
**Route**: `PartiesInvolvedStep.tsx`
**Purpose**: Collect information about all parties in the conflict

#### API Endpoint: `POST /api/case-submission/step2`

**Payload Structure**:
```json
{
  "stepId": 2,
  "sessionId": "uuid-session-id",
  "partiesInvolved": {
    "parties": [
      {
        "name": "string", // Required - Full name
        "role": "string", // Required - One of: Primary Claimant, Respondent, Business Owner, Employee, Customer, Vendor/Supplier, Family Member, Neighbor, Partner, Other
        "email": "string", // Required - Valid email format
        "phone": "string", // Optional - Phone number
        "relationship": "string" // Required - One of: Business Partners, Employer/Employee, Customer/Business, Family Members, Neighbors, Friends, Colleagues, Strangers, Other
      }
    ]
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Step 2 data saved successfully",
  "sessionId": "uuid-session-id",
  "nextStep": 3,
  "validationErrors": null
}
```

**Validation Rules**:
- Minimum 1 party required
- First party is always the submitter (Primary Party)
- `name`: Required, 2-100 characters
- `email`: Required, valid email format
- `role` and `relationship`: Must be from predefined lists
- `phone`: Optional, valid phone format if provided

---

### Step 3: Conflict Background
**Route**: `ConflictBackgroundStep.tsx`
**Purpose**: Detailed conflict history and key issues

#### API Endpoint: `POST /api/case-submission/step3`

**Payload Structure**:
```json
{
  "stepId": 3,
  "sessionId": "uuid-session-id",
  "conflictBackground": {
    "timeline": "string", // Required - When/how conflict started and evolved
    "keyIssues": ["string"], // Required - Array of main issues (1-10 items)
    "previousAttempts": "string", // Required - Previous resolution attempts
    "emotionalImpact": "string" // Required - How conflict affects parties emotionally
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Step 3 data saved successfully",
  "sessionId": "uuid-session-id",
  "nextStep": 4,
  "validationErrors": null
}
```

**Validation Rules**:
- `timeline`: Required, 20-2000 characters
- `keyIssues`: Required array, 1-10 items, each 5-200 characters
- `previousAttempts`: Required, 10-1000 characters
- `emotionalImpact`: Required, 10-1000 characters

---

### Step 4: Desired Outcomes
**Route**: `DesiredOutcomesStep.tsx`
**Purpose**: What parties hope to achieve through mediation

#### API Endpoint: `POST /api/case-submission/step4`

**Payload Structure**:
```json
{
  "stepId": 4,
  "sessionId": "uuid-session-id",
  "desiredOutcomes": {
    "primaryGoals": ["string"], // Required - Main objectives (1-5 items)
    "successMetrics": "string", // Required - How to measure successful resolution
    "constraints": "string", // Required - Any limitations or non-negotiables
    "timeline": "string" // Required - Desired resolution timeframe
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Step 4 data saved successfully",
  "sessionId": "uuid-session-id",
  "nextStep": 5,
  "validationErrors": null
}
```

**Validation Rules**:
- `primaryGoals`: Required array, 1-5 items, each 5-200 characters
- `successMetrics`: Required, 10-500 characters
- `constraints`: Required, 10-500 characters
- `timeline`: Required, 5-200 characters

---

### Step 5: Scheduling Preferences
**Route**: `SchedulingPreferencesStep.tsx`
**Purpose**: Logistics and communication preferences

#### API Endpoint: `POST /api/case-submission/step5`

**Payload Structure**:
```json
{
  "stepId": 5,
  "sessionId": "uuid-session-id",
  "schedulingPreferences": {
    "availability": ["string"], // Required - Available time slots/days
    "preferredLocation": "string", // Required - One of: online, in-person, hybrid
    "timeZone": "string", // Required - User's timezone
    "communicationPreference": "string" // Required - One of: email, phone, text, app
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Step 5 data saved successfully",
  "sessionId": "uuid-session-id",
  "nextStep": 6,
  "validationErrors": null
}
```

**Validation Rules**:
- `availability`: Required array, minimum 1 time slot
- `preferredLocation`: Required enum value
- `timeZone`: Required, valid timezone string
- `communicationPreference`: Required enum value

---

### Step 6: Document Upload
**Route**: `DocumentUploadStep.tsx`
**Purpose**: Upload supporting documents

#### API Endpoint: `POST /api/case-submission/step6`

**Payload Structure** (Multipart Form Data):
```javascript
// FormData structure
{
  stepId: 6,
  sessionId: "uuid-session-id",
  files: [File], // Optional - Array of uploaded files
  descriptions: ["string"] // Optional - Descriptions for each file
}
```

**Response**:
```json
{
  "success": true,
  "message": "Step 6 data saved successfully",
  "sessionId": "uuid-session-id",
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

**Validation Rules**:
- Files are optional
- Max file size: 10MB per file
- Max 5 files total
- Supported formats: PDF, DOC, DOCX, JPG, PNG, TXT
- If files provided, descriptions array must match files array length

---

## Final Submission

### Complete Case Submission
**Purpose**: Submit the complete case for processing

#### API Endpoint: `POST /api/case-submission/submit`

**Payload Structure**:
```json
{
  "sessionId": "uuid-session-id",
  "submittedAt": "2024-01-15T10:30:00Z",
  "submitterUserId": "user-uuid" // If user is authenticated
}
```

**Response**:
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

---

## Supporting API Endpoints

### Session Management

#### Create Session: `POST /api/case-submission/session`
```json
{
  "userId": "user-uuid", // Optional if user is logged in
  "startedAt": "2024-01-15T10:00:00Z"
}
```

#### Get Session Data: `GET /api/case-submission/session/{sessionId}`
Returns all saved data for the session across all steps.

#### Update Session: `PATCH /api/case-submission/session/{sessionId}`
Update session metadata (last active, current step, etc.)

### Data Retrieval

#### Get Case Draft: `GET /api/case-submission/draft/{sessionId}`
```json
{
  "sessionId": "uuid",
  "currentStep": 3,
  "completedSteps": [1, 2],
  "data": {
    "caseOverview": { /* step 1 data */ },
    "partiesInvolved": { /* step 2 data */ },
    "conflictBackground": { /* step 3 data */ }
    // ... other completed steps
  },
  "lastModified": "2024-01-15T10:45:00Z"
}
```

---

## Database Schema Recommendations

### Tables Needed:

1. **case_submissions**
   - `id` (Primary Key)
   - `case_id` (Unique case identifier)
   - `session_id` (UUID)
   - `user_id` (Foreign Key, nullable)
   - `status` (draft, submitted, processing, completed)
   - `current_step` (1-6)
   - `created_at`, `updated_at`, `submitted_at`

2. **case_submission_data**
   - `session_id` (Foreign Key)
   - `step_id` (1-6)
   - `data` (JSON field containing step data)
   - `completed` (boolean)
   - `created_at`, `updated_at`

3. **case_files**
   - `id` (Primary Key)
   - `session_id` (Foreign Key)
   - `file_name`, `file_size`, `file_type`
   - `storage_path`, `description`
   - `created_at`

---

## Testing Strategy

### Unit Tests for Each Endpoint:
1. **Valid payload handling**
2. **Validation error responses**
3. **Session continuity**
4. **Data persistence**
5. **File upload handling**

### Integration Tests:
1. **Complete flow from step 1 to final submission**
2. **Session recovery after interruption**
3. **Cross-step data validation**
4. **File processing and storage**

### Test Data:
Create sample payloads for each step that can be used for development and testing.

---

## Error Handling

### Common Error Responses:
```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Required fields missing",
  "validationErrors": {
    "conflictType": "This field is required",
    "description": "Description must be at least 10 characters"
  },
  "stepId": 1
}
```

### Error Types:
- `VALIDATION_ERROR`: Field validation failures
- `SESSION_NOT_FOUND`: Invalid session ID
- `FILE_UPLOAD_ERROR`: File processing issues
- `RATE_LIMIT_ERROR`: Too many requests
- `SERVER_ERROR`: Internal server errors

This guide provides the complete specification for implementing the backend APIs that support the case submission frontend process.