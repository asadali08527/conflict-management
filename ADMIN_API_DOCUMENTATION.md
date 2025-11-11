# Admin API Documentation

Complete API reference for frontend integration with the conflict management system admin panel.

**Base URL:** `/api/admin`

**Authentication:** All endpoints (except auth routes) require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## 📋 Table of Contents
1. [Authentication](#authentication)
2. [Dashboard & Statistics](#dashboard--statistics)
3. [Case Management](#case-management)
4. [User Management](#user-management)
5. [Meeting Management](#meeting-management)
6. [Data Models](#data-models)

---

## 🔐 Authentication

### Register Admin
Create a new admin account.

**Endpoint:** `POST /api/admin/auth/register`

**Access:** Public (but forces admin role)

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "admin@example.com",
  "password": "securePassword123",
  "phone": "+1234567890"
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "Admin registered successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "email": "admin@example.com",
      "phone": "+1234567890",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Login Admin
Authenticate an admin user.

**Endpoint:** `POST /api/admin/auth/login`

**Access:** Public

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Admin login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "email": "admin@example.com",
      "phone": "+1234567890",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `401`: Invalid credentials or inactive account

---

## 📊 Dashboard & Statistics

### Get Dashboard Statistics
Get overall system statistics for the dashboard.

**Endpoint:** `GET /api/admin/dashboard/stats`

**Access:** Private (Admin only)

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "cases": {
      "total": 150,
      "open": 25,
      "assigned": 40,
      "resolved": 60,
      "closed": 25,
      "recent": 12
    },
    "users": {
      "total": 320,
      "active": 300,
      "admins": 8,
      "clients": 312
    },
    "casesByType": {
      "marriage": 80,
      "land": 30,
      "property": 25,
      "family": 15
    }
  }
}
```

---

### Get Case Statistics by Admin
Get case statistics grouped by admin/mediator.

**Endpoint:** `GET /api/admin/statistics/by-admin`

**Access:** Private (Admin only)

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "statistics": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "adminName": "John Doe",
        "adminEmail": "admin@example.com",
        "totalCases": 45,
        "openCases": 5,
        "assignedCases": 15,
        "inProgressCases": 10,
        "resolvedCases": 10,
        "closedCases": 5,
        "activeCases": 25
      }
    ]
  }
}
```

---

## 📁 Case Management

### Get All Cases
Retrieve paginated list of all cases with filtering and sorting.

**Endpoint:** `GET /api/admin/cases`

**Access:** Private (Admin only)

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10) - Items per page
- `status` (string) - Filter by status: `open`, `assigned`, `in_progress`, `resolved`, `closed`
- `type` (string) - Filter by type: `marriage`, `land`, `property`, `family`
- `priority` (string) - Filter by priority: `low`, `medium`, `high`, `urgent`
- `sortBy` (string, default: "createdAt") - Field to sort by
- `sortOrder` (string, default: "desc") - Sort order: `asc` or `desc`
- `search` (string) - Search in title, description, or party names

**Example:** `GET /api/admin/cases?page=1&limit=20&status=open&priority=high&search=divorce`

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "cases": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "caseId": "CASE-2025-123456",
        "title": "Marriage - Divorce proceedings between...",
        "description": "Detailed description of the case...",
        "type": "marriage",
        "status": "open",
        "priority": "high",
        "createdBy": {
          "_id": "507f191e810c19729de860ea",
          "firstName": "Jane",
          "lastName": "Smith",
          "email": "jane@example.com"
        },
        "assignedTo": null,
        "assignedAt": null,
        "parties": [
          {
            "name": "Jane Smith",
            "contact": "jane@example.com",
            "role": "Party A"
          },
          {
            "name": "John Smith",
            "contact": "john@example.com",
            "role": "Party B"
          }
        ],
        "documents": [],
        "notes": [],
        "hasPartyBResponse": true,
        "partyBSubmissionStatus": "submitted",
        "sessionId": "uuid-session-id",
        "linkedSessionId": "uuid-linked-session-id",
        "createdAt": "2025-01-15T10:30:00.000Z",
        "updatedAt": "2025-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "current": 1,
      "pages": 8,
      "total": 150,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

### Get Case with Detailed Party Information
Get comprehensive case details including both parties' submissions, documents, and meetings.

**Endpoint:** `GET /api/admin/cases/:id/detailed`

**Access:** Private (Admin only)

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "case": {
      "_id": "507f1f77bcf86cd799439011",
      "caseId": "CASE-2025-123456",
      "title": "Marriage - Divorce proceedings...",
      "description": "Detailed description...",
      "type": "marriage",
      "status": "assigned",
      "priority": "high",
      "createdBy": { "firstName": "Jane", "lastName": "Smith", "email": "jane@example.com" },
      "assignedTo": { "firstName": "Admin", "lastName": "User", "email": "admin@example.com" },
      "parties": [
        { "name": "Jane Smith", "contact": "jane@example.com", "role": "Party A" },
        { "name": "John Smith", "contact": "john@example.com", "role": "Party B" }
      ],
      "createdAt": "2025-01-15T10:30:00.000Z"
    },
    "partyA": {
      "sessionId": "uuid-party-a-session",
      "status": "submitted",
      "submittedAt": "2025-01-15T11:00:00.000Z",
      "steps": {
        "step1": { "conflictType": "Marriage/Divorce", "description": "...", "urgencyLevel": "high" },
        "step2": { "parties": [...] },
        "step3": { "conflictBackground": "..." },
        "step4": { "desiredOutcomes": "..." },
        "step5": { "schedulingPreferences": "..." },
        "step6": { "uploadedFiles": [...] }
      },
      "documents": [
        {
          "fileName": "marriage_certificate.pdf",
          "fileSize": 123456,
          "fileType": "application/pdf",
          "uploadUrl": "https://s3.amazonaws.com/...",
          "description": "Marriage certificate",
          "uploadedAt": "2025-01-15T10:45:00.000Z"
        }
      ]
    },
    "partyB": {
      "sessionId": "uuid-party-b-session",
      "status": "submitted",
      "submittedAt": "2025-01-16T09:00:00.000Z",
      "steps": { /* Same structure as Party A */ },
      "documents": [ /* Same structure as Party A */ ]
    },
    "hasPartyBResponse": true,
    "meetings": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "title": "Initial Mediation Session",
        "scheduledDate": "2025-01-20T14:00:00.000Z",
        "status": "scheduled",
        "meetingType": "video"
      }
    ]
  }
}
```

---

### Get Case Files
Retrieve all files associated with a case from both parties.

**Endpoint:** `GET /api/admin/cases/:id/files`

**Access:** Private (Admin only)

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "caseId": "507f1f77bcf86cd799439011",
    "caseIdFormatted": "CASE-2025-123456",
    "caseTitle": "Marriage - Divorce proceedings...",
    "caseDocuments": [
      {
        "name": "case_summary.pdf",
        "url": "https://s3.amazonaws.com/...",
        "key": "cases/...",
        "size": 234567,
        "mimetype": "application/pdf",
        "uploadedAt": "2025-01-15T10:30:00.000Z"
      }
    ],
    "submissionFiles": [
      {
        "party": "Party A",
        "sessionId": "uuid-session-id",
        "files": [
          {
            "id": "507f1f77bcf86cd799439013",
            "fileName": "marriage_certificate.pdf",
            "fileSize": 123456,
            "fileType": "application/pdf",
            "uploadUrl": "https://s3.amazonaws.com/...",
            "storageKey": "submissions/...",
            "description": "Marriage certificate",
            "uploadedAt": "2025-01-15T10:45:00.000Z"
          }
        ]
      },
      {
        "party": "Party B",
        "sessionId": "uuid-linked-session-id",
        "files": [ /* Same structure */ ]
      }
    ],
    "totalFiles": 5
  }
}
```

