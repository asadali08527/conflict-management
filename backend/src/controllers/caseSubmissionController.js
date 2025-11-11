const { v4: uuidv4 } = require('uuid');
const CaseSubmission = require('../models/CaseSubmission');
const CaseSubmissionData = require('../models/CaseSubmissionData');
const CaseFile = require('../models/CaseFile');
const Case = require('../models/Case');
const s3Service = require('../services/s3Service');

// Create a new submission session
const createSession = async (req, res) => {
  try {
    const sessionId = uuidv4();

    const submission = new CaseSubmission({
      sessionId,
      userId: req.user ? req.user.id : null,
      status: 'draft',
      currentStep: 1,
      completedSteps: []
    });

    await submission.save();

    res.status(201).json({
      success: true,
      sessionId,
      message: 'Session created successfully',
      startedAt: submission.createdAt
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Internal server error'
    });
  }
};

// Get session data
const getSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const submission = await CaseSubmission.findOne({ sessionId });
    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'SESSION_NOT_FOUND',
        message: 'Session not found'
      });
    }

    const submissionData = await CaseSubmissionData.find({ sessionId }).sort({ stepId: 1 });

    const data = {};
    submissionData.forEach(item => {
      switch (item.stepId) {
        case 1:
          data.caseOverview = item.data;
          break;
        case 2:
          data.partiesInvolved = item.data;
          break;
        case 3:
          data.conflictBackground = item.data;
          break;
        case 4:
          data.desiredOutcomes = item.data;
          break;
        case 5:
          data.schedulingPreferences = item.data;
          break;
        case 6:
          data.documents = item.data;
          break;
      }
    });

    res.json({
      success: true,
      sessionId,
      currentStep: submission.currentStep,
      completedSteps: submission.completedSteps,
      status: submission.status,
      data,
      lastModified: submission.updatedAt
    });
  } catch (error) {
    console.error('Error getting session:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Internal server error'
    });
  }
};

// Get case draft data
const getCaseDraft = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const submission = await CaseSubmission.findOne({ sessionId });
    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'SESSION_NOT_FOUND',
        message: 'Session not found'
      });
    }

    const submissionData = await CaseSubmissionData.find({ sessionId }).sort({ stepId: 1 });

    const data = {};
    submissionData.forEach(item => {
      switch (item.stepId) {
        case 1:
          data.caseOverview = item.data;
          break;
        case 2:
          data.partiesInvolved = item.data;
          break;
        case 3:
          data.conflictBackground = item.data;
          break;
        case 4:
          data.desiredOutcomes = item.data;
          break;
        case 5:
          data.schedulingPreferences = item.data;
          break;
        case 6:
          data.documents = item.data;
          break;
      }
    });

    res.json({
      sessionId,
      currentStep: submission.currentStep,
      completedSteps: submission.completedSteps,
      data,
      lastModified: submission.updatedAt
    });
  } catch (error) {
    console.error('Error getting case draft:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Internal server error'
    });
  }
};

// Update session metadata
const updateSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { currentStep } = req.body;

    const submission = await CaseSubmission.findOne({ sessionId });
    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'SESSION_NOT_FOUND',
        message: 'Session not found'
      });
    }

    if (currentStep) {
      submission.currentStep = currentStep;
    }

    await submission.save();

    res.json({
      success: true,
      message: 'Session updated successfully',
      sessionId,
      currentStep: submission.currentStep
    });
  } catch (error) {
    console.error('Error updating session:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Internal server error'
    });
  }
};

// Save step data
const saveStepData = async (sessionId, stepId, data) => {
  try {
    await CaseSubmissionData.findOneAndUpdate(
      { sessionId, stepId },
      { data, completed: true },
      { upsert: true, new: true }
    );

    // Update submission with completed step
    const submission = await CaseSubmission.findOne({ sessionId });
    if (submission && !submission.completedSteps.includes(stepId)) {
      submission.completedSteps.push(stepId);
      submission.currentStep = Math.min(stepId + 1, 6);
      await submission.save();
    }

    return { success: true };
  } catch (error) {
    throw error;
  }
};

// Step 1: Case Overview
const submitStep1 = async (req, res) => {
  try {
    const { sessionId, caseOverview } = req.body;

    await saveStepData(sessionId, 1, caseOverview);

    res.json({
      success: true,
      message: 'Step 1 data saved successfully',
      sessionId,
      nextStep: 2,
      validationErrors: null
    });
  } catch (error) {
    console.error('Error submitting step 1:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Internal server error'
    });
  }
};

// Step 2: Parties Involved
const submitStep2 = async (req, res) => {
  try {
    const { sessionId, partiesInvolved } = req.body;

    await saveStepData(sessionId, 2, partiesInvolved);

    res.json({
      success: true,
      message: 'Step 2 data saved successfully',
      sessionId,
      nextStep: 3,
      validationErrors: null
    });
  } catch (error) {
    console.error('Error submitting step 2:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Internal server error'
    });
  }
};

