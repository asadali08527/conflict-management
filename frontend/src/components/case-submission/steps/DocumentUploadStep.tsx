import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { CaseFormData } from '../CaseSubmissionForm';
import { sessionManager } from '@/services/case-submission';
import { fileUploadService, validateFile, UploadedFile } from '@/services/fileUpload';
import {
  Upload,
  FileText,
  Image,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';

interface DocumentUploadStepProps {
  data: CaseFormData;
  updateData: (section: keyof CaseFormData, data: Partial<CaseFormData[keyof CaseFormData]>) => void;
}

export interface DocumentUploadStepRef {
  uploadAllFiles: () => Promise<UploadedFile[]>;
}

interface LocalFile {
  file: File;
  description: string;
  id: string; // Unique identifier for React keys
}

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export const DocumentUploadStep = forwardRef<DocumentUploadStepRef, DocumentUploadStepProps>(
  ({ data, updateData }, ref) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const sessionId = sessionManager.getSessionId();

    // Local state for files before upload
    const [localFiles, setLocalFiles] = useState<LocalFile[]>([]);
    const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgress>>({});
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const maxFiles = 5;

    // Generate unique ID for each file
    const generateFileId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Expose uploadAllFiles method to parent
    useImperativeHandle(ref, () => ({
      uploadAllFiles: async (): Promise<UploadedFile[]> => {
        if (localFiles.length === 0) {
          return [];
        }

        setIsUploading(true);
        setError(null);
        const uploadedFiles: UploadedFile[] = [];

        try {
          for (const localFile of localFiles) {
            // Initialize progress
            setUploadProgress((prev) => ({
              ...prev,
              [localFile.file.name]: {
                fileName: localFile.file.name,
                progress: 0,
                status: 'uploading',
              },
            }));

            try {
              // Upload file to S3
              const uploadedFile = await fileUploadService.uploadFile(
                localFile.file,
                'case',
                {
                  sessionId: sessionId || undefined,
                  description: localFile.description,
                  onProgress: (progress) => {
                    setUploadProgress((prev) => ({
                      ...prev,
                      [localFile.file.name]: {
                        fileName: localFile.file.name,
                        progress,
                        status: 'uploading',
                      },
                    }));
                  },
                }
              );

              // Mark as success
              setUploadProgress((prev) => ({
                ...prev,
                [localFile.file.name]: {
                  fileName: localFile.file.name,
                  progress: 100,
                  status: 'success',
                },
              }));

              uploadedFiles.push(uploadedFile);
            } catch (err) {
              const errorMsg = err instanceof Error ? err.message : 'Upload failed';
              setUploadProgress((prev) => ({
                ...prev,
                [localFile.file.name]: {
                  fileName: localFile.file.name,
                  progress: 0,
                  status: 'error',
                  error: errorMsg,
                },
              }));
              throw new Error(`Failed to upload ${localFile.file.name}: ${errorMsg}`);
            }
          }

          // Update parent form data with uploaded files
          updateData('documents', { files: uploadedFiles });
          return uploadedFiles;
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Failed to upload files';
          setError(errorMsg);
          throw err;
        } finally {
          setIsUploading(false);
        }
      },
    }));

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);

      if (files.length === 0) return;

      const remainingSlots = maxFiles - localFiles.length;

      // Check if adding these files would exceed the limit
      if (files.length > remainingSlots) {
        setError(`You can only upload ${remainingSlots} more file(s). Maximum ${maxFiles} files allowed.`);
        return;
      }

      // Validate each file
      const validFiles: LocalFile[] = [];
      for (const file of files) {
        const validation = validateFile(file, 'case');
        if (!validation.valid) {
          setError(validation.error || 'File validation failed');
          continue;
        }

        validFiles.push({
          file,
          description: '',
          id: generateFileId(),
        });
      }

      if (validFiles.length > 0) {
        setLocalFiles((prev) => [...prev, ...validFiles]);
        setError(null);
      }

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    const handleRemoveFile = (fileId: string) => {
      setLocalFiles((prev) => prev.filter((f) => f.id !== fileId));
      setError(null);
    };

    const handleDescriptionChange = (fileId: string, description: string) => {
      setLocalFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, description } : f))
      );
    };

    const getFileIcon = (fileName: string) => {
      const extension = fileName.toLowerCase().split('.').pop();

      if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension || '')) {
        return <Image className="w-5 h-5 text-blue-600" />;
      }

      return <FileText className="w-5 h-5 text-blue-600" />;
    };

    const formatFileSize = (bytes: number) => {
      if (bytes === 0) return '0 Bytes';

      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));

      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const canUploadMore = localFiles.length < maxFiles;
    const remainingSlots = maxFiles - localFiles.length;

    return (
      <div className="space-y-6">
        {/* Important Notice */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-blue-700">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-medium">
                Please attach 1-5 most important documents related to your case. These help us understand your situation better.
                <span className="font-semibold"> Files will be uploaded when you click Continue or Submit.</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {/* File Upload Area */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">
                Supporting Documents <span className="text-red-500">*</span>
              </Label>
              <span className="text-sm text-gray-500">
                {localFiles.length} / {maxFiles} files selected
              </span>
            </div>

            {canUploadMore && (
              <Card className="border-dashed border-2 border-gray-300 hover:border-blue-400 transition-colors">
                <CardContent className="p-8">
                  <div className="text-center space-y-4">
                    <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Upload className="w-6 h-6 text-blue-600" />
                    </div>

                    <div>
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        Click to select documents
                      </p>
                      <p className="text-sm text-gray-500">
                        Accepted formats: PDF, DOC, DOCX, TXT, JPG, PNG, GIF, WEBP, XLS, XLSX, CSV, PPT, PPTX
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Maximum file size: 10MB per file • {remainingSlots} slot(s) remaining
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="mx-auto"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Choose Files
                        </>
                      )}
                    </Button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.webp,.xls,.xlsx,.csv,.ppt,.pptx"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {!canUploadMore && (
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="p-4">
                  <p className="text-amber-700 text-sm text-center">
                    Maximum {maxFiles} files reached. Remove a file to select a new one.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Upload Progress */}
          {Object.values(uploadProgress).some((p) => p.status === 'uploading') && (
            <div className="space-y-3">
              <Label className="text-base font-medium">Uploading to S3...</Label>
              {Object.values(uploadProgress)
                .filter((p) => p.status === 'uploading')
                .map((progress) => (
                  <Card key={progress.fileName} className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate flex-1">
                          {progress.fileName}
                        </p>
                        <span className="text-sm text-gray-500 ml-2">
                          {progress.progress}%
                        </span>
                      </div>
                      <Progress value={progress.progress} className="h-2" />
                    </div>
                  </Card>
                ))}
            </div>
          )}

          {/* Selected Files List (Not Uploaded Yet) */}
          {localFiles.length > 0 && !isUploading && (
            <div className="space-y-4">
              <Label className="text-base font-medium">
                Selected Files ({localFiles.length}) - Ready to Upload
              </Label>

              <div className="space-y-3">
                {localFiles.map((localFile) => (
                  <Card key={localFile.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getFileIcon(localFile.file.name)}
                      </div>

                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {localFile.file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(localFile.file.size)}
                            </p>
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFile(localFile.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-2"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`description-${localFile.id}`} className="text-sm">
                            Description (Optional)
                          </Label>
                          <Textarea
                            id={`description-${localFile.id}`}
                            placeholder="Describe what this document shows or why it's relevant to your case..."
                            value={localFile.description}
                            onChange={(e) => handleDescriptionChange(localFile.id, e.target.value)}
                            className="text-sm min-h-[60px] resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Successfully Uploaded Files */}
          {Object.values(uploadProgress).some((p) => p.status === 'success') && (
            <div className="space-y-4">
              <Label className="text-base font-medium">
                Successfully Uploaded ({Object.values(uploadProgress).filter((p) => p.status === 'success').length})
              </Label>

              <div className="space-y-3">
                {Object.values(uploadProgress)
                  .filter((p) => p.status === 'success')
                  .map((progress) => (
                    <Card key={progress.fileName} className="p-4 bg-green-50 border-green-200">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <p className="text-sm font-medium text-gray-900">
                          {progress.fileName}
                        </p>
                      </div>
                    </Card>
                  ))}
              </div>
            </div>
          )}

          {/* Validation Notice */}
          {localFiles.length === 0 && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-amber-700">
                  <AlertCircle className="w-5 h-5" />
                  <p className="text-sm">
                    At least 1 document is required to submit your case.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Helpful Tips */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-blue-800">
                    Helpful Tips for Document Upload:
                  </p>
                  <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                    <li>Include contracts, agreements, or written communications</li>
                    <li>Photos of damaged property or relevant locations</li>
                    <li>Email threads or text message screenshots</li>
                    <li>Financial records or receipts if money is involved</li>
                    <li>Any evidence that supports your version of events</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Notice */}
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Privacy & Security:</span> All uploaded documents are encrypted
                and stored securely in AWS S3. Only you, the other parties involved, and your assigned mediator will
                have access to these files. Documents will be uploaded when you click Continue or Submit Case.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Ready to Submit */}
        {localFiles.length > 0 && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <p className="text-sm text-green-700">
                  <span className="font-medium">Ready to Continue:</span> {localFiles.length} file(s) selected.
                  Click "Next" to proceed, and your files will be uploaded automatically.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }
);

DocumentUploadStep.displayName = 'DocumentUploadStep';
