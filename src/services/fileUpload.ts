import { apiRequest, API_CONFIG } from '@/lib/api';

// Types for file upload
export interface GenerateUploadUrlPayload {
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadContext: 'profile' | 'case' | 'message' | 'resolution';
  sessionId?: string;
  caseId?: string;
}

export interface GenerateUploadUrlResponse {
  status: 'success';
  data: {
    uploadUrl: string;
    fileKey: string;
    bucket: string;
    expiresIn: number;
    fileName: string;
  };
}

export interface SaveFileRecordPayload {
  fileKey: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadContext: 'profile' | 'case' | 'message' | 'resolution';
  sessionId?: string;
  caseId?: string;
  description?: string;
}

export interface SaveFileRecordResponse {
  status: 'success';
  message: string;
  data: {
    file: {
      name: string;
      url: string;
      key: string;
      size: number;
      mimetype: string;
      description?: string;
    };
  };
}

export interface UploadedFile {
  name: string;
  url: string;
  key: string;
  size: number;
  mimetype: string;
  description?: string;
}

export interface FileUploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export const fileUploadService = {
  /**
   * Generate a presigned URL for uploading a file to S3
   */
  generateUploadUrl: async (payload: GenerateUploadUrlPayload): Promise<GenerateUploadUrlResponse> => {
    return apiRequest<GenerateUploadUrlResponse>(API_CONFIG.ENDPOINTS.FILES.GENERATE_UPLOAD_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Upload file directly to S3 using presigned URL
   */
  uploadToS3: async (
    uploadUrl: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            onProgress(Math.round(percentComplete));
          }
        });
      }

      // Handle successful upload
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload aborted'));
      });

      // Send the file
      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });
  },

  /**
   * Save file record to database after successful S3 upload
   */
  saveFileRecord: async (payload: SaveFileRecordPayload): Promise<SaveFileRecordResponse> => {
    return apiRequest<SaveFileRecordResponse>(API_CONFIG.ENDPOINTS.FILES.SAVE_FILE_RECORD, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Complete file upload flow: generate URL, upload to S3, save record
   */
  uploadFile: async (
    file: File,
    uploadContext: 'profile' | 'case' | 'message' | 'resolution',
    options: {
      sessionId?: string;
      caseId?: string;
      description?: string;
      onProgress?: (progress: number) => void;
    } = {}
  ): Promise<UploadedFile> => {
    const { sessionId, caseId, description, onProgress } = options;

    try {
      // Step 1: Generate presigned upload URL
      if (onProgress) onProgress(10);

      const urlResponse = await fileUploadService.generateUploadUrl({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        uploadContext,
        sessionId,
        caseId,
      });

      const { uploadUrl, fileKey } = urlResponse.data;

      // Step 2: Upload file directly to S3
      if (onProgress) onProgress(30);

      await fileUploadService.uploadToS3(uploadUrl, file, (s3Progress) => {
        // Map S3 progress (0-100) to overall progress (30-80)
        if (onProgress) {
          const mappedProgress = 30 + (s3Progress / 100) * 50;
          onProgress(Math.round(mappedProgress));
        }
      });

      // Step 3: Save file record to database
      if (onProgress) onProgress(80);

      const recordResponse = await fileUploadService.saveFileRecord({
        fileKey,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadContext,
        sessionId,
        caseId,
        description,
      });

      if (onProgress) onProgress(100);

      return recordResponse.data.file;
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  },

  /**
   * Delete a file from S3 and database
   */
  deleteFile: async (
    fileKey: string,
    uploadContext: string,
    caseId?: string,
    documentId?: string
  ): Promise<void> => {
    const params = new URLSearchParams();
    params.append('uploadContext', uploadContext);
    if (caseId) params.append('caseId', caseId);
    if (documentId) params.append('documentId', documentId);

    const endpoint = `${API_CONFIG.ENDPOINTS.FILES.DELETE(fileKey)}?${params.toString()}`;

    await apiRequest(endpoint, {
      method: 'DELETE',
    });
  },
};

/**
 * Validate file before upload
 */
export const validateFile = (
  file: File,
  uploadContext: 'profile' | 'case' | 'message' | 'resolution'
): { valid: boolean; error?: string } => {
  const config = {
    profile: {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    },
    case: {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'text/csv',
      ],
    },
    message: {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ],
    },
    resolution: {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: [
        'image/jpeg',
        'image/png',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ],
    },
  };

  const contextConfig = config[uploadContext];

  if (file.size > contextConfig.maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${contextConfig.maxSize / (1024 * 1024)}MB limit`,
    };
  }

  if (!contextConfig.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'File type not allowed',
    };
  }

  return { valid: true };
};
