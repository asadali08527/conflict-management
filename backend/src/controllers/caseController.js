const Case = require('../models/Case');
const CaseSubmission = require('../models/CaseSubmission');
const CaseSubmissionData = require('../models/CaseSubmissionData');
const CaseFile = require('../models/CaseFile');
const fs = require('fs');
const path = require('path');
const s3Service = require('../services/s3Service');

/**
 * @desc    Create a new case
 * @route   POST /api/cases
 * @access  Private
 */
exports.createCase = async (req, res) => {
  try {
    // Add user to request body
    req.body.createdBy = req.user.id;

    // Create case
    const newCase = await Case.create(req.body);

    res.status(201).json({
      status: 'success',
      message: 'Case created successfully',
      data: {
        case: newCase
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Get all cases with pagination
 * @route   GET /api/cases
 * @access  Private
 */
exports.getCases = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Query parameters
    const queryObj = {};
    
    // Filter by user (clients can only see their own cases)
    if (req.user.role === 'client') {
      queryObj.createdBy = req.user.id;
    }

    // Filter by type if provided
    if (req.query.type) {
      queryObj.type = req.query.type;
    }

    // Filter by status if provided
    if (req.query.status) {
      queryObj.status = req.query.status;
    }

    // Execute query with pagination
    const cases = await Case.find(queryObj)
      .skip(startIndex)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'firstName lastName email');

    // Get total count for pagination
    const total = await Case.countDocuments(queryObj);

    res.status(200).json({
      status: 'success',
      data: {
        count: cases.length,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        cases
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Get case by ID
 * @route   GET /api/cases/:id
 * @access  Private
 */
exports.getCaseById = async (req, res) => {
  try {
    const caseItem = await Case.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email');

    if (!caseItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Case not found'
      });
    }

    // Check if user has permission to view this case
    if (req.user.role === 'client' && caseItem.createdBy._id.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to access this case'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        case: caseItem
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Update case status
 * @route   PUT /api/cases/:id/status
 * @access  Private
 */
exports.updateCaseStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Find case
    let caseItem = await Case.findById(req.params.id);

    if (!caseItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Case not found'
      });
    }

    // Check if user has permission to update this case
    if (req.user.role === 'client' && caseItem.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this case'
      });
    }

    // Update case status
    caseItem = await Case.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName email');

    res.status(200).json({
      status: 'success',
      message: 'Case status updated successfully',
      data: {
        case: caseItem
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Delete case
 * @route   DELETE /api/cases/:id
 * @access  Private
 */
exports.deleteCase = async (req, res) => {
  try {
    // Find case
    const caseItem = await Case.findById(req.params.id);

    if (!caseItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Case not found'
      });
    }

    // Check if user has permission to delete this case
    if (req.user.role === 'client' && caseItem.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete this case'
      });
    }

    // Delete case documents from S3 if any
    if (caseItem.documents && caseItem.documents.length > 0) {
      for (const doc of caseItem.documents) {
        if (doc.key) {
          await s3Service.deleteFile(doc.key);
        }
      }
    }

    // Delete case
    await caseItem.remove();

    res.status(200).json({
      status: 'success',
      message: 'Case deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Upload documents to a case
 * @route   POST /api/cases/:id/documents
 * @access  Private
 *
 * Note: For document uploads, use the new presigned URL flow:
 * 1. POST /api/files/generate-upload-url (with uploadContext='case' and caseId)
 * 2. Upload directly to S3 using the presigned URL from frontend
 * 3. POST /api/files/save-file-record (automatically adds document to case.documents)
 *
 * This endpoint still supports the old multer-based upload for backward compatibility.
 */
exports.uploadCaseDocuments = async (req, res) => {
  try {
    // Find case
    let caseItem = await Case.findById(req.params.id);

    if (!caseItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Case not found'
      });
    }

    // Check if user has permission to upload to this case
    if (req.user.role === 'client' && caseItem.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to upload documents to this case'
      });
    }

    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No files uploaded'
      });
    }

    // Upload files to S3 (old flow - backward compatibility)
    const uploadResults = await s3Service.uploadMultipleFiles(req.files, 'cases');

    // Filter successful uploads
    const successfulUploads = uploadResults.filter(result => result.success);
    const failedUploads = uploadResults.filter(result => !result.success);

    if (successfulUploads.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'All file uploads failed',
        errors: failedUploads.map(f => f.error)
      });
    }

    // Add document records to case
    const newDocuments = successfulUploads.map(upload => ({
      name: upload.originalName,
      url: upload.url,
      key: upload.key,
      size: upload.size,
      mimetype: upload.mimetype,
      uploadedAt: new Date()
    }));

    caseItem.documents.push(...newDocuments);
    await caseItem.save();

    // Prepare response
    const response = {
      status: 'success',
      message: `${successfulUploads.length} document(s) uploaded successfully`,
      data: {
        uploadedDocuments: newDocuments,
        case: caseItem
      }
    };

    if (failedUploads.length > 0) {
      response.warnings = {
        message: `${failedUploads.length} document(s) failed to upload`,
        errors: failedUploads.map(f => f.error)
      };
    }

    res.status(201).json(response);

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Delete a document from a case
 * @route   DELETE /api/cases/:id/documents/:documentId
 * @access  Private
 */
