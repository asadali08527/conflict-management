# Client Dashboard API Documentation

This document provides comprehensive documentation for the Client Dashboard API endpoints. These endpoints allow clients to view and track their cases, see updates from panelists and admins, and access meeting information.

## Base URL
```
/api/client
```

## Authentication
All client endpoints require authentication with a valid JWT token and the `client` role.

**Header:**
```
Authorization: Bearer <token>
```

---

## Dashboard Endpoints

### 1. Get Dashboard Statistics
Get overview statistics for the client's dashboard.

**Endpoint:** `GET /api/client/dashboard/stats`

**Response:**
```json
{
  "status": "success",
  "data": {
    "overview": {
      "totalCases": 5,
      "openCases": 1,
      "assignedCases": 2,
      "inProgressCases": 1,
      "resolvedCases": 1,
      "upcomingMeetings": 3,
      "recentActivityCount": 12
    },
    "caseDistribution": {
      "marriage": 3,
      "land": 1,
      "property": 1
    },
    "latestUpdate": {
      "caseTitle": "Marriage Dispute Case",
      "caseId": "CASE-2025-001",
      "activityType": "status_change",
      "description": "Case status changed to in_progress",
      "timestamp": "2025-10-30T10:30:00.000Z"
    }
  }
}
```

---

### 2. Get Recent Updates
Get recent activity updates for all client's cases.

**Endpoint:** `GET /api/client/dashboard/recent-updates`

**Query Parameters:**
- `limit` (optional): Number of activities to return (default: 20)

**Response:**
```json
{
  "status": "success",
  "data": {
    "activities": [
      {
        "_id": "activity_id",
        "case": {
          "_id": "case_id",
          "title": "Marriage Dispute Case",
          "caseId": "CASE-2025-001",
          "type": "marriage",
          "status": "in_progress"
        },
        "activityType": "note_added",
        "description": "Admin added a note",
        "performedBy": {
          "userId": {
            "_id": "user_id",
            "firstName": "Admin",
            "lastName": "User",
            "email": "admin@example.com"
          }
        },
        "createdAt": "2025-10-30T10:30:00.000Z"
      }
    ],
    "count": 12
  }
}
```

---

### 3. Get Upcoming Meetings
Get upcoming scheduled meetings for the client.

**Endpoint:** `GET /api/client/dashboard/upcoming-meetings`

**Query Parameters:**
- `limit` (optional): Number of meetings to return (default: 10)

**Response:**
```json
{
  "status": "success",
  "data": {
    "meetings": [
      {
        "_id": "meeting_id",
        "title": "Initial Consultation",
        "case": {
          "_id": "case_id",
          "title": "Marriage Dispute Case",
          "caseId": "CASE-2025-001",
          "type": "marriage"
        },
        "scheduledBy": {
          "_id": "admin_id",
          "firstName": "Admin",
          "lastName": "User",
          "email": "admin@example.com"
        },
        "scheduledDate": "2025-11-01T14:00:00.000Z",
        "duration": 60,
        "meetingType": "video",
        "status": "scheduled"
      }
    ],
    "count": 3
  }
}
```

---

## Case Management Endpoints

### 4. Get All Cases
Get all cases created by the logged-in client.

**Endpoint:** `GET /api/client/cases`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (open, assigned, panel_assigned, in_progress, resolved, closed)
- `type` (optional): Filter by type (marriage, land, property, family)
- `sortBy` (optional): Sort field (default: createdAt)
- `sortOrder` (optional): Sort order (asc, desc) (default: desc)

