# S3 CORS Configuration Guide

## ⚠️ IMPORTANT: Configure CORS on S3 Bucket

For the presigned URL upload flow to work from the frontend, you **MUST** configure CORS (Cross-Origin Resource Sharing) on your S3 bucket.

## Why CORS is Needed

When your frontend (running on `http://localhost:3000` or your domain) tries to upload files directly to S3, the browser will make a cross-origin request. Without proper CORS configuration, the browser will block these requests.

## How to Configure CORS

### Option 1: AWS Console (Recommended for Quick Setup)

1. **Go to AWS S3 Console**
   - Navigate to: https://console.aws.amazon.com/s3/
   - Select your bucket: `conflict-management-files`

2. **Open Permissions Tab**
   - Click on the bucket name
   - Go to the "Permissions" tab

3. **Edit CORS Configuration**
   - Scroll down to "Cross-origin resource sharing (CORS)"
   - Click "Edit"

4. **Add CORS Rules**
   Paste this JSON configuration:

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "PUT",
            "POST",
            "DELETE",
            "HEAD"
        ],
        "AllowedOrigins": [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:8000",
            "https://yourdomain.com",
            "https://www.yourdomain.com"
        ],
        "ExposeHeaders": [
            "ETag",
            "x-amz-request-id",
            "x-amz-id-2"
        ],
        "MaxAgeSeconds": 3600
    }
]
```

5. **Replace Origins**
   - Replace `https://yourdomain.com` with your actual production domain
   - Add any staging/development domains you need
   - Keep `localhost` entries for local development

6. **Save Changes**
   - Click "Save changes"

### Option 2: AWS CLI

```bash
# Create a file named cors-config.json with the content above
aws s3api put-bucket-cors \
  --bucket conflict-management-files \
  --cors-configuration file://cors-config.json
```

### Option 3: Using Node.js Script

Create a file `setup-s3-cors.js`:

```javascript
const { S3Client, PutBucketCorsCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const corsConfiguration = {
  CORSRules: [
    {
      AllowedHeaders: ['*'],
      AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
      AllowedOrigins: [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://yourdomain.com',
      ],
      ExposeHeaders: ['ETag', 'x-amz-request-id', 'x-amz-id-2'],
      MaxAgeSeconds: 3600,
    },
  ],
};

async function setupCORS() {
  try {
    const command = new PutBucketCorsCommand({
      Bucket: 'conflict-management-files',
      CORSConfiguration: corsConfiguration,
    });

    await s3Client.send(command);
    console.log('✅ CORS configuration applied successfully!');
  } catch (error) {
    console.error('❌ Error setting up CORS:', error);
  }
}

setupCORS();
```

Run it:
```bash
node setup-s3-cors.js
```

## CORS Configuration Explained

### AllowedHeaders
```json
"AllowedHeaders": ["*"]
```
Allows all headers in the request. This is needed because the frontend will send `Content-Type` and other headers.

### AllowedMethods
```json
"AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"]
```
- **PUT**: Upload files using presigned URLs
- **GET**: Download/view files using presigned URLs
- **DELETE**: Delete files (if needed)
- **HEAD**: Check file existence

### AllowedOrigins
```json
"AllowedOrigins": [
  "http://localhost:3000",
  "https://yourdomain.com"
]
```
**IMPORTANT**: List all domains where your frontend runs.

**For Development:**
- `http://localhost:3000` (React default)
- `http://localhost:3001` (alternate port)
- `http://localhost:8000` (testing)

**For Production:**
- `https://yourdomain.com`
- `https://www.yourdomain.com`
- `https://app.yourdomain.com`

**Security Note:**
- ❌ Avoid using `"*"` (wildcard) for AllowedOrigins in production
- ✅ List specific domains for better security

### ExposeHeaders
```json
"ExposeHeaders": ["ETag", "x-amz-request-id"]
```
Allows the frontend to read these response headers from S3. ETag is useful for verifying uploads.

### MaxAgeSeconds
```json
"MaxAgeSeconds": 3600
```
Browser caches CORS preflight response for 1 hour.

## Verify CORS Configuration

### Method 1: AWS Console
1. Go to S3 bucket → Permissions tab
2. Scroll to "Cross-origin resource sharing (CORS)"
3. You should see your configuration

