# Panelist Portal API Documentation

## Overview
This document describes the complete panelist-facing API system that allows panelists to log in, manage their profile, view and handle assigned cases, schedule meetings, communicate with parties, and finalize cases with resolution notes.

## Table of Contents
1. [Authentication](#authentication)
2. [Dashboard](#dashboard)
3. [Profile Management](#profile-management)
4. [Case Management](#case-management)
5. [Case Resolution](#case-resolution)
6. [Meeting Management](#meeting-management)
7. [Messaging System](#messaging-system)
8. [Admin Panelist Management](#admin-panelist-management)

---

## Authentication

### 1. Panelist Login
```
POST /api/panelist/auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "panelist@example.com",
  "password": "securepassword"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "panelist@example.com",
      "phone": "+1234567890",
      "role": "panelist",
      "panelistProfile": "panelist_id"
    },
    "panelist": {
      "id": "panelist_id",
      "name": "John Doe",
      "occupation": "Mediator",
      "specializations": ["marriage", "family"],
      "image": {
        "url": "https://...",
        "key": "..."
      },
      "availability": {
        "status": "available",
        "maxCases": 5,
        "currentCaseLoad": 2
      }
    },
    "token": "JWT_TOKEN"
  }
}
```

### 2. Get Current Panelist Info
```
GET /api/panelist/auth/me
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "user": { /* user details */ },
    "panelist": { /* complete panelist profile */ }
  }
}
```

### 3. Change Password
```
PATCH /api/panelist/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

### 4. Logout
```
POST /api/panelist/auth/logout
Authorization: Bearer <token>
```

---

## Dashboard

### 1. Get Dashboard Statistics
```
GET /api/panelist/dashboard/stats
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "overview": {
      "activeCases": 3,
      "casesNeedingResolution": 1,
      "resolvedCases": 15,
      "totalCases": 18,
      "upcomingMeetings": 2,
      "unreadMessages": 5
    },
    "thisMonth": {
      "resolvedCases": 3
    },
    "availability": {
      "currentCaseLoad": 3,
      "maxCases": 5,
      "status": "available",
      "capacityPercentage": 60
    },
    "performance": {
      "rating": 4.5,
      "ratingCount": 12,
      "averageResolutionTime": 15
    }
  }
}
```

### 2. Get Recent Activity
```
GET /api/panelist/dashboard/recent-activity?limit=20
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (optional): Number of activities to return (default: 20)

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "activities": [
      {
        "_id": "activity_id",
        "case": {
          "title": "Marriage Dispute Case",
          "caseId": "CASE-001",
          "type": "marriage",
          "status": "in_progress"
        },
        "activityType": "note_added",
        "performedBy": {
          "userType": "panelist",
          "userId": "user_id",
          "name": "Jane Smith"
        },
        "description": "Jane Smith added a progress note",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "count": 15
  }
}
```

### 3. Get Upcoming Meetings
```
GET /api/panelist/dashboard/upcoming-meetings?limit=10
Authorization: Bearer <token>
```

### 4. Get Performance Metrics
```
GET /api/panelist/dashboard/performance
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "statistics": {
      "totalCasesHandled": 20,
      "casesResolved": 18,
      "averageResolutionTime": 15
    },
    "rating": {
      "average": 4.5,
      "count": 15
    },
    "monthlyTrend": [
      { "month": "Aug 2024", "resolved": 3 },
      { "month": "Sep 2024", "resolved": 4 }
    ],
    "caseDistribution": [
      { "_id": "marriage", "count": 12 },
      { "_id": "family", "count": 8 }
    ]
  }
}
```

---

## Profile Management

### 1. Get Profile
```
GET /api/panelist/profile
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "panelist@example.com",
      "phone": "+1234567890",
      "profilePicture": { "url": "...", "key": "..." },
      "address": { /* address details */ }
    },
    "panelist": {
      "id": "panelist_id",
      "name": "John Doe",
      "age": 45,
      "image": { "url": "...", "key": "..." },
      "occupation": "Mediator",
      "education": {
        "degree": "Master of Laws",
        "institution": "Harvard Law School",
        "yearCompleted": 2005
      },
      "specializations": ["marriage", "family", "divorce"],
      "experience": {
        "years": 15,
        "description": "Specializing in family mediation"
      },
      "contactInfo": {
        "email": "panelist@example.com",
        "phone": "+1234567890"
      },
      "availability": {
        "status": "available",
        "maxCases": 5,
        "currentCaseLoad": 2
      },
      "bio": "Experienced mediator...",
      "certifications": [],
      "languages": ["English", "Spanish"],
      "rating": { "average": 4.5, "count": 12 },
      "statistics": {
        "totalCasesHandled": 20,
        "casesResolved": 18,
        "averageResolutionTime": 15
      }
    }
  }
}
```

### 2. Update Profile
```
PATCH /api/panelist/profile
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:** (all fields optional)
```json
{
  "bio": "Updated biography",
  "languages": ["English", "Spanish", "French"],
  "certifications": [
    {
      "name": "Certified Mediator",
      "issuingOrganization": "National Mediation Board",
      "issueDate": "2020-01-15",
      "expiryDate": "2025-01-15"
    }
  ]
}
```

### 3. Update Availability
```
PATCH /api/panelist/profile/availability
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "available",
  "maxCases": 8
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Availability updated successfully",
  "data": {
    "availability": {
      "status": "available",
      "maxCases": 8,
      "currentCaseLoad": 2
    }
  }
}
```

### 4. Update Profile Picture
```
PATCH /api/panelist/profile/profile-picture
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "url": "https://s3.amazonaws.com/bucket/image.jpg",
  "key": "panelists/john-doe.jpg"
}
```

### 5. Update Account Information
```
PATCH /api/panelist/profile/account
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  }
}
```

---

## Case Management

### 1. Get My Cases
```
GET /api/panelist/cases?page=1&limit=10&status=in_progress&type=marriage&search=dispute
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (open, assigned, panel_assigned, in_progress, resolved, closed)
- `type` (optional): Filter by case type (marriage, land, property, family)
- `priority` (optional): Filter by priority (low, medium, high, urgent)
- `sortBy` (optional): Sort field (default: createdAt)
- `sortOrder` (optional): Sort order (asc/desc, default: desc)
- `search` (optional): Search in title, description, caseId

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "cases": [
      {
        "_id": "case_id",
        "caseId": "CASE-001",
        "title": "Marriage Dispute Case",
        "description": "...",
        "type": "marriage",
        "status": "in_progress",
        "priority": "high",
        "createdBy": { /* user details */ },
        "assignedPanelists": [
          {
            "panelist": { /* panelist details */ },
            "assignedAt": "2024-01-10T10:00:00Z",
            "status": "active"
          }
        ],
        "parties": [
          {
            "name": "Party A",
            "contact": "email@example.com",
            "role": "Applicant"
          }
        ],
        "documents": [],
        "notes": [],
        "createdAt": "2024-01-10T09:00:00Z",
        "updatedAt": "2024-01-15T10:00:00Z"
      }
    ],
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

### 2. Get Case by ID
```
GET /api/panelist/cases/:caseId
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "case": { /* complete case details with populated references */ },
    "myResolution": {
      /* panelist's resolution if exists */
      "resolutionStatus": "resolved",
      "resolutionNotes": "...",
      "isSubmitted": true,
      "submittedAt": "2024-01-20T14:00:00Z"
    },
    "allResolutions": [
      {
        "panelist": { "name": "Jane Smith", "occupation": "Mediator" },
        "isSubmitted": true,
        "submittedAt": "2024-01-20T14:00:00Z",
        "resolutionStatus": "resolved"
      }
    ]
  }
}
```

### 3. Get Case Parties
```
GET /api/panelist/cases/:caseId/parties
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "parties": [
      {
        "name": "John Smith",
        "contact": "john@example.com",
        "role": "Applicant"
      },
      {
        "name": "Jane Smith",
        "contact": "jane@example.com",
        "role": "Respondent"
      }
    ],
    "createdBy": {
      "firstName": "John",
      "lastName": "Smith",
      "email": "john@example.com",
      "phone": "+1234567890",
      "address": { /* address details */ }
    }
  }
}
```

### 4. Get Case Documents
```
GET /api/panelist/cases/:caseId/documents
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "documents": [
      {
        "name": "marriage_certificate.pdf",
        "url": "https://s3.amazonaws.com/...",
        "key": "cases/case_id/document.pdf",
        "size": 1024000,
        "mimetype": "application/pdf",
        "uploadedAt": "2024-01-15T10:00:00Z"
      }
    ],
    "count": 1
  }
}
```

### 5. Add Case Note
```
POST /api/panelist/cases/:caseId/notes
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "content": "Met with both parties today. Progress is being made on custody arrangements.",
  "noteType": "progress"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Note added successfully",
  "data": {
    "note": {
      "content": "...",
      "createdBy": { /* user details */ },
      "createdByType": "panelist",
      "panelistId": { /* panelist details */ },
      "noteType": "progress",
      "createdAt": "2024-01-15T14:30:00Z"
    }
  }
}
```

**Note Types:**
- `general`: General notes
- `progress`: Progress updates
- `internal`: Internal notes (not visible to parties)

### 6. Upload Case Document
```
POST /api/panelist/cases/:caseId/documents
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "resolution_agreement.pdf",
  "url": "https://s3.amazonaws.com/bucket/document.pdf",
  "key": "cases/case_id/document.pdf",
  "size": 2048000,
  "mimetype": "application/pdf"
}
```

### 7. Get Case Timeline
```
GET /api/panelist/cases/:caseId/timeline?page=1&limit=50
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "activities": [
      {
        "_id": "activity_id",
        "case": "case_id",
        "activityType": "meeting_scheduled",
        "performedBy": {
          "userType": "panelist",
          "userId": { /* user details */ },
          "panelistId": { /* panelist details */ },
          "name": "John Doe"
        },
        "description": "John Doe scheduled meeting: Initial Consultation",
        "metadata": {
          "meetingId": "meeting_id",
          "scheduledDate": "2024-01-20T10:00:00Z",
          "meetingType": "video"
        },
        "isImportant": true,
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": { /* pagination details */ }
  }
}
```

### 8. Get Case Resolutions
```
GET /api/panelist/cases/:caseId/resolutions
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "resolutions": [
      {
        "_id": "resolution_id",
        "case": "case_id",
        "panelist": {
          "name": "John Doe",
          "occupation": "Mediator",
          "specializations": ["marriage", "family"],
          "image": { "url": "...", "key": "..." }
        },
        "resolutionStatus": "resolved",
        "resolutionNotes": "Case has been successfully resolved...",
        "outcome": "Both parties agreed to...",
        "recommendations": "Follow-up meeting in 3 months",
        "isSubmitted": true,
        "submittedAt": "2024-01-20T14:00:00Z"
      }
    ],
    "summary": {
      "allSubmitted": false,
      "total": 2,
      "submitted": 1,
      "pending": 1
    }
  }
}
```

---

## Case Resolution

### 1. Submit Resolution
```
POST /api/panelist/cases/:caseId/resolution/submit
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "resolutionStatus": "resolved",
  "resolutionNotes": "After several mediation sessions, both parties have reached an agreement on custody arrangements and financial support. The resolution addresses all major concerns raised by both parties.",
  "outcome": "Joint custody arrangement with 50/50 time split. Financial support agreed at $2000/month.",
  "recommendations": "Schedule follow-up meeting in 3 months to ensure compliance and address any new issues."
}
```

**Resolution Status Options:**
- `resolved`: Case was successfully resolved
- `no_outcome`: No resolution was reached

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Resolution submitted successfully",
  "data": {
    "resolution": {
      "_id": "resolution_id",
      "case": "case_id",
      "panelist": "panelist_id",
      "resolutionStatus": "resolved",
      "resolutionNotes": "...",
      "outcome": "...",
      "recommendations": "...",
      "isSubmitted": true,
      "submittedAt": "2024-01-20T14:00:00Z"
    },
    "resolutionComplete": false,
    "progress": {
      "allSubmitted": false,
      "total": 3,
      "submitted": 2,
      "pending": 1
    }
  }
}
```

