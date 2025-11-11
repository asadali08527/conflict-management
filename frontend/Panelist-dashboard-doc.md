# Panelist Portal - Frontend Integration Guide

## Overview

A portal for panelists to manage dispute resolution cases, schedule meetings, communicate with parties, and submit resolutions.

**Base URL:** `https://api.example.com`  
**Auth:** JWT Bearer token in header: `Authorization: Bearer <token>`  
**Token Expiry:** 24 hours

---

## 1. Authentication

### Login

```javascript
POST / api / panelist / auth / login;
Body: {
  email, password;
}
Returns: {
  user, panelist, token;
}

// Store token and redirect to dashboard
localStorage.setItem('authToken', data.token);
```

### Get Current User

```javascript
GET / api / panelist / auth / me;
// Use on app load to verify token and get user data
```

### Change Password

```javascript
PATCH / api / panelist / auth / change - password;
Body: {
  currentPassword, newPassword;
}
```

### Logout

```javascript
POST / api / panelist / auth / logout;
```

---

## 2. Dashboard

### Get Stats

```javascript
GET /api/panelist/dashboard/stats
Returns: {
  activeCases: 3,
  casesNeedingResolution: 1,
  resolvedCases: 15,
  upcomingMeetings: 2,
  unreadMessages: 5,
  currentCaseLoad: 3,
  maxCases: 5,
  capacityPercentage: 60
}
```

### Get Recent Activity

```javascript
GET /api/panelist/dashboard/recent-activity?limit=20
Returns: { activities[], count }
```

### Get Upcoming Meetings

```javascript
GET /api/panelist/dashboard/upcoming-meetings?limit=10
Returns: { meetings[] }
```

---

## 3. Cases

### List Cases

```javascript
GET /api/panelist/cases?page=1&limit=10&status=in_progress&type=marriage&search=keyword

Query params:
- page, limit (pagination)
- status: open | assigned | in_progress | resolved | closed
- type: marriage | land | property | family
- priority: low | medium | high | urgent
- search (title, description, caseId)

Returns: { cases[], pagination: { current, pages, total, hasNext, hasPrev } }
```

### Get Case Details

```javascript
GET /api/panelist/cases/:caseId
Returns: {
  case: { /* full case data */ },
  myResolution: { /* your resolution if exists */ },
  allResolutions: [ /* other panelists' resolutions */ ]
}
```

### Get Case Parties

```javascript
GET /api/panelist/cases/:caseId/parties
Returns: { parties: [{ name, contact, role }], createdBy: {} }
```

### Get Case Documents

```javascript
GET /api/panelist/cases/:caseId/documents
Returns: { documents: [{ name, url, size, mimetype, uploadedAt }] }
```

### Upload Document

```javascript
POST /api/panelist/cases/:caseId/documents
Body: { name, url, key, size, mimetype }
// Upload to S3 first, then send metadata
```

### Add Note

```javascript
POST /api/panelist/cases/:caseId/notes
Body: {
  content: "note text",
  noteType: "general" | "progress" | "internal"
}
```

### Get Timeline

```javascript
GET /api/panelist/cases/:caseId/timeline?page=1&limit=50
Returns: { activities[], pagination }
```

---

## 4. Resolutions

### Submit Resolution

```javascript
POST /api/panelist/cases/:caseId/resolution/submit
Body: {
  resolutionStatus: "resolved" | "no_outcome",
  resolutionNotes: "detailed explanation...",
  outcome: "specific terms..." (required if resolved),
  recommendations: "follow-up actions..." (optional)
}

Returns: {
  resolution,
  resolutionComplete: false, // true when all panelists submit
  progress: { total: 3, submitted: 2, pending: 1 }
}

Note: Cannot modify after submission
```

### Update Draft

```javascript
PATCH /api/panelist/cases/:caseId/resolution/update
Body: { resolutionStatus, resolutionNotes, outcome, recommendations }
// Only works for unsubmitted resolutions
```

### Get Resolution Status

```javascript
GET /api/panelist/cases/:caseId/resolution/status
Returns: {
  myResolution: {},
  allResolutions: [{ panelist, isSubmitted, submittedAt }],
  progress: { total, submitted, pending }
}
```

---

## 5. Meetings

### Schedule Meeting

```javascript
POST /api/panelist/meetings
Body: {
  title: "Initial Consultation",
  description: "...",
  caseId: "case_id",
  attendees: [{
    name, email, phone, role,
    isParty: true,
    status: "invited"
  }],
  scheduledDate: "2024-01-25T10:00:00Z",
  duration: 60, // minutes
  meetingType: "video" | "phone" | "in-person",
  meetingLink: "https://meet.google.com/..." (for video),
  location: "address" (for in-person)
}
```

### List Meetings

```javascript
GET /api/panelist/meetings?page=1&limit=10&upcoming=true&caseId=case_id

Query params:
- status: scheduled | completed | cancelled | rescheduled
- caseId
- upcoming: true/false
- past: true/false

Returns: { meetings[], pagination }
```

### Get Meeting

```javascript
GET /api/panelist/meetings/:meetingId
```

### Update Meeting

```javascript
PATCH /api/panelist/meetings/:meetingId
Body: { title, description, scheduledDate, duration, meetingLink, status }
```

### Cancel Meeting

```javascript
DELETE /api/panelist/meetings/:meetingId
// Marks as cancelled, doesn't delete
```

### Add Meeting Notes