// Step 3: Conflict Background
const submitStep3 = async (req, res) => {
  try {
    const { sessionId, conflictBackground } = req.body;

    await saveStepData(sessionId, 3, conflictBackground);

    res.json({
      success: true,
      message: 'Step 3 data saved successfully',
      sessionId,
      nextStep: 4,
      validationErrors: null
    });
  } catch (error) {
    console.error('Error submitting step 3:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Internal server error'
    });
  }
};

// Step 4: Desired Outcomes
const submitStep4 = async (req, res) => {
  try {
    const { sessionId, desiredOutcomes } = req.body;

    await saveStepData(sessionId, 4, desiredOutcomes);

    res.json({
      success: true,
      message: 'Step 4 data saved successfully',
      sessionId,
      nextStep: 5,
      validationErrors: null
    });
  } catch (error) {
    console.error('Error submitting step 4:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Internal server error'
    });
  }
};

// Step 5: Scheduling Preferences
const submitStep5 = async (req, res) => {
  try {
    const { sessionId, schedulingPreferences } = req.body;

    await saveStepData(sessionId, 5, schedulingPreferences);

    res.json({
      success: true,
      message: 'Step 5 data saved successfully',
      sessionId,
      nextStep: 6,
      validationErrors: null
    });
  } catch (error) {
    console.error('Error submitting step 5:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Internal server error'
    });
  }
};

// Step 6: Document Upload
/**
 * Note: With the new S3 direct upload flow, files are uploaded directly to S3 from the frontend
 * using presigned URLs (via POST /api/files/generate-upload-url and POST /api/files/save-file-record).
 *
 * The file records are already saved in the CaseFile collection during the upload process.
 * This endpoint just retrieves the uploaded files for the session and marks step 6 as complete.
 *
 * For backward compatibility, this endpoint still supports the old multer-based upload flow.
 */
const submitStep6 = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const files = req.files || [];
    const descriptions = req.body.descriptions ? JSON.parse(req.body.descriptions) : [];

    let uploadedFiles = [];

    // Check if files were uploaded using the old flow (multer)
    if (files && files.length > 0) {
      // Old flow: Upload files via multer
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const description = descriptions[i] || '';

        // Upload to S3
        const uploadResult = await s3Service.uploadFile(file, 'cases');

        // Save file info to database
        const caseFile = new CaseFile({
          sessionId,
          fileName: uploadResult.key,
          originalName: file.originalname,
          fileSize: file.size,
          fileType: file.mimetype,
          storagePath: `s3://${s3Service.bucketName}/${uploadResult.key}`,
          storageKey: uploadResult.key,
          description,
          uploadUrl: uploadResult.url
        });

        await caseFile.save();

        uploadedFiles.push({
          fileName: file.originalname,
          fileSize: file.size,
          fileType: file.mimetype,
          uploadUrl: uploadResult.url
        });
      }
    } else {
      // New flow: Files already uploaded via presigned URLs
      // Retrieve the uploaded files from CaseFile collection
      const caseFiles = await CaseFile.find({ sessionId });
      uploadedFiles = caseFiles.map(file => ({
        fileName: file.originalName,
        fileSize: file.fileSize,
        fileType: file.fileType,
        uploadUrl: file.uploadUrl,
        storageKey: file.storageKey
      }));
    }

    await saveStepData(sessionId, 6, { uploadedFiles });

    res.json({
      success: true,
      message: 'Step 6 data saved successfully',
      sessionId,
      uploadedFiles,
      nextStep: 'final_submission',
      validationErrors: null
    });
  } catch (error) {
    console.error('Error submitting step 6:', error);
    res.status(500).json({
      success: false,
      error: 'FILE_UPLOAD_ERROR',
      message: 'Error processing files'
    });
  }
};

// Join an existing case as Party B
const joinCase = async (req, res) => {
  try {
    const { parentSessionId, userId } = req.body;

    // Verify parent session exists and is submitted
    const parentSubmission = await CaseSubmission.findOne({ sessionId: parentSessionId });
    if (!parentSubmission) {
      return res.status(404).json({
        success: false,
        error: 'SESSION_NOT_FOUND',
        message: 'The case session you are trying to join does not exist'
      });
    }

    if (parentSubmission.status !== 'submitted') {
      return res.status(400).json({
        success: false,
        error: 'CASE_NOT_SUBMITTED',
        message: 'The case must be submitted before Party B can join'
      });
    }

    // Check if Party B has already joined
    if (parentSubmission.linkedSessionId) {
      return res.status(400).json({
        success: false,
        error: 'PARTY_B_ALREADY_JOINED',
        message: 'Party B has already joined this case',
        existingSessionId: parentSubmission.linkedSessionId
      });
    }

    // Create new session for Party B
    const partyBSessionId = uuidv4();

    const partyBSubmission = new CaseSubmission({
      sessionId: partyBSessionId,
      userId: userId || (req.user ? req.user.id : null),
      status: 'draft',
      currentStep: 1,
      completedSteps: [],
      parentSessionId: parentSessionId,
      submitterType: 'party_b'
    });

    await partyBSubmission.save();

    // Link Party B's session to Party A's session
    parentSubmission.linkedSessionId = partyBSessionId;
    await parentSubmission.save();

    res.status(201).json({
      success: true,
      sessionId: partyBSessionId,
      message: 'Successfully joined the case as Party B',
      parentSessionId: parentSessionId,
      startedAt: partyBSubmission.createdAt
    });
  } catch (error) {
    console.error('Error joining case:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Internal server error'
    });
  }
};