**Notes:**
- Once submitted, resolution cannot be modified
- When all assigned panelists submit resolutions, case status automatically changes to 'resolved'
- Panelist statistics are automatically updated

### 2. Update Resolution (Draft)
```
PATCH /api/panelist/cases/:caseId/resolution/update
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "resolutionStatus": "resolved",
  "resolutionNotes": "Draft resolution notes...",
  "outcome": "Draft outcome...",
  "recommendations": "Draft recommendations..."
}
```

**Notes:**
- Can only update draft resolutions (not yet submitted)
- Used to save work in progress before final submission

### 3. Get Resolution Status
```
GET /api/panelist/cases/:caseId/resolution/status
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "myResolution": {
      /* my resolution details if exists */
    },
    "caseResolutionStatus": "partial",
    "progress": {
      "total": 3,
      "submitted": 2,
      "lastUpdated": "2024-01-20T14:00:00Z"
    },
    "finalizedBy": [
      {
        "name": "John Doe",
        "occupation": "Mediator"
      }
    ],
    "finalizedAt": null,
    "allResolutions": [
      {
        "panelist": { "name": "Jane Smith", "occupation": "Counselor" },
        "isSubmitted": true,
        "submittedAt": "2024-01-20T12:00:00Z",
        "resolutionStatus": "resolved"
      },
      {
        "panelist": { "name": "Bob Johnson", "occupation": "Mediator" },
        "isSubmitted": false,
        "submittedAt": null,
        "resolutionStatus": "pending"
      }
    ],
    "completion": {
      "allSubmitted": false,
      "total": 3,
      "submitted": 2,
      "pending": 1
    }
  }
}
```

