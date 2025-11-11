# S3 File Upload Integration Guide

## Overview

This guide explains how to implement file uploads using AWS S3 with presigned URLs. This approach provides:

- **Direct client-to-S3 uploads** (faster, no backend bottleneck)
- **Secure uploads** with temporary presigned URLs (1-hour expiry)
- **Private file storage** with presigned URLs for viewing/downloading
- **Consistent flow** across all upload contexts (profile pictures, case documents, messages, etc.)

## Architecture

```
Frontend → Generate Presigned URL → Upload to S3 → Save File Record → Done
```

### Flow Steps:

1. **Frontend**: Request presigned upload URL from backend
2. **Backend**: Generate presigned URL and S3 key
3. **Frontend**: Upload file directly to S3 using presigned URL
4. **Frontend**: Notify backend that upload is complete
5. **Backend**: Save file metadata to database

## API Endpoints

### 1. Get Upload Configuration

Get allowed file types, sizes, and contexts.

```http
GET /api/files/config
Authorization: Bearer {token}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "fileTypes": {
      "image": {
        "mimes": ["image/jpeg", "image/png", "image/gif"],
        "extensions": [".jpg", ".jpeg", ".png", ".gif"],
        "maxSize": 5242880
      },
      "document": {
        "mimes": ["application/pdf", "application/msword", ...],
        "extensions": [".pdf", ".doc", ".docx", ".txt"],
        "maxSize": 10485760
      }
    },
    "uploadContexts": {
      "profile": {
        "allowedTypes": ["image"],
        "maxSize": 5242880,
        "maxFiles": 1
      },
      "case": {
        "allowedTypes": ["image", "document", "spreadsheet", "presentation"],
        "maxSize": 10485760,
        "maxFiles": 10
      }
    },
    "presignedUrlExpiry": 3600
  }
}
```

### 2. Generate Presigned Upload URL

Request a presigned URL for uploading a file.

```http
POST /api/files/generate-upload-url
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "fileName": "document.pdf",
  "fileType": "application/pdf",
  "fileSize": 1024000,
  "uploadContext": "case",
  "sessionId": "uuid-here", // Optional: for case submission
  "caseId": "caseId-here" // Optional: for existing case
}
```

**Upload Contexts:**

- `profile` - User profile pictures
- `case` - Case documents (submission or existing case)
- `message` - Message attachments
- `resolution` - Resolution documents

**Response:**

```json
{
  "status": "success",
  "data": {
    "uploadUrl": "https://s3.amazonaws.com/...",
    "fileKey": "cases/1234567890-uuid.pdf",
    "bucket": "conflict-management-files",
    "expiresIn": 3600,
    "fileName": "document.pdf"
  }
}
```

### 3. Upload File to S3

Upload the file directly to S3 using the presigned URL.

```http
PUT {uploadUrl}
Content-Type: {fileType}
Body: {file binary data}
```

**Important:** Use `PUT` method, not `POST`. Set `Content-Type` header to match the file's MIME type.

### 4. Save File Record

After successful S3 upload, save file metadata to database.

```http
POST /api/files/save-file-record
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "fileKey": "cases/1234567890-uuid.pdf",
  "fileName": "document.pdf",
  "fileSize": 1024000,
  "fileType": "application/pdf",
  "uploadContext": "case",
  "sessionId": "uuid-here", // Optional
  "caseId": "caseId-here", // Optional
  "description": "Contract document" // Optional
}
```

**Response:**

```json
{
  "status": "success",
  "message": "File record saved successfully",
  "data": {
    "file": {
      "name": "document.pdf",
      "url": "https://s3.amazonaws.com/...",
      "key": "cases/1234567890-uuid.pdf",
      "size": 1024000,
      "mimetype": "application/pdf"
    }
  }
}
```

### 5. Get Download URL

Generate a presigned URL for downloading/viewing a file.

```http
GET /api/files/download-url/:fileKey?expiresIn=3600
Authorization: Bearer {token}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "downloadUrl": "https://s3.amazonaws.com/...",
    "expiresIn": 3600
  }
}
```

### 6. Delete File

Delete a file from S3 and database.