```javascript
POST /api/panelist/meetings/:meetingId/notes
Body: {
  notes: "meeting summary...",
  outcome: "decisions made...",
  nextSteps: "follow-up actions..."
}
// Automatically marks meeting as completed
```

---

## 6. Messages

### List Messages

```javascript
GET /api/panelist/messages?page=1&limit=20&caseId=case_id&unreadOnly=true

Query params:
- caseId
- unreadOnly: true/false
- sortBy, sortOrder

Returns: { messages[], unreadCount, pagination }
```

### Get Case Messages

```javascript
GET /api/panelist/messages/cases/:caseId?page=1&limit=50
```

### Send Message

```javascript
POST /api/panelist/messages/send
Body: {
  caseId: "case_id",
  subject: "Meeting Reminder",
  content: "message text...",
  recipients: [{
    recipientType: "party" | "panelist" | "admin" | "all_parties",
    name, email
  }],
  messageType: "general" | "meeting_notification" | "case_update" | "resolution_request",
  priority: "low" | "normal" | "high" | "urgent",
  attachments: [{ name, url, key, size, mimetype }] (optional)
}
```

### Mark as Read

```javascript
PATCH /api/panelist/messages/:messageId/read
```

### Get Unread Count

```javascript
GET / api / panelist / messages / unread - count;
Returns: {
  unreadCount: 5;
}
```

### Delete Message

```javascript
DELETE /api/panelist/messages/:messageId
// Soft delete, only for messages you sent
```

---

## 7. Profile

### Get Profile

```javascript
GET /api/panelist/profile
Returns: {
  user: { firstName, lastName, email, phone, address },
  panelist: {
    name, age, occupation, education, specializations,
    experience, bio, certifications, languages,
    availability: { status, maxCases, currentCaseLoad },
    rating: { average, count },
    statistics: { totalCasesHandled, casesResolved, averageResolutionTime }
  }
}
```

### Update Profile

```javascript
PATCH / api / panelist / profile;
Body: {
  bio, languages, certifications;
}

// Certification format:
{
  name, issuingOrganization, issueDate, expiryDate;
}
```

### Update Availability

```javascript
PATCH /api/panelist/profile/availability
Body: {
  status: "available" | "busy" | "unavailable",
  maxCases: 8
}
```

### Update Profile Picture

```javascript
PATCH / api / panelist / profile / profile - picture;
Body: {
  url, key;
}
// Upload to S3 first, then send metadata
```

### Update Account Info

```javascript
PATCH /api/panelist/profile/account
Body: {
  firstName, lastName, phone,
  address: { street, city, state, zipCode, country }
}
```

---

## Key UI Components Needed

### 1. **Dashboard Page**

- Stats cards (active cases, pending resolutions, meetings, messages)
- Recent activity feed
- Upcoming meetings list
- Quick actions (new meeting, view cases)

### 2. **Cases Page**

- Filterable/searchable case list
- Status/priority badges
- Case cards with metadata
- Pagination

### 3. **Case Detail Page**

- Tabs: Overview, Parties, Documents, Notes, Timeline
- Resolution section with submission form
- Action buttons (schedule meeting, send message, add note)
- Other panelists' resolution status

### 4. **Resolution Form**

- Radio: Resolved/No Outcome
- Textarea: Resolution Notes (required, min 50 chars)
- Textarea: Outcome (required if resolved)
- Textarea: Recommendations (optional)
- Save Draft / Submit buttons
- Progress indicator (X/Y panelists submitted)

### 5. **Meetings Page**

- List with filters (upcoming/past)
- Meeting cards with date/time, type, case info
- Join button for video meetings

### 6. **Meeting Form**

- Title, description
- Date/time pickers
- Duration input
- Meeting type selector
- Conditional fields (link for video, location for in-person)
- Attendee list with add/remove

### 7. **Messages Page**

- Inbox-style list
- Unread badge in navbar
- Message preview cards
- Compose message form
- File upload for attachments

### 8. **Profile Page**

- View/edit toggle
- Profile picture upload
- Availability settings
- Statistics display
- Certifications list
- Change password form

---

## Error Handling

All endpoints return:

```javascript
// Success
{ status: "success", data: {}, message: "..." }

// Error
{ status: "error", message: "Error description" }
```

**HTTP Codes:**

- 200: Success (GET/PATCH/DELETE)
- 201: Created (POST)
- 400: Bad request / Validation error
- 401: Unauthorized (invalid/missing token)
- 403: Forbidden (not your case)
- 404: Not found
- 500: Server error

**Handle token expiration:**

```javascript
if (error.status === 401) {
  localStorage.removeItem('authToken');
  redirect('/login');
}
```

---

## File Upload Pattern

```javascript
// 1. Upload to S3
const formData = new FormData();
formData.append('file', file);
const { url, key } = await api.post('/api/upload', formData);

// 2. Send metadata to backend
await api.post('/api/panelist/cases/:caseId/documents', {
  name: file.name,
  url,
  key,
  size: file.size,
  mimetype: file.type,
});
```

---

## State Management Tips

**Store globally:**

- Auth token
- Current user/panelist data
- Unread message count

**Fetch on page load:**

- Cases list
- Dashboard stats
- Meetings list
- Messages

**Refetch after:**

- Submitting resolution → case details
- Adding note → case timeline
- Scheduling meeting → meetings list
- Sending message → messages list

**Real-time updates (optional):**

- New messages
- Meeting reminders
- Case assignments