**Case Resolution Status:**
- `not_started`: No resolutions submitted yet
- `partial`: Some panelists have submitted
- `complete`: All panelists have submitted

### 4. Get My Resolution
```
GET /api/panelist/cases/:caseId/resolution/my
Authorization: Bearer <token>
```

---

## Meeting Management

### 1. Schedule Meeting
```
POST /api/panelist/meetings
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Initial Consultation",
  "description": "First meeting with both parties to discuss case details",
  "caseId": "case_id",
  "attendees": [
    {
      "name": "John Smith",
      "email": "john@example.com",
      "phone": "+1234567890",
      "role": "Party A",
      "isParty": true,
      "status": "invited"
    },
    {
      "name": "Jane Smith",
      "email": "jane@example.com",
      "phone": "+0987654321",
      "role": "Party B",
      "isParty": true,
      "status": "invited"
    }
  ],
  "scheduledDate": "2024-01-25T10:00:00Z",
  "duration": 60,
  "meetingType": "video",
  "meetingLink": "https://meet.google.com/abc-defg-hij",
  "location": ""
}
```

**Meeting Types:**
- `video`: Video conference
- `phone`: Phone call
- `in-person`: In-person meeting

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Meeting scheduled successfully",
  "data": {
    "meeting": {
      "_id": "meeting_id",
      "title": "Initial Consultation",
      "description": "...",
      "case": { /* case details */ },
      "scheduledBy": { /* user details */ },
      "scheduledByType": "panelist",
      "panelistScheduler": { /* panelist details */ },
      "attendees": [ /* attendees list */ ],
      "scheduledDate": "2024-01-25T10:00:00Z",
      "duration": 60,
      "meetingType": "video",
      "meetingLink": "...",
      "status": "scheduled",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  }
}
```

### 2. Get Meetings
```
GET /api/panelist/meetings?page=1&limit=10&upcoming=true&caseId=case_id
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status (scheduled, completed, cancelled, rescheduled)
- `caseId` (optional): Filter by case
- `upcoming` (optional): Filter for upcoming meetings (true/false)
- `past` (optional): Filter for past meetings (true/false)
- `sortBy` (optional): Sort field (default: scheduledDate)
- `sortOrder` (optional): Sort order (default: asc)