```http
DELETE /api/files/:fileKey?uploadContext=case&caseId=xxx&documentId=xxx
Authorization: Bearer {token}
```

## Frontend Implementation Examples

### React/JavaScript Example

```javascript
// 1. File Upload Component
async function uploadFile(
  file,
  uploadContext,
  sessionId = null,
  caseId = null
) {
  try {
    // Step 1: Generate presigned upload URL
    const urlResponse = await fetch('/api/files/generate-upload-url', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        uploadContext,
        sessionId,
        caseId,
      }),
    });

    if (!urlResponse.ok) {
      throw new Error('Failed to generate upload URL');
    }

    const urlData = await urlResponse.json();
    const { uploadUrl, fileKey } = urlData.data;

    // Step 2: Upload file directly to S3
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload file to S3');
    }

    // Step 3: Save file record to database
    const recordResponse = await fetch('/api/files/save-file-record', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileKey,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadContext,
        sessionId,
        caseId,
      }),
    });

    if (!recordResponse.ok) {
      throw new Error('Failed to save file record');
    }

    const recordData = await recordResponse.json();
    return recordData.data.file;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

// 2. Usage Example - Profile Picture Upload
async function uploadProfilePicture(file) {
  try {
    const uploadedFile = await uploadFile(file, 'profile');
    console.log('Profile picture uploaded:', uploadedFile);
    // Profile picture is automatically set in user.profilePicture
  } catch (error) {
    alert('Failed to upload profile picture');
  }
}

// 3. Usage Example - Case Document Upload
async function uploadCaseDocument(file, caseId) {
  try {
    const uploadedFile = await uploadFile(file, 'case', null, caseId);
    console.log('Case document uploaded:', uploadedFile);
    // Document is automatically added to case.documents array
  } catch (error) {
    alert('Failed to upload case document');
  }
}

// 4. Usage Example - Case Submission Upload (Step 6)
async function uploadSubmissionDocument(file, sessionId) {
  try {
    const uploadedFile = await uploadFile(file, 'case', sessionId);
    console.log('Submission document uploaded:', uploadedFile);
    // File is saved to CaseFile collection with sessionId
  } catch (error) {
    alert('Failed to upload submission document');
  }
}
```

### React Hook Example

```javascript
import { useState } from 'react';

function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const uploadFile = async (file, uploadContext, options = {}) => {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Step 1: Generate presigned URL
      setProgress(10);
      const urlResponse = await fetch('/api/files/generate-upload-url', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          uploadContext,
          ...options,
        }),
      });

      if (!urlResponse.ok) {
        const error = await urlResponse.json();
        throw new Error(error.message || 'Failed to generate upload URL');
      }

      const urlData = await urlResponse.json();
      const { uploadUrl, fileKey } = urlData.data;

      // Step 2: Upload to S3 with progress tracking
      setProgress(30);

      const xhr = new XMLHttpRequest();

      const uploadPromise = new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = 30 + (e.loaded / e.total) * 50;
            setProgress(Math.round(percentComplete));
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            resolve();
          } else {
            reject(new Error('Upload failed'));
          }
        });

        xhr.addEventListener('error', () => reject(new Error('Upload failed')));
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });

      await uploadPromise;

      // Step 3: Save file record
      setProgress(80);
      const recordResponse = await fetch('/api/files/save-file-record', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileKey,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          uploadContext,
          ...options,
        }),
      });

      if (!recordResponse.ok) {
        const error = await recordResponse.json();
        throw new Error(error.message || 'Failed to save file record');
      }

      const recordData = await recordResponse.json();
      setProgress(100);

      return recordData.data.file;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return { uploadFile, uploading, progress, error };
}

// Usage in component
function FileUploadComponent() {
  const { uploadFile, uploading, progress, error } = useFileUpload();

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const result = await uploadFile(file, 'case', {
        caseId: 'someCaseId',
      });
      console.log('Upload successful:', result);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileSelect} disabled={uploading} />
      {uploading && (
        <progress value={progress} max="100">
          {progress}%
        </progress>
      )}
      {error && <div className="error">{error}</div>}
    </div>
  );
}
```

## Upload Contexts and Use Cases

### 1. Profile Picture Upload

