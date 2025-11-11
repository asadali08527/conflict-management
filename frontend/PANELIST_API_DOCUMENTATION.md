# Panelist Management API Documentation

## Overview
This document describes the panelist management system that allows admins to create, manage, and assign panelists (panel members) to cases for conflict resolution.

## Architecture

### Models

#### Panelist Model (`src/models/Panelist.js`)
A comprehensive model for managing panelist information with the following key fields:
- **Basic Info**: name, age, image (S3 URL/key), occupation
- **Education**: degree, institution, year completed
- **Specializations**: Array of expertise areas (marriage, land, property, family, etc.)
- **Experience**: Years and description
- **Contact Info**: email, phone, alternate phone
- **Availability**: status (available/busy/unavailable), max cases, current case load
- **Address**: Full address details
- **Additional**: bio, certifications, languages, rating, statistics

**Key Methods:**
- `incrementCaseLoad()`: Increases current case load and updates availability status
- `decrementCaseLoad()`: Decreases current case load and updates availability status

#### Case Model Updates (`src/models/Case.js`)
Enhanced with panel assignment support:
- `assignedPanelists`: Array of panelist assignments with status tracking
- `panelAssignedAt`: Timestamp when panel was assigned
- `status`: Updated enum to include 'panel_assigned' status

## API Endpoints

### Panelist Management

#### 1. Create Panelist
```
POST /api/panelists
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Request Body:**
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
    "description": "Specializing in family mediation and conflict resolution"
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

**Response:**
```json
{
  "status": "success",
  "message": "Panelist created successfully",
  "data": {
    "panelist": { /* panelist object */ }
  }
}
```

#### 2. Get All Panelists
```
GET /api/panelists?page=1&limit=10&specialization=marriage&availability=available&search=John
Authorization: Bearer <admin-token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `specialization`: Filter by specialization
- `availability`: Filter by status (available/busy/unavailable)
- `isActive`: Filter by active status (true/false)
- `sortBy`: Sort field (default: createdAt)
- `sortOrder`: Sort order (asc/desc, default: desc)
- `search`: Search in name, occupation, email

**Response:**
```json
{
  "status": "success",
  "data": {
    "panelists": [ /* array of panelists */ ],
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

#### 3. Get Available Panelists
```
GET /api/panelists/available?caseType=marriage
Authorization: Bearer <admin-token>
```

**Query Parameters:**
- `caseType`: Filter by case type specialization

**Response:**
```json
{
  "status": "success",
  "data": {
    "panelists": [ /* available panelists */ ],
    "count": 15
  }
}
```

#### 4. Get Panelist by ID
```
GET /api/panelists/:id
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "panelist": { /* panelist details */ },
    "assignedCases": [ /* active cases */ ],
    "caseHistory": 25,
    "totalCasesHandled": 50
  }
}
```

#### 5. Update Panelist
```
PATCH /api/panelists/:id
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Request Body:** (partial update, any fields from create)
```json
{
  "availability": {
    "status": "busy",
    "maxCases": 8
  },
  "bio": "Updated biography"
}
```

#### 6. Deactivate Panelist
```
DELETE /api/panelists/:id
Authorization: Bearer <admin-token>
```

**Note:** Cannot deactivate panelists with active cases.

**Response:**
```json
{
  "status": "success",
  "message": "Panelist deactivated successfully",
  "data": {
    "panelist": { /* updated panelist */ }
  }
}
```

#### 7. Get Panelist Statistics
```
GET /api/panelists/statistics
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "overview": {
      "total": 50,
      "active": 45,
      "available": 30
    },
    "specializationDistribution": [
      { "_id": "marriage", "count": 25 },
      { "_id": "property", "count": 20 }
    ],
    "topPerformers": [ /* top 5 panelists */ ]
  }
}
```

### Panel Assignment to Cases

#### 8. Assign Panel to Case
```
POST /api/panelists/cases/:caseId/assign-panel
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "panelistIds": [
    "60d5ec49f1a2c8b1f8e4e1a1",
    "60d5ec49f1a2c8b1f8e4e1a2"
  ]
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Panel assigned to case successfully",
  "data": {
    "case": {
      /* case details with populated panelists */
      "status": "panel_assigned",
      "assignedPanelists": [
        {
          "panelist": { /* panelist details */ },
          "assignedBy": { /* admin details */ },
          "assignedAt": "2024-01-15T10:30:00Z",
          "status": "active"
        }
      ]
    }
  }
}
```