**Response:**
```json
{
  "status": "success",
  "data": {
    "cases": [
      {
        "_id": "case_id",
        "caseId": "CASE-2025-001",
        "title": "Marriage Dispute Case",
        "description": "Case description...",
        "type": "marriage",
        "status": "in_progress",
        "priority": "medium",
        "assignedTo": {
          "_id": "admin_id",
          "firstName": "Admin",
          "lastName": "User",
          "email": "admin@example.com"
        },
        "assignedPanelists": [
          {
            "panelist": {
              "_id": "panelist_id",
              "name": "John Doe",
              "occupation": "Marriage Counselor",
              "specializations": ["marriage", "family"],
              "rating": {
                "average": 4.5
              }
            },
            "assignedAt": "2025-10-25T10:00:00.000Z",
            "status": "active"
          }
        ],
        "resolutionStatus": "in_progress",
        "resolutionProgress": {
          "total": 3,
          "submitted": 1
        },
        "activePanelistsCount": 3,
        "createdAt": "2025-10-20T08:00:00.000Z"
      }
    ],
    "pagination": {
      "current": 1,
      "pages": 2,
      "total": 15,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

### 5. Get Case by ID
Get detailed information for a specific case.

**Endpoint:** `GET /api/client/cases/:caseId`

**Response:**
```json
{
  "status": "success",
  "data": {
    "case": {
      "_id": "case_id",
      "caseId": "CASE-2025-001",
      "title": "Marriage Dispute Case",
      "description": "Detailed case description...",
      "type": "marriage",
      "status": "in_progress",
      "priority": "medium",
      "createdBy": {
        "_id": "user_id",
        "firstName": "Client",
        "lastName": "User",
        "email": "client@example.com",
        "phone": "1234567890"
      },
      "assignedTo": {
        "_id": "admin_id",
        "firstName": "Admin",
        "lastName": "User",
        "email": "admin@example.com"
      },
      "assignedPanelists": [...],
      "parties": [...],
      "documents": [...],
      "notes": [...],
      "resolutionStatus": "in_progress",
      "resolutionProgress": {
        "total": 3,
        "submitted": 1
      },
      "createdAt": "2025-10-20T08:00:00.000Z"
    }
  }
}
```

**Error Response (Unauthorized):**
```json
{
  "status": "error",
  "message": "Case not found or you do not have access to this case"
}
```

---

### 6. Get Case Timeline
Get chronological activity timeline for a case.

**Endpoint:** `GET /api/client/cases/:caseId/timeline`

**Response:**
```json
{
  "status": "success",
  "data": {
    "activities": [
      {
        "_id": "activity_id",
        "activityType": "case_created",
        "description": "Case was created",
        "performedBy": {
          "userId": {
            "_id": "user_id",
            "firstName": "Client",
            "lastName": "User",
            "email": "client@example.com"
          }
        },
        "createdAt": "2025-10-20T08:00:00.000Z"
      },
      {
        "_id": "activity_id_2",
        "activityType": "panelist_assigned",
        "description": "Panelist John Doe was assigned to the case",
        "performedBy": {
          "panelistId": {
            "_id": "panelist_id",
            "name": "John Doe",
            "occupation": "Marriage Counselor"
          }
        },
        "createdAt": "2025-10-25T10:00:00.000Z"
      }
    ],
    "count": 15
  }
}
```

---

### 7. Get Case Documents
Get all documents associated with a case (submitted by parties + added by admin/panelists).

**Endpoint:** `GET /api/client/cases/:caseId/documents`

**Response:**
```json
{
  "status": "success",
  "data": {
    "caseDocuments": [
      {
        "name": "marriage_certificate.pdf",
        "url": "https://s3.amazonaws.com/bucket/...",
        "key": "s3-object-key",
        "size": 245678,
        "mimetype": "application/pdf",
        "uploadedAt": "2025-10-25T10:00:00.000Z",
        "source": "Added by Admin/Panelist"
      }
    ],
    "submissionFiles": [
      {
        "source": "Your Submission (Party A)",
        "files": [
          {
            "id": "file_id",
            "fileName": "supporting_document.pdf",
            "fileSize": 123456,
            "fileType": "application/pdf",
            "uploadUrl": "https://s3.amazonaws.com/...",
            "description": "Supporting document",
            "uploadedAt": "2025-10-20T08:30:00.000Z"
          }
        ]
      },
      {
        "source": "Other Party Submission (Party B)",
        "files": [...]
      }
    ],
    "totalDocuments": 5
  }
}
```

---

### 8. Get Case Notes
Get case notes visible to the client (excludes internal admin/panelist notes).

**Endpoint:** `GET /api/client/cases/:caseId/notes`

**Response:**
```json
{
  "status": "success",
  "data": {
    "notes": [
      {
        "_id": "note_id",
        "content": "Initial review completed",
        "createdBy": {
          "_id": "admin_id",
          "firstName": "Admin",
          "lastName": "User",
          "email": "admin@example.com"
        },
        "createdByType": "admin",
        "noteType": "progress",
        "createdAt": "2025-10-25T10:00:00.000Z"
      },
      {
        "_id": "note_id_2",
        "content": "Panelist analysis in progress",
        "panelistId": {
          "_id": "panelist_id",
          "name": "John Doe",
          "occupation": "Marriage Counselor"
        },
        "createdByType": "panelist",
        "noteType": "general",
        "createdAt": "2025-10-26T14:30:00.000Z"
      }
    ],
    "count": 5
  }
}
```

**Note:** Internal notes (noteType: "internal") are filtered out and not visible to clients.

---

### 9. Get Case Panel
Get information about panelists assigned to a case.

**Endpoint:** `GET /api/client/cases/:caseId/panel`

**Response:**
```json
{
  "status": "success",
  "data": {
    "panelists": [
      {
        "panelist": {
          "id": "panelist_id",
          "name": "John Doe",
          "occupation": "Marriage Counselor",
          "specializations": ["marriage", "family"],
          "rating": {
            "average": 4.5,
            "count": 150
          },
          "bio": "Experienced marriage counselor with 15 years...",
          "isActive": true
        },
        "assignedAt": "2025-10-25T10:00:00.000Z",
        "assignedBy": {
          "name": "Admin User"
        }
      }
    ],
    "count": 3,
    "panelAssignedAt": "2025-10-25T10:00:00.000Z"
  }
}
```

---

### 10. Get Case Resolution
Get resolution status and submitted resolutions for a case.

**Endpoint:** `GET /api/client/cases/:caseId/resolution`

**Response:**
```json
{
  "status": "success",
  "data": {
    "resolutionStatus": "partial",
    "resolutionProgress": {
      "total": 3,
      "submitted": 2,
      "lastUpdated": "2025-10-28T10:00:00.000Z"
    },
    "finalizedAt": null,
    "finalizedBy": [],
    "resolutions": [
      {
        "id": "resolution_id",
        "panelist": {
          "name": "John Doe",
          "occupation": "Marriage Counselor",
          "specializations": ["marriage", "family"],
          "rating": 4.5
        },
        "recommendation": "Mediation recommended",
        "reasoning": "Based on the case details and discussions...",
        "submittedAt": "2025-10-27T16:00:00.000Z"
      }
    ]
  }
}
```

**Resolution Status Values:**
- `not_started`: No panelists have submitted resolutions yet
- `in_progress`: Some panelists are working on resolutions
- `partial`: Some panelists have submitted, others pending
- `complete`: All assigned panelists have submitted resolutions

---

### 11. Get Case Meetings
Get all meetings scheduled for a specific case.

**Endpoint:** `GET /api/client/cases/:caseId/meetings`

**Response:**
```json
{
  "status": "success",
  "data": {
    "meetings": [
      {
        "_id": "meeting_id",
        "title": "Initial Consultation",
        "description": "First meeting to discuss the case",
        "scheduledBy": {
          "_id": "admin_id",
          "firstName": "Admin",
          "lastName": "User",
          "email": "admin@example.com"
        },
        "scheduledDate": "2025-11-01T14:00:00.000Z",
        "duration": 60,
        "meetingType": "video",
        "meetingLink": "https://zoom.us/...",
        "status": "scheduled",
        "attendees": [...]
      }
    ],
    "count": 2
  }
}
```

---

## Meeting Endpoints

### 12. Get All Meetings
Get all meetings where the client is an attendee (across all cases).

**Endpoint:** `GET /api/client/meetings`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (scheduled, completed, cancelled)
- `upcoming` (optional): Show only upcoming meetings (true/false)

**Response:**
```json
{
  "status": "success",
  "data": {
    "meetings": [
      {
        "_id": "meeting_id",
        "title": "Initial Consultation",
        "case": {
          "_id": "case_id",
          "title": "Marriage Dispute Case",
          "caseId": "CASE-2025-001",
          "type": "marriage",
          "status": "in_progress"
        },
        "scheduledBy": {
          "_id": "admin_id",
          "firstName": "Admin",
          "lastName": "User",
          "email": "admin@example.com"
        },
        "scheduledDate": "2025-11-01T14:00:00.000Z",
        "duration": 60,
        "meetingType": "video",
        "status": "scheduled"
      }
    ],
    "pagination": {
      "current": 1,
      "pages": 1,
      "total": 5,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

---

### 13. Get Meeting by ID
Get detailed information for a specific meeting.

**Endpoint:** `GET /api/client/meetings/:meetingId`

**Response:**
```json
{
  "status": "success",
  "data": {
    "meeting": {
      "_id": "meeting_id",
      "title": "Initial Consultation",
      "description": "First meeting to discuss the case details",
      "case": {
        "_id": "case_id",
        "title": "Marriage Dispute Case",
        "caseId": "CASE-2025-001",
        "type": "marriage",
        "status": "in_progress",
        "description": "Case description..."
      },
      "scheduledBy": {
        "_id": "admin_id",
        "firstName": "Admin",
        "lastName": "User",
        "email": "admin@example.com"
      },
      "attendees": [
        {
          "user": {
            "_id": "user_id",
            "firstName": "Client",
            "lastName": "User",
            "email": "client@example.com"
          },
          "name": "Client User",
          "email": "client@example.com",
          "status": "invited",
          "isParty": true
        }
      ],
      "scheduledDate": "2025-11-01T14:00:00.000Z",
      "duration": 60,
      "meetingType": "video",
      "meetingLink": "https://zoom.us/...",
      "location": null,
      "status": "scheduled",
      "notes": "Please join 5 minutes early"
    }
  }
}
```

**Error Response (Unauthorized):**
```json
{
  "status": "error",
  "message": "Meeting not found or you do not have access to this meeting"
}
```

---

## Common Error Responses

### 401 Unauthorized
```json
{
  "status": "error",
  "message": "Not authorized to access this route"
}
```

### 403 Forbidden
```json
{
  "status": "error",
  "message": "User role client is not authorized to access this route"
}
```

### 404 Not Found
```json
{
  "status": "error",
  "message": "Case not found or you do not have access to this case"
}
```

### 500 Server Error
```json
{
  "status": "error",
  "message": "Server error"
}
```

---

## Data Flow Overview

The client dashboard completes the circular workflow:

1. **Client Submits Case** → Case is created with status "open"
2. **Admin Reviews** → Admin assigns case and adds notes
3. **Admin Assigns Panelists** → Status changes to "panel_assigned"
4. **Panelists Work** → Status changes to "in_progress", panelists add notes and documents
5. **Panelists Submit Resolutions** → Resolution progress is tracked
6. **Client Views Updates** → Client dashboard shows all updates in real-time

---

## Best Practices

1. **Polling**: For real-time updates, poll the `/dashboard/recent-updates` endpoint every 30-60 seconds
2. **Caching**: Cache case lists and implement pagination for better performance
3. **Error Handling**: Always handle 401, 403, and 404 errors gracefully
4. **Token Refresh**: Implement token refresh logic when tokens expire (24h default)
5. **Loading States**: Show loading indicators while fetching data from API

---

## Example Frontend Integration

```javascript
// Fetch dashboard stats
const getDashboardStats = async (token) => {
  const response = await fetch('http://localhost:8000/api/client/dashboard/stats', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};

// Fetch user cases with filters
const getMyCases = async (token, { page = 1, status, type } = {}) => {
  const params = new URLSearchParams({ page });
  if (status) params.append('status', status);
  if (type) params.append('type', type);

  const response = await fetch(`http://localhost:8000/api/client/cases?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};

// Get case resolution status
const getCaseResolution = async (token, caseId) => {
  const response = await fetch(
    `http://localhost:8000/api/client/cases/${caseId}/resolution`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.json();
};
```

---

## Support

For issues or questions, please contact the backend development team or refer to the main API documentation.