// Final submission
const submitCase = async (req, res) => {
  try {
    const { sessionId, submittedAt, submitterUserId } = req.body;

    const submission = await CaseSubmission.findOne({ sessionId });
    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'SESSION_NOT_FOUND',
        message: 'Session not found'
      });
    }

    // Get all step data
    const submissionData = await CaseSubmissionData.find({ sessionId }).sort({ stepId: 1 });
    if (submissionData.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'INCOMPLETE_SUBMISSION',
        message: 'All steps must be completed before submission'
      });
    }

    // Handle Party B submission differently
    if (submission.submitterType === 'party_b') {
      // Party B just marks their submission as complete, doesn't create a Case
      submission.status = 'submitted';
      submission.submittedAt = submittedAt || new Date();
      await submission.save();

      // Get parent submission to return case info
      const parentSubmission = await CaseSubmission.findOne({ sessionId: submission.parentSessionId });
      const caseId = parentSubmission ? parentSubmission.caseId : null;

      // Update the Case with Party B's sessionId for easier lookups
      if (caseId) {
        await Case.findOneAndUpdate(
          { caseId: caseId },
          { linkedSessionId: sessionId }
        );
      }

      return res.json({
        success: true,
        message: 'Your response has been submitted successfully',
        caseId,
        submitterType: 'party_b',
        estimatedProcessingTime: '2-3 business days',
        nextSteps: 'An admin will review both parties\' submissions and contact you'
      });
    }

    // Party A submission - Create the actual Case
    // Generate unique case ID
    const caseId = `CASE-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

    // Create the actual case from submission data
    const stepData = {};
    submissionData.forEach(item => {
      stepData[item.stepId] = item.data;
    });

    const caseOverview = stepData[1];
    const partiesInvolved = stepData[2];
    const conflictBackground = stepData[3];

    // Get uploaded files
    const caseFiles = await CaseFile.find({ sessionId });

    // Map conflict type to case type enum
    const conflictTypeMapping = {
      'Marriage/Divorce': 'marriage',
      'Marriage': 'marriage',
      'Divorce': 'marriage',
      'Land Dispute': 'land',
      'Land': 'land',
      'Property Dispute': 'property',
      'Property': 'property',
      'Family Dispute': 'family',
      'Family': 'family',
      'Other': 'family'
    };

    const caseType = conflictTypeMapping[caseOverview.conflictType] || 'family';

    // Map urgency level to priority enum
    const priorityMapping = {
      'low': 'low',
      'medium': 'medium',
      'high': 'high',
      'urgent': 'urgent',
      'critical': 'urgent'
    };

    const priority = priorityMapping[caseOverview.urgencyLevel?.toLowerCase()] || 'medium';

    const newCase = new Case({
      caseId: caseId,
      sessionId: sessionId, // Store Party A's sessionId
      linkedSessionId: submission.linkedSessionId || null, // Store Party B's sessionId if already joined
      title: `${caseOverview.conflictType} - ${caseOverview.description.substring(0, 50)}...`,
      description: caseOverview.description,
      type: caseType,
      priority: priority,
      createdBy: submission.userId || submitterUserId,
      parties: partiesInvolved.parties.map(party => ({
        name: party.name,
        contact: party.email,
        role: party.role
      })),
      documents: caseFiles.map(file => ({
        name: file.originalName,
        url: file.uploadUrl,
        key: file.storageKey,
        size: file.fileSize,
        mimetype: file.fileType
      }))
    });

    await newCase.save();

    // Update submission status
    submission.caseId = caseId;
    submission.status = 'submitted';
    submission.submittedAt = submittedAt || new Date();
    await submission.save();

    res.json({
      success: true,
      caseId,
      message: 'Case submitted successfully',
      submitterType: 'party_a',
      estimatedProcessingTime: '2-3 business days',
      nextSteps: 'You will receive a confirmation email within 24 hours',
      trackingUrl: `/case/${caseId}/status`
    });
  } catch (error) {
    console.error('Error submitting case:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Internal server error'
    });
  }
};

module.exports = {
  createSession,
  getSession,
  getCaseDraft,
  updateSession,
  submitStep1,
  submitStep2,
  submitStep3,
  submitStep4,
  submitStep5,
  submitStep6,
  submitCase,
  joinCase
};