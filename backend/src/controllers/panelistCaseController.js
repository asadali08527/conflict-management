const Case = require('../models/Case');
const Panelist = require('../models/Panelist');
const CaseActivity = require('../models/CaseActivity');
const CaseResolution = require('../models/CaseResolution');

/**
 * @desc    Get all cases assigned to panelist
 * @route   GET /api/panelist/cases
 * @access  Private (Panelist only)
 */
exports.getMyCases = async (req, res) => {
  try {
    const panelistId = req.user.panelistProfile;
    const {
      page = 1,
      limit = 10,
      status,
      type,
      priority,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search
    } = req.query;

    if (!panelistId) {
      return res.status(400).json({
        status: 'error',
        message: 'Panelist profile not found'
      });
    }

    // Build filter
    const filter = {
      'assignedPanelists.panelist': panelistId,
      'assignedPanelists.status': 'active'
    };

    if (status) {
      filter.status = status;
    }

    if (type) {
      filter.type = type;
    }

    if (priority) {
      filter.priority = priority;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { caseId: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate skip
    const skip = (page - 1) * limit;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const cases = await Case.find(filter)
      .populate('createdBy', 'firstName lastName email phone')
      .populate('assignedPanelists.panelist', 'name occupation specializations')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Case.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      data: {
        cases,
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
 * @desc    Get single case details
 * @route   GET /api/panelist/cases/:caseId
 * @access  Private (Panelist only)
 */
exports.getCaseById = async (req, res) => {
  try {
    const { caseId } = req.params;
    const panelistId = req.user.panelistProfile;

    if (!panelistId) {
      return res.status(400).json({
        status: 'error',
        message: 'Panelist profile not found'
      });
    }

    const caseItem = await Case.findById(caseId)
      .populate('createdBy', 'firstName lastName email phone address')
      .populate('assignedTo', 'firstName lastName email')
      .populate('assignedPanelists.panelist', 'name occupation specializations contactInfo experience')
      .populate('assignedPanelists.assignedBy', 'firstName lastName email')
      .populate('notes.createdBy', 'firstName lastName')
      .populate('notes.panelistId', 'name');

    if (!caseItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Case not found'
      });
    }

    // Check if panelist is assigned to this case
    const isAssigned = caseItem.assignedPanelists.some(
      ap => ap.panelist._id.toString() === panelistId.toString() && ap.status === 'active'
    );

    if (!isAssigned) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to access this case'
      });
    }

    // Get resolution status for this panelist
    const myResolution = await CaseResolution.findOne({
      case: caseId,
      panelist: panelistId
    });

    // Get all resolutions for this case
    const allResolutions = await CaseResolution.find({
      case: caseId
    }).populate('panelist', 'name occupation');

    res.status(200).json({
      status: 'success',
      data: {
        case: caseItem,
        myResolution,
        allResolutions: allResolutions.map(r => ({
          panelist: r.panelist,
          isSubmitted: r.isSubmitted,
          submittedAt: r.submittedAt,
          resolutionStatus: r.resolutionStatus
        }))
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
 * @desc    Get case parties details
 * @route   GET /api/panelist/cases/:caseId/parties
 * @access  Private (Panelist only)
 */
exports.getCaseParties = async (req, res) => {
  try {
    const { caseId } = req.params;
    const panelistId = req.user.panelistProfile;

    if (!panelistId) {
      return res.status(400).json({
        status: 'error',
        message: 'Panelist profile not found'
      });
    }

    const caseItem = await Case.findById(caseId)
      .populate('createdBy', 'firstName lastName email phone address');

    if (!caseItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Case not found'
      });
    }

    // Check if panelist is assigned to this case
    const isAssigned = caseItem.assignedPanelists.some(
      ap => ap.panelist.toString() === panelistId.toString() && ap.status === 'active'
    );

    if (!isAssigned) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to access this case'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        parties: caseItem.parties,
        createdBy: caseItem.createdBy
      }
    });
  } catch (error) {
    console.error('Get case parties error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Get case documents
 * @route   GET /api/panelist/cases/:caseId/documents
 * @access  Private (Panelist only)
 */
exports.getCaseDocuments = async (req, res) => {
  try {
    const { caseId } = req.params;
    const panelistId = req.user.panelistProfile;

    if (!panelistId) {
      return res.status(400).json({
        status: 'error',
        message: 'Panelist profile not found'
      });
    }

    const caseItem = await Case.findById(caseId).select('documents assignedPanelists');

    if (!caseItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Case not found'
      });
    }

    // Check if panelist is assigned to this case
    const isAssigned = caseItem.assignedPanelists.some(
      ap => ap.panelist.toString() === panelistId.toString() && ap.status === 'active'
    );

    if (!isAssigned) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to access this case'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        documents: caseItem.documents,
        count: caseItem.documents.length
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
 * @desc    Add note to case
 * @route   POST /api/panelist/cases/:caseId/notes
 * @access  Private (Panelist only)
 */
exports.addCaseNote = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { content, noteType = 'progress' } = req.body;
    const panelistId = req.user.panelistProfile;

    if (!panelistId) {
      return res.status(400).json({
        status: 'error',
        message: 'Panelist profile not found'
      });
    }

    if (!content) {
      return res.status(400).json({
        status: 'error',
        message: 'Note content is required'
      });
    }

    const caseItem = await Case.findById(caseId);

    if (!caseItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Case not found'
      });
    }

    // Check if panelist is assigned to this case
    const isAssigned = caseItem.assignedPanelists.some(
      ap => ap.panelist.toString() === panelistId.toString() && ap.status === 'active'
    );

    if (!isAssigned) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to add notes to this case'
      });
    }

    // Add note
    const note = {
      content,
      createdBy: req.user._id,
      createdByType: 'panelist',
      panelistId: panelistId,
      noteType,
      createdAt: Date.now()
    };

    caseItem.notes.push(note);
    caseItem.updatedAt = Date.now();
    await caseItem.save();

    // Log activity
    const panelist = await Panelist.findById(panelistId);
    await CaseActivity.logActivity({
      case: caseId,
      activityType: 'note_added',
      performedBy: {
        userType: 'panelist',
        userId: req.user._id,
        panelistId: panelistId,
        name: panelist.name
      },
      description: `${panelist.name} added a ${noteType} note`,
      metadata: {
        noteType
      }
    });

    const populatedCase = await Case.findById(caseId)
      .populate('notes.createdBy', 'firstName lastName')
      .populate('notes.panelistId', 'name');

    res.status(201).json({
      status: 'success',
      message: 'Note added successfully',
      data: {
        note: populatedCase.notes[populatedCase.notes.length - 1]
      }
    });
  } catch (error) {
    console.error('Add case note error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Upload document to case
 * @route   POST /api/panelist/cases/:caseId/documents
 * @access  Private (Panelist only)
 */
exports.uploadCaseDocument = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { name, url, key, size, mimetype } = req.body;
    const panelistId = req.user.panelistProfile;

    if (!panelistId) {
      return res.status(400).json({
        status: 'error',
        message: 'Panelist profile not found'
      });
    }

    if (!name || !url) {
      return res.status(400).json({
        status: 'error',
        message: 'Document name and URL are required'
      });
    }

    const caseItem = await Case.findById(caseId);

    if (!caseItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Case not found'
      });
    }

    // Check if panelist is assigned to this case
    const isAssigned = caseItem.assignedPanelists.some(
      ap => ap.panelist.toString() === panelistId.toString() && ap.status === 'active'
    );

    if (!isAssigned) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to upload documents to this case'
      });
    }

    // Add document
    const document = {
      name,
      url,
      key,
      size,
      mimetype,
      uploadedAt: Date.now()
    };

    caseItem.documents.push(document);
    caseItem.updatedAt = Date.now();
    await caseItem.save();

    // Log activity
    const panelist = await Panelist.findById(panelistId);
    await CaseActivity.logActivity({
      case: caseId,
      activityType: 'document_uploaded',
      performedBy: {
        userType: 'panelist',
        userId: req.user._id,
        panelistId: panelistId,
        name: panelist.name
      },
      description: `${panelist.name} uploaded document: ${name}`,
      metadata: {
        documentName: name,
        documentSize: size
      }
    });

    res.status(201).json({
      status: 'success',
      message: 'Document uploaded successfully',
      data: {
        document: caseItem.documents[caseItem.documents.length - 1]
      }
    });
  } catch (error) {
    console.error('Upload case document error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Get case timeline/activity
 * @route   GET /api/panelist/cases/:caseId/timeline
 * @access  Private (Panelist only)
 */
exports.getCaseTimeline = async (req, res) => {
  try {
    const { caseId } = req.params;
    const panelistId = req.user.panelistProfile;
    const { page = 1, limit = 50 } = req.query;

    if (!panelistId) {
      return res.status(400).json({
        status: 'error',
        message: 'Panelist profile not found'
      });
    }

    const caseItem = await Case.findById(caseId).select('assignedPanelists');

    if (!caseItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Case not found'
      });
    }

    // Check if panelist is assigned to this case
    const isAssigned = caseItem.assignedPanelists.some(
      ap => ap.panelist.toString() === panelistId.toString() && ap.status === 'active'
    );

    if (!isAssigned) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to access this case timeline'
      });
    }

    const timeline = await CaseActivity.getCaseTimeline(caseId, { page, limit });

    res.status(200).json({
      status: 'success',
      data: timeline
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
 * @desc    Get resolutions for a case
 * @route   GET /api/panelist/cases/:caseId/resolutions
 * @access  Private (Panelist only)
 */
exports.getCaseResolutions = async (req, res) => {
  try {
    const { caseId } = req.params;
    const panelistId = req.user.panelistProfile;

    if (!panelistId) {
      return res.status(400).json({
        status: 'error',
        message: 'Panelist profile not found'
      });
    }

    const caseItem = await Case.findById(caseId).select('assignedPanelists');

    if (!caseItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Case not found'
      });
    }

    // Check if panelist is assigned to this case
    const isAssigned = caseItem.assignedPanelists.some(
      ap => ap.panelist.toString() === panelistId.toString() && ap.status === 'active'
    );

    if (!isAssigned) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to access case resolutions'
      });
    }

    // Get all resolutions
    const resolutions = await CaseResolution.find({ case: caseId })
      .populate('panelist', 'name occupation specializations image');

    // Check resolution completion status
    const resolutionStatus = await CaseResolution.checkCaseResolutionComplete(caseId);

    res.status(200).json({
      status: 'success',
      data: {
        resolutions,
        summary: resolutionStatus
      }
    });
  } catch (error) {
    console.error('Get case resolutions error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};