### 3. Get Meeting by ID
```
GET /api/panelist/meetings/:meetingId
Authorization: Bearer <token>
```

### 4. Update Meeting
```
PATCH /api/panelist/meetings/:meetingId
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:** (all fields optional)
```json
{
  "title": "Updated Meeting Title",
  "description": "Updated description",
  "scheduledDate": "2024-01-26T10:00:00Z",
  "duration": 90,
  "meetingLink": "https://zoom.us/j/123456789",
  "status": "rescheduled"
}
```

**Notes:**
- Can only update meetings you scheduled
- Cannot update case reference or scheduler information

### 5. Cancel Meeting
```
DELETE /api/panelist/meetings/:meetingId
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Meeting cancelled successfully",
  "data": {
    "meeting": { /* updated meeting with status: 'cancelled' */ }
  }
}
```

### 6. Add Meeting Notes
```
POST /api/panelist/meetings/:meetingId/notes
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "notes": "Both parties attended. Discussed custody arrangements and financial support. Progress was made on several key points.",
  "outcome": "Parties agreed to draft custody schedule. Next meeting scheduled for further discussion on financial matters.",
  "nextSteps": "Party A to prepare financial documents. Party B to review custody proposal. Follow-up meeting in 2 weeks."
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Meeting notes added successfully",
  "data": {
    "meeting": { /* updated meeting with notes */ }
  }
}
```

**Notes:**
- Adding outcome automatically marks meeting as 'completed'
- All meeting participants can add notes

---

## Messaging System

### 1. Get Messages
```
GET /api/panelist/messages?page=1&limit=20&caseId=case_id&unreadOnly=true
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `caseId` (optional): Filter by case
- `unreadOnly` (optional): Show only unread messages (true/false)
- `sortBy` (optional): Sort field (default: createdAt)
- `sortOrder` (optional): Sort order (default: desc)

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "messages": [
      {
        "_id": "message_id",
        "case": { /* case details */ },
        "sender": {
          "userType": "admin",
          "userId": { /* user details */ },
          "name": "Admin Name"
        },
        "recipients": [
          {
            "recipientType": "panelist",
            "userId": "user_id",
            "name": "Panelist Name",
            "email": "panelist@example.com",
            "isRead": false,
            "readAt": null
          }
        ],
        "subject": "Case Update Required",
        "content": "Please provide an update on the case progress.",
        "messageType": "case_update",
        "priority": "high",
        "attachments": [],
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ],
    "unreadCount": 3,
    "pagination": { /* pagination details */ }
  }
}
```

### 2. Get Case Messages
```
GET /api/panelist/messages/cases/:caseId?page=1&limit=50
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "messages": [ /* list of messages for the case */ ],
    "pagination": { /* pagination details */ }
  }
}
```

### 3. Send Message
```
POST /api/panelist/messages/send
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "caseId": "case_id",
  "subject": "Meeting Reminder",
  "content": "This is a reminder about our scheduled meeting tomorrow at 10 AM. Please confirm your attendance.",
  "recipients": [
    {
      "recipientType": "party",
      "name": "John Smith",
      "email": "john@example.com"
    },
    {
      "recipientType": "party",
      "name": "Jane Smith",
      "email": "jane@example.com"
    }
  ],
  "messageType": "meeting_notification",
  "priority": "normal",
  "attachments": [
    {
      "name": "agenda.pdf",
      "url": "https://s3.amazonaws.com/.../agenda.pdf",
      "key": "messages/attachment.pdf",
      "size": 512000,
      "mimetype": "application/pdf"
    }
  ]
}
```

**Recipient Types:**
- `party`: Individual party in the case
- `panelist`: Another panelist assigned to the case
- `admin`: System administrator
- `all_parties`: Send to all parties in the case

**Message Types:**
- `general`: General message
- `meeting_notification`: Meeting-related notification
- `case_update`: Case status or progress update
- `resolution_request`: Request for resolution submission

**Priority Levels:**
- `low`: Low priority
- `normal`: Normal priority
- `high`: High priority
- `urgent`: Urgent message

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Message sent successfully",
  "data": {
    "message": { /* complete message details */ }
  }
}
```

