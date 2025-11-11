const s3Service = require('../services/s3Service');
const CaseFile = require('../models/CaseFile');
const Case = require('../models/Case');
const Message = require('../models/Message');
const User = require('../models/User');
const validators = require('../utils/validators');

/**
 * @desc    Generate presigned URL for direct file upload to S3
 * @route   POST /api/files/generate-upload-url
 * @access  Private
 */
exports.generateUploadUrl = async (req, res) => {
  try {
    const { fileName, fileType, fileSize, uploadContext, sessionId, caseId } = req.body;

    // Sanitize filename
    const sanitizedFileName = validators.sanitizeFileName(fileName);

    // Validate file type
    const typeValidation = validators.validateFileType(fileType, sanitizedFileName, uploadContext);
    if (!typeValidation.valid) {
      return res.status(400).json({
        status: 'error',
        message: typeValidation.error
      });
    }

    // Validate file size
    const sizeValidation = validators.validateFileSize(fileSize, uploadContext, typeValidation.category);
    if (!sizeValidation.valid) {
      return res.status(400).json({
        status: 'error',
        message: sizeValidation.error
      });
    }

    // Determine S3 folder based on upload context
    let folder = 'documents';
    switch (uploadContext) {
      case 'profile':
        folder = 'profiles';
        break;
      case 'case':
        folder = 'cases';
        break;
      case 'message':
        folder = 'messages';
        break;
      case 'resolution':
        folder = 'resolutions';
        break;
      default:
        folder = 'documents';
    }

    // Generate presigned URL
    const result = await s3Service.generatePresignedUploadUrl(
      sanitizedFileName,
      fileType,
      folder,
      3600 // 1 hour expiry
    );

    if (!result.success) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to generate upload URL',
        error: result.error
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        uploadUrl: result.uploadUrl,
        fileKey: result.fileKey,
        bucket: result.bucket,
        expiresIn: result.expiresIn,
        fileName: sanitizedFileName
      }
    });
  } catch (error) {
    console.error('Error generating upload URL:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate upload URL',
      error: error.message
    });
  }
};

/**
 * @desc    Save file record to database after successful S3 upload
 * @route   POST /api/files/save-file-record
 * @access  Private
 */
exports.saveFileRecord = async (req, res) => {
  try {
    const {
      fileKey,
      fileName,
      fileSize,
      fileType,
      uploadContext,
      sessionId,
      caseId,
      description
    } = req.body;

    // Generate download URL for the file
    const downloadUrl = await s3Service.generatePresignedDownloadUrl(fileKey);

    let fileRecord;

    // Save file record based on context
    switch (uploadContext) {
      case 'profile':
        // Update user profile picture
        const user = await User.findById(req.user.id);
        if (!user) {
          return res.status(404).json({
            status: 'error',
            message: 'User not found'
          });
        }

        // Delete old profile picture if exists
        if (user.profilePicture && user.profilePicture.key) {
          await s3Service.deleteFile(user.profilePicture.key);
        }

        user.profilePicture = {
          url: downloadUrl,
          key: fileKey
        };
        await user.save();

        fileRecord = {
          url: downloadUrl,
          key: fileKey,
          name: fileName,
          size: fileSize,
          mimetype: fileType
        };
        break;

      case 'case':
        if (sessionId) {
          // Save to CaseFile collection for case submission flow
          fileRecord = await CaseFile.create({
            sessionId,
            fileName: fileName,
            originalName: fileName,
            fileSize,
            fileType,
            storagePath: `s3://${s3Service.bucketName}/${fileKey}`,
            storageKey: fileKey,
            uploadUrl: downloadUrl,
            description: description || ''
          });
        } else if (caseId) {
          // Add to existing case documents
          const caseItem = await Case.findById(caseId);
          if (!caseItem) {
            return res.status(404).json({
              status: 'error',
              message: 'Case not found'
            });
          }

          // Check if user has permission to add documents
          if (
            caseItem.createdBy.toString() !== req.user.id &&
            req.user.role !== 'admin'
          ) {
            return res.status(403).json({
              status: 'error',
              message: 'You do not have permission to add documents to this case'
            });
          }

          caseItem.documents.push({
            name: fileName,
            url: downloadUrl,
            key: fileKey,
            size: fileSize,
            mimetype: fileType
          });

          await caseItem.save();
          fileRecord = caseItem.documents[caseItem.documents.length - 1];
        } else {
          return res.status(400).json({
            status: 'error',
            message: 'Either sessionId or caseId is required for case uploads'
          });
        }
        break;

      case 'message':
        // Return file info to be added to message attachments
        fileRecord = {
          name: fileName,
          url: downloadUrl,
          key: fileKey,
          size: fileSize,
          mimetype: fileType
        };
        break;

      case 'resolution':
        // Return file info to be added to resolution documents
        fileRecord = {
          name: fileName,
          url: downloadUrl,
          key: fileKey,
          size: fileSize,
          mimetype: fileType
        };
        break;

      default:
        return res.status(400).json({
          status: 'error',
          message: 'Invalid upload context'
        });
    }

    res.status(201).json({
      status: 'success',
      message: 'File record saved successfully',
      data: {
        file: fileRecord
      }
    });
  } catch (error) {
    console.error('Error saving file record:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to save file record',
      error: error.message
    });
  }
};

/**
 * @desc    Get presigned download URL for a file
 * @route   GET /api/files/download-url/:fileKey
 * @access  Private
 */
exports.getDownloadUrl = async (req, res) => {
  try {
    const { fileKey } = req.params;
    const { expiresIn = 3600 } = req.query;

    if (!fileKey) {
      return res.status(400).json({
        status: 'error',
        message: 'File key is required'
      });
    }

    // Generate presigned download URL
    const downloadUrl = await s3Service.generatePresignedDownloadUrl(
      fileKey,
      parseInt(expiresIn)
    );

    res.status(200).json({
      status: 'success',
      data: {
        downloadUrl,
        expiresIn: parseInt(expiresIn)
      }
    });
  } catch (error) {
    console.error('Error generating download URL:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate download URL',
      error: error.message
    });
  }
};

/**
 * @desc    Delete a file from S3 and database
 * @route   DELETE /api/files/:fileKey
 * @access  Private
 */
exports.deleteFile = async (req, res) => {
  try {
    const { fileKey } = req.params;
    const { uploadContext, caseId, documentId } = req.query;

    if (!fileKey) {
      return res.status(400).json({
        status: 'error',
        message: 'File key is required'
      });
    }

    // Delete from S3
    const deleteResult = await s3Service.deleteFile(fileKey);

    if (!deleteResult.success) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to delete file from S3',
        error: deleteResult.error
      });
    }

    // Remove from database based on context
    if (uploadContext === 'case' && caseId && documentId) {
      const caseItem = await Case.findById(caseId);
      if (caseItem) {
        caseItem.documents = caseItem.documents.filter(
          doc => doc._id.toString() !== documentId
        );
        await caseItem.save();
      }
    }

    res.status(200).json({
      status: 'success',
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete file',
      error: error.message
    });
  }
};

/**
 * @desc    Get file upload configuration for frontend
 * @route   GET /api/files/config
 * @access  Private
 */
exports.getUploadConfig = (req, res) => {
  try {
    res.status(200).json({
      status: 'success',
      data: {
        fileTypes: validators.FILE_TYPES,
        uploadContexts: validators.UPLOAD_CONTEXTS,
        presignedUrlExpiry: 3600 // 1 hour
      }
    });
  } catch (error) {
    console.error('Error getting upload config:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get upload configuration',
      error: error.message
    });
  }
};