**Features:**
- Validates panelist availability
- Prevents duplicate assignments
- Updates case status to 'panel_assigned'
- Automatically increments panelist case loads
- Updates panelist availability status if needed

#### 9. Remove Panelist from Case
```
DELETE /api/panelists/cases/:caseId/panelists/:panelistId
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "status": "success",
  "message": "Panelist removed from case successfully",
  "data": {
    "case": { /* updated case */ }
  }
}
```

**Features:**
- Marks assignment as 'removed' (not deleted)
- Decrements panelist case load
- Updates case status if no active panelists remain

#### 10. Get Cases for Panelist
```
GET /api/panelists/:id/cases?page=1&limit=10&status=in_progress
Authorization: Bearer <admin-token>
```

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `status`: Filter by case status
- `sortBy`: Sort field
- `sortOrder`: Sort order

**Response:**
```json
{
  "status": "success",
  "data": {
    "panelist": {
      "id": "...",
      "name": "John Doe",
      "occupation": "Mediator",
      "currentCaseLoad": 3
    },
    "cases": [ /* assigned cases */ ],
    "pagination": { /* pagination info */ }
  }
}
```

### Admin Statistics

#### 11. Get Panel Statistics (Dashboard)
```
GET /api/admin/statistics/panel
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "overview": {
      "total": 50,
      "active": 45,
      "available": 30,
      "busy": 15,
      "casesWithPanel": 75,
      "totalActiveAssignments": 120
    },
    "specializationDistribution": [
      { "_id": "marriage", "count": 25 }
    ],
    "availabilityDistribution": [
      { "_id": "available", "count": 30 },
      { "_id": "busy", "count": 15 }
    ],
    "workload": {
      "totalCapacity": 250,
      "currentLoad": 120,
      "averageLoad": 2.67
    },
    "topPerformers": [ /* top 5 panelists */ ]
  }
}
```

## Validation Schemas

All endpoints use Joi validation:
- `createPanelistSchema`: Validates panelist creation
- `updatePanelistSchema`: Validates panelist updates
- `assignPanelSchema`: Validates panel assignments

## Error Handling

Standard error responses:
```json
{
  "status": "error",
  "message": "Error description"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad request / Validation error
- `404`: Resource not found
- `500`: Server error

## Features

### Automatic Availability Management
- Panelist availability status automatically updates based on case load
- When `currentCaseLoad >= maxCases`, status changes to 'busy'
- When case load decreases below max, status returns to 'available'

### Case Load Tracking
- Real-time tracking of panelist workload
- Statistics for balanced case distribution
- Prevents overloading panelists

### Workload Balance
- Sort available panelists by current case load
- Prioritize panelists with lower workload
- Rating-based recommendations

### Audit Trail
- Track who assigned each panelist
- Timestamp for all assignments
- Assignment status history (active/removed/completed)

## Integration with Existing System

### Case Status Flow
1. `open` → Case created
2. `assigned` → Admin assigned to case
3. `panel_assigned` → Panel members assigned
4. `in_progress` → Work in progress
5. `resolved` → Case resolved
6. `closed` → Case closed

### Dashboard Integration
Panel statistics integrated into admin dashboard at:
- `/api/admin/statistics/panel`

### File Uploads
Panelist images can be uploaded using the existing S3 upload system with `image.url` and `image.key` fields.

## Usage Example Flow

1. **Admin creates panelist**
   ```
   POST /api/panelists
   ```

2. **Admin views available panelists for a marriage case**
   ```
   GET /api/panelists/available?caseType=marriage
   ```

3. **Admin assigns 2 panelists to case**
   ```
   POST /api/panelists/cases/{caseId}/assign-panel
   Body: { "panelistIds": ["id1", "id2"] }
   ```

4. **System automatically:**
   - Updates case status to 'panel_assigned'
   - Increments panelist case loads
   - Updates panelist availability if needed

5. **Admin monitors panel workload**
   ```
   GET /api/admin/statistics/panel
   ```

## Notes

- All endpoints require admin authentication
- Panelists cannot be deleted, only deactivated
- Case assignments are tracked but not deleted for audit purposes
- System prevents assigning same panelist to a case multiple times
- Deactivation blocked if panelist has active cases
