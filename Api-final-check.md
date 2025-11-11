📁 Dashboard

1. Get Dashboard Stats

GET /api/panelist/dashboard/stats
Auth: Bearer Token

2. Get Recent Activity

GET /api/panelist/dashboard/recent-activity?limit=20
Auth: Bearer Token
Query: limit (optional)

3. Get Upcoming Meetings

GET /api/panelist/dashboard/upcoming-meetings?limit=10
Auth: Bearer Token
Query: limit (optional)

4. Get Performance Metrics

GET /api/panelist/dashboard/performance
Auth: Bearer Token

📁 Profile

1. Get Profile

GET /api/panelist/profile
Auth: Bearer Token

2. Update Profile

PATCH /api/panelist/profile
Auth: Bearer Token
Body: { "bio": "", "languages": [], "certifications": [] }

3. Update Availability

PATCH /api/panelist/profile/availability
Auth: Bearer Token
Body: { "status": "available", "maxCases": 8 }

4. Update Profile Picture

PATCH /api/panelist/profile/profile-picture
Auth: Bearer Token
Body: { "url": "", "key": "" }

5. Update Account Information

PATCH /api/panelist/profile/account
Auth: Bearer Token
Body: { "firstName": "", "lastName": "", "phone": "", "address": {} }

📁 Cases

1. Get My Cases

GET /api/panelist/cases?page=1&limit=10&status=in_progress&type=marriage&search=keyword
Auth: Bearer Token
Query: page, limit, status, type, priority, sortBy, sortOrder, search

2. Get Case by ID

GET /api/panelist/cases/:caseId
Auth: Bearer Token

3. Get Case Parties

GET /api/panelist/cases/:caseId/parties
Auth: Bearer Token

4. Get Case Documents

GET /api/panelist/cases/:caseId/documents
Auth: Bearer Token

5. Upload Case Document

POST /api/panelist/cases/:caseId/documents
Auth: Bearer Token
Body: { "name": "", "url": "", "key": "", "size": 0, "mimetype": "" }

6. Add Case Note

POST /api/panelist/cases/:caseId/notes
Auth: Bearer Token
Body: { "content": "", "noteType": "progress" }

7. Get Case Timeline

GET /api/panelist/cases/:caseId/timeline?page=1&limit=50
Auth: Bearer Token
Query: page, limit

8. Get Case Resolutions

GET /api/panelist/cases/:caseId/resolutions
Auth: Bearer Token

📁 Resolutions

1. Submit Resolution

POST /api/panelist/cases/:caseId/resolution/submit
Auth: Bearer Token
Body: { "resolutionStatus": "resolved", "resolutionNotes": "", "outcome": "", "recommendations": "" }

2. Update Resolution (Draft)

PATCH /api/panelist/cases/:caseId/resolution/update
Auth: Bearer Token
Body: { "resolutionStatus": "", "resolutionNotes": "", "outcome": "", "recommendations": "" }

3. Get Resolution Status

GET /api/panelist/cases/:caseId/resolution/status
Auth: Bearer Token

4. Get My Resolution

GET /api/panelist/cases/:caseId/resolution/my
Auth: Bearer Token

📁 Meetings

1. Schedule Meeting

POST /api/panelist/meetings
Auth: Bearer Token
Body: { "title": "", "description": "", "caseId": "", "attendees": [], "scheduledDate": "", "duration": 60, "meetingType": "video", "meetingLink": "", "location": "" }

2. Get Meetings

GET /api/panelist/meetings?page=1&limit=10&upcoming=true&caseId=case_id
Auth: Bearer Token
Query: page, limit, status, caseId, upcoming, past, sortBy, sortOrder

3. Get Meeting by ID

GET /api/panelist/meetings/:meetingId
Auth: Bearer Token

4. Update Meeting

PATCH /api/panelist/meetings/:meetingId
Auth: Bearer Token
Body: { "title": "", "description": "", "scheduledDate": "", "duration": 90, "meetingLink": "", "status": "" }

5. Cancel Meeting

DELETE /api/panelist/meetings/:meetingId
Auth: Bearer Token

6. Add Meeting Notes

POST /api/panelist/meetings/:meetingId/notes
Auth: Bearer Token
Body: { "notes": "", "outcome": "", "nextSteps": "" }
