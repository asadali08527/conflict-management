const Case = require('../models/Case');
const CaseActivity = require('../models/CaseActivity');
const CaseResolution = require('../models/CaseResolution');
const Meeting = require('../models/Meeting');
const Panelist = require('../models/Panelist');
const CaseSubmission = require('../models/CaseSubmission');
const CaseFile = require('../models/CaseFile');

/**
 * @desc    Get all cases for the logged-in client
 * @route   GET /api/client/cases
 * @access  Private (Client only)
 */
exports.getMyCases = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      page = 1,
      limit = 10,
      status,
      type,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter = { createdBy: userId };
    if (status) filter.status = status;
    if (type) filter.type = type;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const cases = await Case.find(filter)
      .populate('assignedTo', 'firstName lastName email')
      .populate('assignedPanelists.panelist', 'name occupation specializations rating.average')
      .populate('assignedPanelists.assignedBy', 'firstName lastName')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Case.countDocuments(filter);

    // Enhance cases with resolution progress
    const enhancedCases = cases.map(caseItem => {
      const caseObj = caseItem.toObject();

      // Calculate active panelists count
      const activePanelists = caseObj.assignedPanelists?.filter(
        p => p.status === 'active'
      ).length || 0;

      caseObj.activePanelistsCount = activePanelists;

      return caseObj;
    });

    res.status(200).json({
      status: 'success',
      data: {
        cases: enhancedCases,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get my cases error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Get detailed case information for client
 * @route   GET /api/client/cases/:caseId
 * @access  Private (Client only)
 */
exports.getCaseById = async (req, res) => {
  try {
    const caseId = req.params.caseId;
    const userId = req.user._id;

    // Find case and verify ownership
    const caseItem = await Case.findOne({
      _id: caseId,
      createdBy: userId
    })
      .populate('createdBy', 'firstName lastName email phone')
      .populate('assignedTo', 'firstName lastName email')
      .populate('assignedPanelists.panelist', 'name occupation specializations rating.average')
      .populate('assignedPanelists.assignedBy', 'firstName lastName');

    if (!caseItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Case not found or you do not have access to this case'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        case: caseItem
      }
    });
  } catch (error) {
    console.error('Get case by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Get case timeline/activity for client
 * @route   GET /api/client/cases/:caseId/timeline
 * @access  Private (Client only)
 */
exports.getCaseTimeline = async (req, res) => {
  try {
    const caseId = req.params.caseId;
    const userId = req.user._id;

    // Verify case ownership
    const caseItem = await Case.findOne({
      _id: caseId,
      createdBy: userId
    });

    if (!caseItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Case not found or you do not have access to this case'
      });
    }

    // Get activities
    const activities = await CaseActivity.find({ case: caseId })
      .populate('performedBy.userId', 'firstName lastName email')
      .populate('performedBy.panelistId', 'name occupation')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: {
        activities,
        count: activities.length
      }
    });
  } catch (error) {
    console.error('Get case timeline error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Get case documents (all documents including those added by panelists/admin)
 * @route   GET /api/client/cases/:caseId/documents
 * @access  Private (Client only)
 */
exports.getCaseDocuments = async (req, res) => {
  try {
    const caseId = req.params.caseId;
    const userId = req.user._id;

    // Verify case ownership
    const caseItem = await Case.findOne({
      _id: caseId,
      createdBy: userId
    });

    if (!caseItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Case not found or you do not have access to this case'
      });
    }

    // Get documents from case model
    const caseDocuments = caseItem.documents || [];

    // Get submission files if sessionId is available
    let submissionFiles = [];
    if (caseItem.sessionId) {
      const partyAFiles = await CaseFile.find({
        sessionId: caseItem.sessionId
      }).sort({ createdAt: -1 });

      submissionFiles.push({
        source: 'Your Submission (Party A)',
        files: partyAFiles.map(file => ({
          id: file._id,
          fileName: file.originalName,
          fileSize: file.fileSize,
          fileType: file.fileType,
          uploadUrl: file.uploadUrl,
          description: file.description,
          uploadedAt: file.createdAt
        }))
      });

      // Get Party B files if available
      if (caseItem.linkedSessionId) {
        const partyBFiles = await CaseFile.find({
          sessionId: caseItem.linkedSessionId
        }).sort({ createdAt: -1 });

        submissionFiles.push({
          source: 'Other Party Submission (Party B)',
          files: partyBFiles.map(file => ({
            id: file._id,
            fileName: file.originalName,
            fileSize: file.fileSize,
            fileType: file.fileType,
            uploadUrl: file.uploadUrl,
            description: file.description,
            uploadedAt: file.createdAt
          }))
        });
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        caseDocuments: caseDocuments.map(doc => ({
          name: doc.name,
          url: doc.url,
          key: doc.key,
          size: doc.size,
          mimetype: doc.mimetype,
          uploadedAt: doc.uploadedAt,
          source: 'Added by Admin/Panelist'
        })),
        submissionFiles,
        totalDocuments: caseDocuments.length + submissionFiles.reduce((acc, sf) => acc + sf.files.length, 0)
      }
    });
  } catch (error) {
    console.error('Get case documents error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Get case notes visible to client (filtered)
 * @route   GET /api/client/cases/:caseId/notes
 * @access  Private (Client only)
 */
exports.getCaseNotes = async (req, res) => {
  try {
    const caseId = req.params.caseId;
    const userId = req.user._id;

    // Verify case ownership
    const caseItem = await Case.findOne({
      _id: caseId,
      createdBy: userId
    })
      .populate('notes.createdBy', 'firstName lastName email')
      .populate('notes.panelistId', 'name occupation');

    if (!caseItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Case not found or you do not have access to this case'
      });
    }

    // Filter notes - exclude internal notes
    const visibleNotes = caseItem.notes.filter(
      note => note.noteType !== 'internal'
    );

    res.status(200).json({
      status: 'success',
      data: {
        notes: visibleNotes,
        count: visibleNotes.length
      }
    });
  } catch (error) {
    console.error('Get case notes error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Get assigned panelists information for a case
 * @route   GET /api/client/cases/:caseId/panel
 * @access  Private (Client only)
 */
exports.getCasePanel = async (req, res) => {
  try {
    const caseId = req.params.caseId;
    const userId = req.user._id;

    // Verify case ownership
    const caseItem = await Case.findOne({
      _id: caseId,
      createdBy: userId
    })
      .populate('assignedPanelists.panelist', 'name occupation specializations rating bio isActive')
      .populate('assignedPanelists.assignedBy', 'firstName lastName');

    if (!caseItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Case not found or you do not have access to this case'
      });
    }

    // Filter active panelists and format response
    const activePanelists = caseItem.assignedPanelists
      .filter(p => p.status === 'active')
      .map(p => ({
        panelist: {
          id: p.panelist._id,
          name: p.panelist.name,
          occupation: p.panelist.occupation,
          specializations: p.panelist.specializations,
          rating: p.panelist.rating,
          bio: p.panelist.bio,
          isActive: p.panelist.isActive
        },
        assignedAt: p.assignedAt,
        assignedBy: p.assignedBy ? {
          name: `${p.assignedBy.firstName} ${p.assignedBy.lastName}`
        } : null
      }));

    res.status(200).json({
      status: 'success',
      data: {
        panelists: activePanelists,
        count: activePanelists.length,
        panelAssignedAt: caseItem.panelAssignedAt
      }
    });
  } catch (error) {
    console.error('Get case panel error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Get case resolution status and details
 * @route   GET /api/client/cases/:caseId/resolution
 * @access  Private (Client only)
 */
exports.getCaseResolution = async (req, res) => {
  try {
    const caseId = req.params.caseId;
    const userId = req.user._id;

    // Verify case ownership
    const caseItem = await Case.findOne({
      _id: caseId,
      createdBy: userId
    })
      .populate('assignedPanelists.panelist', 'name occupation')
      .populate('finalizedBy', 'name occupation');

    if (!caseItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Case not found or you do not have access to this case'
      });
    }

    // Get resolution submissions (only finalized ones)
    const resolutions = await CaseResolution.find({
      case: caseId,
      isSubmitted: true
    })
      .populate('panelist', 'name occupation specializations rating.average')
      .sort({ submittedAt: -1 });

    res.status(200).json({
      status: 'success',
      data: {
        resolutionStatus: caseItem.resolutionStatus,
        resolutionProgress: caseItem.resolutionProgress,
        finalizedAt: caseItem.finalizedAt,
        finalizedBy: caseItem.finalizedBy,
        resolutions: resolutions.map(r => ({
          id: r._id,
          panelist: {
            name: r.panelist.name,
            occupation: r.panelist.occupation,
            specializations: r.panelist.specializations,
            rating: r.panelist.rating.average
          },
          recommendation: r.recommendation,
          reasoning: r.reasoning,
          submittedAt: r.submittedAt
        }))
      }
    });
  } catch (error) {
    console.error('Get case resolution error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Get all meetings for a specific case
 * @route   GET /api/client/cases/:caseId/meetings
 * @access  Private (Client only)
 */
exports.getCaseMeetings = async (req, res) => {
  try {
    const caseId = req.params.caseId;
    const userId = req.user._id;

    // Verify case ownership
    const caseItem = await Case.findOne({
      _id: caseId,
      createdBy: userId
    });

    if (!caseItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Case not found or you do not have access to this case'
      });
    }

    // Get meetings for this case where user is an attendee
    const meetings = await Meeting.find({
      case: caseId,
      'attendees.user': userId
    })
      .populate('scheduledBy', 'firstName lastName email')
      .sort({ scheduledDate: 1 });

    res.status(200).json({
      status: 'success',
      data: {
        meetings,
        count: meetings.length
      }
    });
  } catch (error) {
    console.error('Get case meetings error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Get all meetings for client (across all cases)
 * @route   GET /api/client/meetings
 * @access  Private (Client only)
 */
exports.getMyMeetings = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      status,
      upcoming = false,
      page = 1,
      limit = 10
    } = req.query;

    // Build filter
    const filter = { 'attendees.user': userId };
    if (status) filter.status = status;
    if (upcoming === 'true') {
      filter.scheduledDate = { $gte: new Date() };
      filter.status = 'scheduled';
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const meetings = await Meeting.find(filter)
      .populate('case', 'title caseId type status')
      .populate('scheduledBy', 'firstName lastName email')
      .sort({ scheduledDate: upcoming === 'true' ? 1 : -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Meeting.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      data: {
        meetings,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get my meetings error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Get detailed meeting information
 * @route   GET /api/client/meetings/:meetingId
 * @access  Private (Client only)
 */
exports.getMeetingById = async (req, res) => {
  try {
    const meetingId = req.params.meetingId;
    const userId = req.user._id;

    // Find meeting and verify user is an attendee
    const meeting = await Meeting.findOne({
      _id: meetingId,
      'attendees.user': userId
    })
      .populate('case', 'title caseId type status description')
      .populate('scheduledBy', 'firstName lastName email')
      .populate('attendees.user', 'firstName lastName email');

    if (!meeting) {
      return res.status(404).json({
        status: 'error',
        message: 'Meeting not found or you do not have access to this meeting'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        meeting
      }
    });
  } catch (error) {
    console.error('Get meeting by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};