### 4. Mark Message as Read
```
PATCH /api/panelist/messages/:messageId/read
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Message marked as read"
}
```

### 5. Get Unread Count
```
GET /api/panelist/messages/unread-count
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "unreadCount": 5
  }
}
```

### 6. Delete Message
```
DELETE /api/panelist/messages/:messageId
Authorization: Bearer <token>
```

**Notes:**
- Soft delete (message not permanently removed)
- Can only delete messages you sent

---

## Admin Panelist Management

These endpoints are for administrators to manage panelist accounts.

### 1. Create Panelist Account
```
POST /api/panelists/:id/create-account
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "newpanelist@example.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "User account created successfully for panelist",
  "data": {
    "user": {
      "id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "newpanelist@example.com",
      "phone": "+1234567890",
      "role": "panelist"
    },
    "panelist": {
      "id": "panelist_id",
      "name": "John Doe",
      "userId": "user_id"
    }
  }
}
```

**Notes:**
- Links existing Panelist record with new User account
- Panelist must not already have a user account
- Email must be unique

### 2. Reset Panelist Password
```
POST /api/panelists/:id/reset-password
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "newPassword": "newsecurepassword"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Password reset successfully"
}
```

### 3. Get Panelist Performance
```
GET /api/panelists/:id/performance
Authorization: Bearer <admin-token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "panelist": {
      "id": "panelist_id",
      "name": "John Doe",
      "occupation": "Mediator",
      "specializations": ["marriage", "family"]
    },
    "statistics": {
      "total": 25,
      "active": 3,
      "resolved": 22,
      "resolutionRate": 88
    },
    "rating": {
      "average": 4.5,
      "count": 18
    },
    "monthlyPerformance": [
      { "month": "Aug 2024", "resolved": 3 },
      { "month": "Sep 2024", "resolved": 4 }
    ],
    "caseDistribution": [
      { "_id": "marriage", "count": 15 },
      { "_id": "family", "count": 10 }
    ],
    "availability": {
      "status": "available",
      "maxCases": 5,
      "currentCaseLoad": 3
    }
  }
}
```