---

### Get My Assigned Cases
Get cases assigned to the logged-in admin.

**Endpoint:** `GET /api/admin/cases/my-assignments`

**Access:** Private (Admin only)

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `status` (string) - Filter by status
- `type` (string) - Filter by type
- `priority` (string) - Filter by priority
- `sortBy` (string, default: "assignedAt")
- `sortOrder` (string, default: "desc")

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "cases": [ /* Same structure as Get All Cases */ ],
    "pagination": {
      "current": 1,
      "pages": 3,
      "total": 25,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

### Update Case Status
Update the status of a case with optional resolution details.

**Endpoint:** `PATCH /api/admin/cases/:id/status`

**Access:** Private (Admin only)

**Request Body:**
```json
{
  "status": "in_progress",
  "resolutionDetails": "Initial mediation completed, progress noted...",
  "adminFeedback": "Both parties cooperative, looking positive",
  "nextSteps": "Schedule follow-up session in 2 weeks"
}
```

**Valid Status Values:** `open`, `assigned`, `in_progress`, `resolved`, `closed`

**Response (200):**
```json
{
  "status": "success",
  "message": "Case status updated successfully",
  "data": {
    "case": { /* Full case object with updated status */ }
  }
}
```

**Note:** When status is `resolved` or `closed` and `resolutionDetails` is provided, it's automatically added as a case note.

---

### Assign Case to Admin
Assign a case to an admin/mediator.

**Endpoint:** `PATCH /api/admin/cases/:id/assign`

**Access:** Private (Admin only)

**Request Body:**
```json
{
  "assignedTo": "507f1f77bcf86cd799439011"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Case assigned successfully",
  "data": {
    "case": {
      "_id": "507f1f77bcf86cd799439011",
      "status": "assigned",
      "assignedTo": {
        "_id": "507f1f77bcf86cd799439012",
        "firstName": "Admin",
        "lastName": "User",
        "email": "admin@example.com"
      },
      "assignedAt": "2025-01-15T14:30:00.000Z"
    }
  }
}
```

**Error Responses:**
- `404`: User to assign not found
- `400`: Can only assign to admin users

---

### Unassign Case
Remove assignment from a case.

**Endpoint:** `PATCH /api/admin/cases/:id/unassign`

**Access:** Private (Admin only)

**Response (200):**
```json
{
  "status": "success",
  "message": "Case unassigned successfully",
  "data": {
    "case": {
      "_id": "507f1f77bcf86cd799439011",
      "status": "open",
      "assignedTo": null,
      "assignedAt": null
    }
  }
}
```

---

### Update Case Priority
Change the priority level of a case.

**Endpoint:** `PATCH /api/admin/cases/:id/priority`

**Access:** Private (Admin only)

**Request Body:**
```json
{
  "priority": "urgent"
}
```

**Valid Priority Values:** `low`, `medium`, `high`, `urgent`

**Response (200):**
```json
{
  "status": "success",
  "message": "Case priority updated successfully",
  "data": {
    "case": { /* Full case object with updated priority */ }
  }
}
```

---

### Add Case Note
Add an admin note to a case.

**Endpoint:** `POST /api/admin/cases/:id/notes`

**Access:** Private (Admin only)

**Request Body:**
```json
{
  "content": "Contacted Party A, scheduled initial meeting",
  "noteType": "UPDATE"
}
```

**Optional noteType values:** Any string (e.g., "UPDATE", "FEEDBACK", "RESOLUTION", "CONTACT")

**Response (201):**
```json
{
  "status": "success",
  "message": "Note added successfully",
  "data": {
    "case": { /* Full case object with notes */ },
    "addedNote": {
      "content": "[UPDATE] Contacted Party A, scheduled initial meeting",
      "createdBy": "507f1f77bcf86cd799439011",
      "createdAt": "2025-01-15T15:00:00.000Z"
    }
  }
}
```

---

## 👥 User Management

### Get All Users
Retrieve paginated list of all users with filtering.

**Endpoint:** `GET /api/admin/users`

**Access:** Private (Admin only)

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `role` (string) - Filter by role: `admin` or `client`
- `isActive` (boolean) - Filter by active status: `true` or `false`
- `sortBy` (string, default: "createdAt")
- `sortOrder` (string, default: "desc")
- `search` (string) - Search in firstName, lastName, or email

**Example:** `GET /api/admin/users?page=1&role=client&isActive=true&search=john`

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "users": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "role": "client",
        "isActive": true,
        "createdAt": "2025-01-01T10:00:00.000Z"
      }
    ],
    "pagination": {
      "current": 1,
      "pages": 16,
      "total": 312,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

### Get Admin Users
Get list of all active admin users with case statistics (useful for case assignment).

**Endpoint:** `GET /api/admin/users/admins`

**Access:** Private (Admin only)

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "admins": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "firstName": "Admin",
        "lastName": "User",
        "email": "admin@example.com",
        "phone": "+1234567890",
        "assignedCasesCount": 25,
        "activeCasesCount": 15
      }
    ]
  }
}
```

---

### Toggle User Status
Activate or deactivate a user account.

**Endpoint:** `PATCH /api/admin/users/:id/toggle-status`

**Access:** Private (Admin only)

**Response (200):**
```json
{
  "status": "success",
  "message": "User activated successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "isActive": true
    }
  }
}
```

---

## 📅 Meeting Management

### Schedule Meeting
Create a new meeting for a case.

**Endpoint:** `POST /api/admin/meetings`

**Access:** Private (Admin only)

**Request Body:**
```json
{
  "title": "Initial Mediation Session",
  "description": "First meeting to discuss conflict resolution options",
  "caseId": "507f1f77bcf86cd799439011",
  "attendees": [
    {
      "name": "Jane Smith",
      "email": "jane@example.com",
      "phone": "+1234567890",
      "isParty": true,
      "role": "Party A"
    }
  ],
  "scheduledDate": "2025-01-20T14:00:00.000Z",
  "duration": 90,
  "meetingType": "video",
  "meetingLink": "https://zoom.us/j/123456789",
  "location": null,
  "notes": "Prepare case summary before meeting",
  "includeParties": true
}
```

**Field Descriptions:**
- `title` (required) - Meeting title
- `caseId` (required) - Case ID
- `attendees` (optional) - Array of attendee objects
- `scheduledDate` (required) - ISO 8601 date string
- `duration` (optional, default: 60) - Duration in minutes
- `meetingType` (required) - Type: `video`, `phone`, or `in-person`
- `meetingLink` (optional) - Video meeting URL
- `location` (optional) - Physical location for in-person meetings
- `includeParties` (optional, default: false) - Auto-add case parties as attendees

**Response (201):**
```json
{
  "status": "success",
  "message": "Meeting scheduled successfully",
  "data": {
    "meeting": {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Initial Mediation Session",
      "description": "First meeting to discuss conflict resolution options",
      "case": {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Marriage - Divorce proceedings...",
        "type": "marriage"
      },
      "scheduledBy": {
        "_id": "507f1f77bcf86cd799439013",
        "firstName": "Admin",
        "lastName": "User",
        "email": "admin@example.com"
      },
      "attendees": [
        {
          "user": "507f191e810c19729de860ea",
          "name": "Jane Smith",
          "email": "jane@example.com",
          "phone": "+1234567890",
          "role": "Party A",
          "isParty": true,
          "status": "invited"
        }
      ],
      "scheduledDate": "2025-01-20T14:00:00.000Z",
      "duration": 90,
      "meetingType": "video",
      "meetingLink": "https://zoom.us/j/123456789",
      "status": "scheduled",
      "createdAt": "2025-01-15T10:00:00.000Z"
    }
  }
}
```

---

### Get All Meetings
Retrieve paginated list of meetings with filtering.

**Endpoint:** `GET /api/admin/meetings`

**Access:** Private (Admin only)

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `status` (string) - Filter by status: `scheduled`, `completed`, `cancelled`, `rescheduled`
- `meetingType` (string) - Filter by type: `video`, `phone`, `in-person`
- `caseId` (string) - Filter by specific case
- `sortBy` (string, default: "scheduledDate")
- `sortOrder` (string, default: "asc")

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "meetings": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "title": "Initial Mediation Session",
        "case": {
          "_id": "507f1f77bcf86cd799439011",
          "title": "Marriage - Divorce proceedings...",
          "type": "marriage",
          "status": "assigned"
        },
        "scheduledBy": { /* Admin user object */ },
        "attendees": [ /* Array of attendees */ ],
        "scheduledDate": "2025-01-20T14:00:00.000Z",
        "duration": 90,
        "meetingType": "video",
        "status": "scheduled"
      }
    ],
    "pagination": {
      "current": 1,
      "pages": 5,
      "total": 48,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

### Get Meeting by ID
Get detailed information about a specific meeting.

**Endpoint:** `GET /api/admin/meetings/:id`

**Access:** Private (Admin only)

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "meeting": {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Initial Mediation Session",
      "description": "First meeting to discuss conflict resolution options",
      "case": {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Marriage - Divorce proceedings...",
        "type": "marriage",
        "status": "assigned",
        "description": "...",
        "parties": [ /* Party objects */ ]
      },
      "scheduledBy": { /* Full admin user object */ },
      "attendees": [ /* Full attendee objects with user details */ ],
      "scheduledDate": "2025-01-20T14:00:00.000Z",
      "duration": 90,
      "meetingType": "video",
      "meetingLink": "https://zoom.us/j/123456789",
      "status": "scheduled",
      "notes": "Prepare case summary before meeting",
      "outcome": null,
      "nextSteps": null,
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z"
    }
  }
}
```

