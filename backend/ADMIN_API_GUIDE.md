# Admin API Guide

This document provides information about the admin APIs available in the Conflict Management System.

## Authentication

All admin APIs require authentication with an admin user account.

### Login

```
POST /api/admin/auth/login
```

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "your_password"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Admin login successful",
  "data": {
    "user": {
      "id": "user_id",
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@example.com",
      "phone": "1234567890",
      "role": "admin"
    },
    "token": "jwt_token"
  }
}
```

## Case Management

### Get All Cases with Party Details

Retrieves all cases with additional information about party submissions.

```
GET /api/admin/cases
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Number of cases per page (default: 10)
- `status` - Filter by case status
- `type` - Filter by case type
- `priority` - Filter by case priority
- `sortBy` - Field to sort by (default: createdAt)
- `sortOrder` - Sort order (asc or desc, default: desc)
- `search` - Search term for title, description, or party name

**Response:**
```json
{
  "status": "success",
  "data": {
    "cases": [
      {
        "_id": "case_id",
        "title": "Case Title",
        "description": "Case Description",
        "type": "marriage",
        "status": "open",
        "priority": "medium",
        "createdBy": {
          "_id": "user_id",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com"
        },
        "assignedTo": null,
        "parties": [
          {
            "name": "Party A Name",
            "contact": "partya@example.com",
            "role": "Party A"
          },
          {
            "name": "Party B Name",
            "contact": "partyb@example.com",
            "role": "Party B"
          }
        ],
        "hasPartyBResponse": true,
        "partyBSubmissionStatus": "submitted",
        "partyBSubmittedAt": "2023-06-15T10:30:00.000Z",
        "sessionId": "session_id_a",
        "linkedSessionId": "session_id_b"
      }
    ],
    "pagination": {
      "current": 1,
      "pages": 5,
      "total": 50,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### Get Detailed Case Information

Retrieves detailed information about a specific case, including both parties' submissions.

```
GET /api/admin/cases/:id/detailed
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "case": {
      "_id": "case_id",
      "title": "Case Title",
      "description": "Case Description",
      "type": "marriage",
      "status": "open",
      "priority": "medium",
      "createdBy": {
        "_id": "user_id",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com"
      },
      "assignedTo": null,
      "parties": [
        {
          "name": "Party A Name",
          "contact": "partya@example.com",
          "role": "Party A"
        },
        {
          "name": "Party B Name",
          "contact": "partyb@example.com",
          "role": "Party B"
        }
      ],
      "notes": []
    },
    "partyA": {
      "sessionId": "session_id_a",
      "status": "submitted",
      "submittedAt": "2023-06-10T08:15:00.000Z",
      "steps": {
        "step1": {
          "conflictType": "Marriage Dispute",
          "description": "Description of the conflict"
        },
        "step2": {
          "parties": [
            {
              "name": "Party A Name",
              "email": "partya@example.com",
              "phone": "1234567890",
              "role": "Party A"
            },
            {
              "name": "Party B Name",
              "email": "partyb@example.com",
              "phone": "0987654321",
              "role": "Party B"
            }
          ]
        },
        "step3": {
          "conflictBackground": "Detailed background of the conflict"
        },
        "step4": {
          "desiredOutcomes": "Desired outcomes from Party A's perspective"
        },
        "step5": {
          "schedulingPreferences": {
            "preferredDays": ["Monday", "Wednesday"],
            "preferredTimes": ["Morning", "Afternoon"]
          }
        },
        "step6": {
          "uploadedFiles": []
        }
      },
      "documents": []
    },
    "partyB": {
      "sessionId": "session_id_b",
      "status": "submitted",
      "submittedAt": "2023-06-15T10:30:00.000Z",
      "steps": {
        "step1": {
          "conflictType": "Marriage Dispute",
          "description": "Description of the conflict from Party B's perspective"
        },
        "step2": {
          "parties": [
            {
              "name": "Party A Name",
              "email": "partya@example.com",
              "phone": "1234567890",
              "role": "Party A"
            },
            {
              "name": "Party B Name",
              "email": "partyb@example.com",
              "phone": "0987654321",
              "role": "Party B"
            }
          ]
        },
        "step3": {
          "conflictBackground": "Detailed background of the conflict from Party B's perspective"
        },
        "step4": {
          "desiredOutcomes": "Desired outcomes from Party B's perspective"
        },
        "step5": {
          "schedulingPreferences": {
            "preferredDays": ["Tuesday", "Thursday"],
            "preferredTimes": ["Afternoon", "Evening"]
          }
        },
        "step6": {
          "uploadedFiles": []
        }
      },
      "documents": []
    },
    "hasPartyBResponse": true,
    "meetings": []
  }
}
```

### Update Case Status

Updates the status of a case with optional resolution details, admin feedback, and next steps.

```
PATCH /api/admin/cases/:id/status
```

**Request Body:**
```json
{
  "status": "in_progress",
  "resolutionDetails": "Details about the resolution (for resolved/closed status)",
  "adminFeedback": "Feedback from the admin",
  "nextSteps": "Next steps for the case"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Case status updated successfully",
  "data": {
    "case": {
      "_id": "case_id",
      "title": "Case Title",
      "status": "in_progress",
      "notes": [
        {
          "content": "Admin Feedback: Feedback from the admin",
          "createdBy": "admin_id",
          "createdAt": "2023-06-20T14:25:00.000Z"
        },
        {
          "content": "Next Steps: Next steps for the case",
          "createdBy": "admin_id",
          "createdAt": "2023-06-20T14:25:00.000Z"
        }
      ]
    }
  }
}
```

### Add Note to Case

Adds a note to a case.

```
POST /api/admin/cases/:id/notes
```

**Request Body:**
```json
{
  "content": "Note content",
  "noteType": "Observation"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Note added successfully",
  "data": {
    "case": {
      "_id": "case_id",
      "title": "Case Title",
      "notes": [
        {
          "content": "[Observation] Note content",
          "createdBy": "admin_id",
          "createdAt": "2023-06-20T14:30:00.000Z"
        }
      ]
    },
    "addedNote": {
      "content": "[Observation] Note content",
      "createdBy": "admin_id",
      "createdAt": "2023-06-20T14:30:00.000Z"
    }
  }
}
```

## Meeting Management

### Schedule Meeting

Schedules a meeting for a case, with option to automatically include case parties.

```
POST /api/admin/meetings
```

**Request Body:**
```json
{
  "title": "Meeting Title",
  "description": "Meeting Description",
  "caseId": "case_id",
  "scheduledDate": "2023-07-01T10:00:00.000Z",
  "duration": 60,
  "meetingType": "video",
  "meetingLink": "https://meet.google.com/abc-defg-hij",
  "location": "Office Room 101",
  "notes": "Meeting notes",
  "includeParties": true,
  "attendees": [
    {
      "name": "Admin Name",
      "email": "admin@example.com",
      "user": "admin_id",
      "status": "accepted"
    }
  ]
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Meeting scheduled successfully",
  "data": {
    "meeting": {
      "_id": "meeting_id",
      "title": "Meeting Title",
      "description": "Meeting Description",
      "case": {
        "_id": "case_id",
        "title": "Case Title",
        "type": "marriage"
      },
      "scheduledBy": {
        "_id": "admin_id",
        "firstName": "Admin",
        "lastName": "User",
        "email": "admin@example.com"
      },
      "attendees": [
        {
          "name": "Admin Name",
          "email": "admin@example.com",
          "user": {
            "_id": "admin_id",
            "firstName": "Admin",
            "lastName": "User",
            "email": "admin@example.com"
          },
          "status": "accepted"
        },
        {
          "name": "Party A Name",
          "email": "partya@example.com",
          "isParty": true,
          "status": "invited",
          "role": "Party A"
        },
        {
          "name": "Party B Name",
          "email": "partyb@example.com",
          "isParty": true,
          "status": "invited",
          "role": "Party B"
        }
      ],
      "scheduledDate": "2023-07-01T10:00:00.000Z",
      "duration": 60,
      "meetingType": "video",
      "meetingLink": "https://meet.google.com/abc-defg-hij",
      "location": "Office Room 101",
      "status": "scheduled",
      "notes": "Meeting notes"
    }
  }
}
```

### Update Meeting

Updates a meeting with outcome and next steps.

```
PATCH /api/admin/meetings/:id
```

**Request Body:**
```json
{
  "status": "completed",
  "outcome": "Meeting outcome details",
  "nextSteps": "Next steps after the meeting",
  "updateCase": true
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Meeting updated successfully",
  "data": {
    "meeting": {
      "_id": "meeting_id",
      "title": "Meeting Title",
      "status": "completed",
      "outcome": "Meeting outcome details",
      "nextSteps": "Next steps after the meeting"
    }
  }
}
```

## Testing

A test script is available to verify the functionality of the admin APIs:

```
node src/tests/admin-api-test.js
```

This script tests the following endpoints:
- Admin login
- Get all cases with party details
- Get detailed case information
- Add note to case
- Update case status
- Schedule meeting

Make sure to update the admin credentials in the script before running it.