---

## Error Responses

All endpoints follow a consistent error response format:

```json
{
  "status": "error",
  "message": "Error description"
}
```

**Common HTTP Status Codes:**
- `200 OK`: Successful GET/PATCH/DELETE request
- `201 Created`: Successful POST request creating a resource
- `400 Bad Request`: Invalid request data or validation error
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: Insufficient permissions for the action
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error

**Example Error Response:**
```json
{
  "status": "error",
  "message": "You are not authorized to access this case"
}
```

---

## Authentication

All panelist endpoints (except login) require JWT authentication:

```
Authorization: Bearer <token>
```

The token is obtained from the login endpoint and must be included in the `Authorization` header for all subsequent requests.

**Token Expiration:**
- Default expiration: 24 hours
- Configured via `JWT_EXPIRE` environment variable

---

## Workflow Examples

### Complete Case Resolution Workflow

1. **Panelist logs in**
   ```
   POST /api/panelist/auth/login
   ```

2. **View dashboard to see assigned cases**
   ```
   GET /api/panelist/dashboard/stats
   GET /api/panelist/cases?status=in_progress
   ```

3. **Access case details**
   ```
   GET /api/panelist/cases/:caseId
   GET /api/panelist/cases/:caseId/parties
   GET /api/panelist/cases/:caseId/documents
   ```

4. **Schedule meeting with parties**
   ```
   POST /api/panelist/meetings
   ```

5. **Add progress notes during case handling**
   ```
   POST /api/panelist/cases/:caseId/notes
   ```

6. **Send messages to parties**
   ```
   POST /api/panelist/messages/send
   ```

7. **After meeting, add meeting notes**
   ```
   POST /api/panelist/meetings/:meetingId/notes
   ```

8. **Check if other panelists have submitted resolutions**
   ```
   GET /api/panelist/cases/:caseId/resolution/status
   ```

9. **Submit final resolution**
   ```
   POST /api/panelist/cases/:caseId/resolution/submit
   ```

10. **Case automatically marked as resolved when all panelists submit**

---

## Notes and Best Practices

### Case Resolution
- All assigned panelists must submit resolutions for a case to be marked as resolved
- Draft resolutions can be saved using the update endpoint before final submission
- Once submitted, resolutions cannot be modified (contact admin for changes)
- Statistics are automatically updated when resolutions are submitted

### Meetings
- Panelists can schedule meetings with case parties
- Meeting links (Zoom, Google Meet, etc.) should be included for video meetings
- Adding meeting outcome automatically marks it as completed

### Messaging
- Messages are case-specific
- Use `all_parties` recipient type to send to all parties at once
- Attachments should be uploaded to S3 first, then referenced in the message

### Profile Management
- Panelists can update their availability and max case slots
- System automatically adjusts availability status based on case load
- Cannot set max cases below current case load

### Security
- All endpoints require authentication (except login)
- Panelists can only access cases they are assigned to
- JWT tokens expire after 24 hours (configurable)

---

## Support and Feedback

For issues, questions, or feature requests related to the panelist portal API, please contact the development team or submit an issue through the proper channels.

---

**Last Updated:** January 2025
**API Version:** 1.0
**Base URL:** `https://api.example.com` (replace with actual base URL)