---

### Get Case Meetings
Get all meetings for a specific case.

**Endpoint:** `GET /api/admin/cases/:caseId/meetings`

**Access:** Private (Admin only)

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "meetings": [
      { /* Meeting object */ }
    ]
  }
}
```

---

### Update Meeting
Update meeting details, status, outcome, or next steps.

**Endpoint:** `PATCH /api/admin/meetings/:id`

**Access:** Private (Admin only)

**Request Body:**
```json
{
  "status": "completed",
  "outcome": "Both parties agreed to mediation terms, settlement draft prepared",
  "nextSteps": "Admin to prepare final settlement document for review",
  "updateCase": true,
  "notes": "Productive session, both parties cooperative"
}
```

**Updatable Fields:**
- `title`, `description`, `scheduledDate`, `duration`, `meetingType`, `meetingLink`, `location`
- `status` - Update to: `scheduled`, `completed`, `cancelled`, `rescheduled`
- `outcome` - Meeting outcome (saved as case note when status is `completed`)
- `nextSteps` - Next steps (saved as case note)
- `attendees` - Update attendee list
- `notes` - Meeting notes
- `updateCase` - If true and status is `completed`, sets case status to `in_progress`

**Response (200):**
```json
{
  "status": "success",
  "message": "Meeting updated successfully",
  "data": {
    "meeting": { /* Updated meeting object */ }
  }
}
```

**Note:** When `outcome` or `nextSteps` are provided, they are automatically added as notes to the associated case.

---

### Cancel Meeting
Cancel a scheduled meeting.

**Endpoint:** `PATCH /api/admin/meetings/:id/cancel`

**Access:** Private (Admin only)

**Request Body:**
```json
{
  "reason": "Party A requested to reschedule due to emergency"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Meeting cancelled successfully",
  "data": {
    "meeting": {
      "_id": "507f1f77bcf86cd799439012",
      "status": "cancelled",
      "notes": "Cancelled: Party A requested to reschedule due to emergency"
    }
  }
}
```

---

## 📦 Data Models

### Case Object
```typescript
{
  _id: string;
  caseId: string;                    // Formatted ID like "CASE-2025-123456"
  title: string;
  description: string;
  type: "marriage" | "land" | "property" | "family";
  status: "open" | "assigned" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  createdBy: User;                   // Populated user object
  assignedTo: User | null;           // Populated admin user object
  assignedAt: Date | null;
  parties: Array<{
    name: string;
    contact: string;                 // Email or phone
    role: string;                    // "Party A", "Party B", etc.
  }>;
  documents: Array<{
    name: string;
    url: string;                     // S3 URL
    key: string;                     // S3 key
    size: number;
    mimetype: string;
    uploadedAt: Date;
  }>;
  notes: Array<{
    content: string;
    createdBy: User;
    createdAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;

  // Additional fields in getAllCases response
  hasPartyBResponse?: boolean;
  partyBSubmissionStatus?: string;
  sessionId?: string;
  linkedSessionId?: string;
}
```

### User Object
```typescript
{
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: "admin" | "client";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Meeting Object
```typescript
{
  _id: string;
  title: string;
  description: string;
  case: Case;                        // Populated case object
  scheduledBy: User;                 // Populated admin user
  attendees: Array<{
    user?: string;                   // User ID reference
    name: string;
    email: string;
    phone?: string;
    role?: string;
    isParty: boolean;
    status: "invited" | "accepted" | "declined" | "tentative";
  }>;
  scheduledDate: Date;
  duration: number;                  // Minutes
  meetingType: "video" | "phone" | "in-person";
  meetingLink?: string;
  location?: string;
  status: "scheduled" | "completed" | "cancelled" | "rescheduled";
  notes?: string;
  outcome?: string;
  nextSteps?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🔍 Common Error Responses

### 400 Bad Request
```json
{
  "status": "error",
  "message": "Invalid status" | "Can only assign cases to admin users" | etc.
}
```

### 401 Unauthorized
```json
{
  "status": "error",
  "message": "Invalid credentials" | "This admin account has been deactivated"
}
```

### 404 Not Found
```json
{
  "status": "error",
  "message": "Case not found" | "User not found" | "Meeting not found"
}
```

### 500 Server Error
```json
{
  "status": "error",
  "message": "Server error" | specific error message
}
```

---

## 🎯 Implementation Tips

### 1. Authentication Flow
```javascript
// Store token after login
localStorage.setItem('adminToken', response.data.token);

// Include in all subsequent requests
const config = {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
  }
};

axios.get('/api/admin/cases', config);
```

### 2. Pagination Helper
```javascript
const buildPaginationParams = (page, limit, filters) => {
  return {
    page,
    limit,
    ...filters
  };
};

// Usage
const params = buildPaginationParams(1, 20, {
  status: 'open',
  priority: 'high'
});
```

### 3. Case Status Badge Colors
```javascript
const statusColors = {
  'open': 'blue',
  'assigned': 'yellow',
  'in_progress': 'orange',
  'resolved': 'green',
  'closed': 'gray'
};
```

### 4. Priority Badge Colors
```javascript
const priorityColors = {
  'low': 'gray',
  'medium': 'blue',
  'high': 'orange',
  'urgent': 'red'
};
```

### 5. Date Formatting
All dates are in ISO 8601 format. Use a library like `date-fns` or `dayjs` for formatting:
```javascript
import { format } from 'date-fns';

const formattedDate = format(new Date(case.createdAt), 'MMM dd, yyyy HH:mm');
```

---

## 📝 Notes

1. **Case ID Format**: The `caseId` field uses format `CASE-{YEAR}-{TIMESTAMP}` (e.g., "CASE-2025-123456")

2. **File URLs**: All file URLs from S3 are pre-signed and have expiration. Consider implementing a refresh mechanism if displaying files for extended periods.

3. **Real-time Updates**: Consider implementing WebSocket connections for real-time case status updates and new case notifications.

4. **Bulk Operations**: Currently not supported. Submit feature request if needed.

5. **Export Functionality**: Not currently implemented. Cases can be exported by fetching and processing data client-side.

6. **Search**: The search parameter uses case-insensitive regex matching. For large datasets, consider implementing full-text search.

---

## 🚀 Best Practices

1. **Always handle errors**: All endpoints may return 500 errors. Implement proper error handling.

2. **Use pagination**: Don't fetch all records at once. Use reasonable page sizes (10-50 items).

3. **Cache admin list**: The admin users list doesn't change frequently. Cache it locally and refresh periodically.

4. **Validate inputs**: Validate all user inputs client-side before sending to API.

5. **Optimize requests**: Use the detailed endpoint only when needed. The list endpoint is lighter.

6. **Handle token expiration**: Implement token refresh logic or redirect to login on 401 errors.

---

## 📧 Support

For API issues or feature requests, please contact the development team or submit an issue in the project repository.

**API Version:** 1.0
**Last Updated:** January 2025