```javascript
uploadFile(file, 'profile');
```

- Automatically updates `user.profilePicture`
- Deletes old profile picture if exists
- Max size: 5MB
- Allowed types: Images only

### 2. Case Submission Documents (Step 6)

```javascript
uploadFile(file, 'case', sessionId);
```

- Saves to `CaseFile` collection with sessionId
- Retrieved when finalizing submission
- Max size: 10MB
- Max files: 10

### 3. Existing Case Documents

```javascript
uploadFile(file, 'case', null, caseId);
```

- Automatically adds to `case.documents` array
- Requires permission check
- Max size: 10MB
- Max files: 10

### 4. Message Attachments

```javascript
uploadFile(file, 'message');
```

- Returns file metadata to include in message
- Use returned data when creating message
- Max size: 10MB
- Max files: 5

### 5. Resolution Documents

```javascript
uploadFile(file, 'resolution');
```

- Returns file metadata to include in resolution
- Max size: 10MB
- Max files: 5

## File Validation

### Client-Side Validation (Recommended)

```javascript
function validateFile(file, uploadContext) {
  const config = {
    profile: {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      maxFiles: 1,
    },
    case: {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ],
      maxFiles: 10,
    },
  };

  const contextConfig = config[uploadContext];

  if (file.size > contextConfig.maxSize) {
    throw new Error(
      `File size exceeds ${contextConfig.maxSize / (1024 * 1024)}MB limit`
    );
  }

  if (!contextConfig.allowedTypes.includes(file.type)) {
    throw new Error('File type not allowed');
  }

  return true;
}
```

## Error Handling

### Common Errors

1. **Invalid File Type**

```json
{
  "status": "error",
  "message": "File type not allowed for case. Allowed types: .jpg, .jpeg, .png, .pdf, .doc, .docx"
}
```

2. **File Too Large**

```json
{
  "status": "error",
  "message": "File size exceeds maximum allowed size of 10MB for case"
}
```

3. **Upload Failed**

```json
{
  "status": "error",
  "message": "Failed to generate upload URL"
}
```

4. **Permission Denied**

```json
{
  "status": "error",
  "message": "You do not have permission to add documents to this case"
}
```

## Security Considerations

1. **Presigned URLs expire after 1 hour** - Users must complete upload within this time
2. **Files are stored privately in S3** - Accessed only via presigned download URLs
3. **Authentication required** - All endpoints require valid JWT token
4. **File type validation** - Both client and server validate file types
5. **Size limits enforced** - Prevents abuse and storage issues
6. **Permission checks** - Ensures users can only upload to authorized resources

## Testing

### Test Upload Flow

```bash
# 1. Get auth token
TOKEN="your-jwt-token"

# 2. Generate presigned URL
curl -X POST http://localhost:8000/api/files/generate-upload-url \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "test.pdf",
    "fileType": "application/pdf",
    "fileSize": 1024,
    "uploadContext": "case",
    "caseId": "your-case-id"
  }'

# 3. Upload file to S3 (use the uploadUrl from response)
curl -X PUT "PRESIGNED_URL_HERE" \
  -H "Content-Type: application/pdf" \
  --data-binary "@test.pdf"

# 4. Save file record
curl -X POST http://localhost:8000/api/files/save-file-record \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fileKey": "cases/1234567890-uuid.pdf",
    "fileName": "test.pdf",
    "fileSize": 1024,
    "fileType": "application/pdf",
    "uploadContext": "case",
    "caseId": "your-case-id"
  }'
```

## Backward Compatibility

The system supports both new (presigned URL) and old (multer) upload methods:

- **New flow**: Direct S3 uploads (recommended)
- **Old flow**: Upload through backend with multer (still works)

Existing endpoints like `PUT /api/users/profile` and `POST /api/cases/:id/documents` still accept file uploads via multipart/form-data for backward compatibility.

## Environment Variables

Ensure these variables are set in your `.env`:

```env
AWS_ACCESS_KEY=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=conflict-management-files
```

## Support

For questions or issues:

- Check API documentation at `/api-docs`
- Review error messages in API responses
- Check browser console for frontend errors
- Check server logs for backend errors
