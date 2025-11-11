# Panelist API Endpoints - Quick Reference

## 1. Create Panelist
```
POST /api/panelists
Authorization: Bearer <admin-token>
```

**Payload:**
```json
{
  "name": "John Doe",
  "age": 45,
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
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "alternatePhone": "+0987654321"
  },
  "availability": {
    "maxCases": 5
  },
  "bio": "Experienced mediator with focus on family conflicts",
  "languages": ["English", "Spanish"],
  "image": {
    "url": "https://s3.amazonaws.com/bucket/image.jpg",
    "key": "panelists/john-doe.jpg"
  }
}
```

## 2. Get All Panelists
```
GET /api/panelists?page=1&limit=10&specialization=marriage&availability=available&search=John
Authorization: Bearer <admin-token>
```

## 3. Get Available Panelists
```
GET /api/panelists/available?caseType=marriage
Authorization: Bearer <admin-token>
```

## 4. Get Panelist by ID
```
GET /api/panelists/:id
Authorization: Bearer <admin-token>
```

## 5. Update Panelist
```
PATCH /api/panelists/:id
Authorization: Bearer <admin-token>
```

**Payload:** (partial update, any fields from create)
```json
{
  "availability": {
    "status": "busy",
    "maxCases": 8
  },
  "bio": "Updated biography"
}
```

## 6. Deactivate Panelist
```
DELETE /api/panelists/:id
Authorization: Bearer <admin-token>
```

## 7. Get Panelist Statistics
```
GET /api/panelists/statistics
Authorization: Bearer <admin-token>
```

## 8. Assign Panel to Case
```
POST /api/panelists/cases/:caseId/assign-panel
Authorization: Bearer <admin-token>
```

**Payload:**
```json
{
  "panelistIds": [
    "60d5ec49f1a2c8b1f8e4e1a1",
    "60d5ec49f1a2c8b1f8e4e1a2"
  ]
}
```

## 9. Remove Panelist from Case
```
DELETE /api/panelists/cases/:caseId/panelists/:panelistId
Authorization: Bearer <admin-token>
```

## 10. Get Cases for Panelist
```
GET /api/panelists/:id/cases?page=1&limit=10&status=in_progress
Authorization: Bearer <admin-token>
```

## 11. Get Panel Statistics (Dashboard)
```
GET /api/admin/statistics/panel
Authorization: Bearer <admin-token>
```

All endpoints require admin authentication and return standardized JSON responses with appropriate HTTP status codes.