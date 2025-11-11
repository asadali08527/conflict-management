import { useState, useCallback } from 'react';
import {
  fileUploadService,
  validateFile,
  UploadedFile,
  FileUploadProgress,
} from '@/services/fileUpload';

interface UseFileUploadOptions {
  uploadContext: 'profile' | 'case' | 'message' | 'resolution';
  sessionId?: string;
  caseId?: string;
  maxFiles?: number;
  onUploadComplete?: (file: UploadedFile) => void;
  onUploadError?: (fileName: string, error: string) => void;
}

export const useFileUpload = (options: UseFileUploadOptions) => {
  const { uploadContext, sessionId, caseId, maxFiles = 5, onUploadComplete, onUploadError } = options;

  const [uploadProgress, setUploadProgress] = useState<Record<string, FileUploadProgress>>({});
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Upload a single file
   */
  const uploadFile = useCallback(
    async (file: File, description?: string): Promise<UploadedFile | null> => {
      // Validate file
      const validation = validateFile(file, uploadContext);
      if (!validation.valid) {
        const errorMsg = validation.error || 'File validation failed';
        setError(errorMsg);
        if (onUploadError) {
          onUploadError(file.name, errorMsg);
        }
        return null;
      }

      // Check max files limit
      if (uploadedFiles.length >= maxFiles) {
        const errorMsg = `Maximum ${maxFiles} files allowed`;
        setError(errorMsg);
        if (onUploadError) {
          onUploadError(file.name, errorMsg);
        }
        return null;
      }

      setIsUploading(true);
      setError(null);

      // Initialize progress tracking
      setUploadProgress((prev) => ({
        ...prev,
        [file.name]: {
          fileName: file.name,
          progress: 0,
          status: 'uploading',
        },
      }));

      try {
        const uploadedFile = await fileUploadService.uploadFile(file, uploadContext, {
          sessionId,
          caseId,
          description,
          onProgress: (progress) => {
            setUploadProgress((prev) => ({
              ...prev,
              [file.name]: {
                fileName: file.name,
                progress,
                status: 'uploading',
              },
            }));
          },
        });

        // Update progress to success
        setUploadProgress((prev) => ({
          ...prev,
          [file.name]: {
            fileName: file.name,
            progress: 100,
            status: 'success',
          },
        }));

        // Add to uploaded files list
        setUploadedFiles((prev) => [...prev, uploadedFile]);

        if (onUploadComplete) {
          onUploadComplete(uploadedFile);
        }

        return uploadedFile;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Upload failed';

        // Update progress to error
        setUploadProgress((prev) => ({
          ...prev,
          [file.name]: {
            fileName: file.name,
            progress: 0,
            status: 'error',
            error: errorMsg,
          },
        }));

        setError(errorMsg);

        if (onUploadError) {
          onUploadError(file.name, errorMsg);
        }

        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [uploadContext, sessionId, caseId, maxFiles, uploadedFiles.length, onUploadComplete, onUploadError]
  );

  /**
   * Upload multiple files
   */
  const uploadFiles = useCallback(
    async (files: File[], descriptions?: string[]): Promise<UploadedFile[]> => {
      const uploadedResults: UploadedFile[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const description = descriptions?.[i];

        const result = await uploadFile(file, description);
        if (result) {
          uploadedResults.push(result);
        }
      }

      return uploadedResults;
    },
    [uploadFile]
  );

  /**
   * Remove an uploaded file
   */
  const removeFile = useCallback(
    async (fileKey: string) => {
      try {
        await fileUploadService.deleteFile(fileKey, uploadContext, caseId);

        // Remove from uploaded files list
        setUploadedFiles((prev) => prev.filter((f) => f.key !== fileKey));

        // Remove from progress
        const fileName = uploadedFiles.find((f) => f.key === fileKey)?.name;
        if (fileName) {
          setUploadProgress((prev) => {
            const newProgress = { ...prev };
            delete newProgress[fileName];
            return newProgress;
          });
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to delete file';
        setError(errorMsg);
        throw err;
      }
    },
    [uploadContext, caseId, uploadedFiles]
  );

  /**
   * Update file description
   */
  const updateFileDescription = useCallback((fileKey: string, description: string) => {
    setUploadedFiles((prev) =>
      prev.map((file) => (file.key === fileKey ? { ...file, description } : file))
    );
  }, []);

  /**
   * Clear all uploaded files
   */
  const clearFiles = useCallback(() => {
    setUploadedFiles([]);
    setUploadProgress({});
    setError(null);
  }, []);

  /**
   * Reset error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    uploadFile,
    uploadFiles,
    removeFile,
    updateFileDescription,
    clearFiles,
    clearError,
    uploadedFiles,
    uploadProgress,
    isUploading,
    error,
    canUploadMore: uploadedFiles.length < maxFiles,
    remainingSlots: maxFiles - uploadedFiles.length,
  };
};