exports.deleteCaseDocument = async (req, res) => {
  try {
    // Find case
    const caseItem = await Case.findById(req.params.id);

    if (!caseItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Case not found'
      });
    }

    // Check if user has permission to delete from this case
    if (req.user.role === 'client' && caseItem.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete documents from this case'
      });
    }

    // Find document
    const documentIndex = caseItem.documents.findIndex(doc =>
      doc._id.toString() === req.params.documentId
    );

    if (documentIndex === -1) {
      return res.status(404).json({
        status: 'error',
        message: 'Document not found'
      });
    }

    const document = caseItem.documents[documentIndex];

    // Delete from S3 if key exists
    if (document.key) {
      const deleteResult = await s3Service.deleteFile(document.key);
      if (!deleteResult.success) {
        console.warn(`Failed to delete file from S3: ${document.key}`, deleteResult.error);
      }
    }

    // Remove document from case
    caseItem.documents.splice(documentIndex, 1);
    await caseItem.save();

    res.status(200).json({
      status: 'success',
      message: 'Document deleted successfully',
      data: {
        case: caseItem
      }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Get full case details with both parties' submissions (Admin only)
 * @route   GET /api/cases/:id/full-details
 * @access  Private/Admin
 */
exports.getFullCaseDetails = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Admin only.'
      });
    }

    // Find the case
    const caseItem = await Case.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email');

    if (!caseItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Case not found'
      });
    }

    // Find Party A's submission using caseId
    const partyASubmission = await CaseSubmission.findOne({
      caseId: `CASE-${new Date(caseItem.createdAt).getFullYear()}-${String(caseItem.createdAt.getTime()).slice(-6)}`,
      submitterType: 'party_a'
    });

    if (!partyASubmission) {
      return res.status(404).json({
        status: 'error',
        message: 'Submission data not found for this case'
      });
    }

    // Get Party A's step data
    const partyAStepData = await CaseSubmissionData.find({
      sessionId: partyASubmission.sessionId
    }).sort({ stepId: 1 });

    // Get Party A's files
    const partyAFiles = await CaseFile.find({
      sessionId: partyASubmission.sessionId
    });

    // Organize Party A's data
    const partyAData = {
      sessionId: partyASubmission.sessionId,
      status: partyASubmission.status,
      submittedAt: partyASubmission.submittedAt,
      steps: {},
      documents: partyAFiles.map(file => ({
        fileName: file.originalName,
        fileSize: file.fileSize,
        fileType: file.fileType,
        uploadUrl: file.uploadUrl,
        description: file.description,
        uploadedAt: file.createdAt
      }))
    };

    partyAStepData.forEach(step => {
      partyAData.steps[`step${step.stepId}`] = step.data;
    });

    // Initialize response object
    const responseData = {
      case: caseItem,
      partyA: partyAData,
      partyB: null,
      hasPartyBResponse: false
    };

    // Check if Party B has joined
    if (partyASubmission.linkedSessionId) {
      const partyBSubmission = await CaseSubmission.findOne({
        sessionId: partyASubmission.linkedSessionId
      });

      if (partyBSubmission) {
        // Get Party B's step data
        const partyBStepData = await CaseSubmissionData.find({
          sessionId: partyBSubmission.sessionId
        }).sort({ stepId: 1 });

        // Get Party B's files
        const partyBFiles = await CaseFile.find({
          sessionId: partyBSubmission.sessionId
        });

        // Organize Party B's data
        const partyBData = {
          sessionId: partyBSubmission.sessionId,
          status: partyBSubmission.status,
          submittedAt: partyBSubmission.submittedAt,
          steps: {},
          documents: partyBFiles.map(file => ({
            fileName: file.originalName,
            fileSize: file.fileSize,
            fileType: file.fileType,
            uploadUrl: file.uploadUrl,
            description: file.description,
            uploadedAt: file.createdAt
          }))
        };

        partyBStepData.forEach(step => {
          partyBData.steps[`step${step.stepId}`] = step.data;
        });

        responseData.partyB = partyBData;
        responseData.hasPartyBResponse = partyBSubmission.status === 'submitted';
      }
    }

    res.status(200).json({
      status: 'success',
      data: responseData
    });

  } catch (error) {
    console.error('Error fetching full case details:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};