### Method 2: AWS CLI
```bash
aws s3api get-bucket-cors --bucket conflict-management-files
```

### Method 3: Test Upload
Try uploading a file from your frontend. Check browser console:
- ✅ No CORS errors = Configuration is correct
- ❌ CORS errors = Configuration needs fixing

## Common CORS Errors and Solutions

### Error 1: "has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header"

**Cause:** AllowedOrigins doesn't include your frontend domain

**Solution:**
```json
"AllowedOrigins": [
  "http://localhost:3000",  // Add your frontend URL
  "https://yourdomain.com"
]
```

### Error 2: "Method PUT is not allowed by Access-Control-Allow-Methods"

**Cause:** PUT is not in AllowedMethods

**Solution:**
```json
"AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"]
```

### Error 3: "Request header field content-type is not allowed"

**Cause:** Content-Type not in AllowedHeaders

**Solution:**
```json
"AllowedHeaders": ["*"]  // Or specifically ["Content-Type"]
```

## S3 Bucket Policy (Additional Security)

For extra security, you can also add a bucket policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowPresignedURLAccess",
            "Effect": "Allow",
            "Principal": "*",
            "Action": [
                "s3:GetObject",
                "s3:PutObject"
            ],
            "Resource": "arn:aws:s3:::conflict-management-files/*"
        }
    ]
}
```

**To add:**
1. Go to S3 bucket → Permissions tab
2. Scroll to "Bucket policy"
3. Click "Edit" and paste the policy above

## Block Public Access Settings

Ensure these settings are configured:
1. Go to S3 bucket → Permissions tab
2. "Block public access (bucket settings)"
3. Recommended settings:
   - ✅ Block all public access (files accessed via presigned URLs only)
   - OR configure selective access based on your needs

## Testing CORS Configuration

### Test Script (Browser Console)

```javascript
// Run this in your browser console from your frontend domain
fetch('https://conflict-management-files.s3.us-east-1.amazonaws.com/', {
  method: 'HEAD'
})
.then(response => console.log('✅ CORS working!', response))
.catch(error => console.error('❌ CORS error:', error));
```

### Test with curl

```bash
curl -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: PUT" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS \
  https://conflict-management-files.s3.us-east-1.amazonaws.com/
```

Expected response headers:
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, PUT, POST, DELETE, HEAD
Access-Control-Allow-Headers: *
```

## Environment-Specific CORS

### Development CORS (Permissive)
```json
{
  "AllowedOrigins": ["*"],
  "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
  "AllowedHeaders": ["*"]
}
```
⚠️ **Only use this for development testing!**

### Production CORS (Restrictive)
```json
{
  "AllowedOrigins": [
    "https://yourdomain.com",
    "https://www.yourdomain.com"
  ],
  "AllowedMethods": ["GET", "PUT"],
  "AllowedHeaders": ["Content-Type", "x-amz-*"]
}
```
✅ **Use specific domains and methods in production**

## Troubleshooting Checklist

- [ ] CORS configuration added to S3 bucket
- [ ] AllowedOrigins includes your frontend domain
- [ ] AllowedMethods includes PUT and GET
- [ ] AllowedHeaders includes "*" or "Content-Type"
- [ ] Bucket policy allows PutObject and GetObject
- [ ] IAM user has s3:PutObject and s3:GetObject permissions
- [ ] Frontend uses HTTPS in production (HTTP for localhost is OK)
- [ ] Browser cache cleared after CORS changes

## Quick Setup Checklist

1. ✅ Configure CORS on S3 bucket (see JSON above)
2. ✅ Add your frontend domain(s) to AllowedOrigins
3. ✅ Verify CORS configuration in AWS Console
4. ✅ Test upload from frontend
5. ✅ Check browser console for CORS errors
6. ✅ Update AllowedOrigins when deploying to new domains

## Additional Resources

- [AWS S3 CORS Documentation](https://docs.aws.amazon.com/AmazonS3/latest/userguide/cors.html)
- [MDN CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [AWS S3 Security Best Practices](https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html)

---

**Remember:** After making any CORS changes, it may take a few minutes to propagate. Clear your browser cache if you still see errors.
