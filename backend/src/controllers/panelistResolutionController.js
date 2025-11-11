const Case = require('../models/Case');
const Panelist = require('../models/Panelist');
const CaseResolution = require('../models/CaseResolution');
const CaseActivity = require('../models/CaseActivity');

/**
 * @desc    Submit or update case resolution
 * @route   POST /api/panelist/cases/:caseId/resolution/submit
 * @access  Private (Panelist only)
 */
exports.submitResolution = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { resolutionStatus, resolutionNotes, outcome, recommendations } = req.body;
    const panelistId = req.user.panelistProfile;

    if (!panelistId) {
      return res.status(400).json({
        status: 'error',
        message: 'Panelist profile not found'
      });
    }

    // Validation
    if (!resolutionStatus || !resolutionNotes) {
      return res.status(400).json({
        status: 'error',
        message: 'Resolution status and notes are required'
      });
    }

    if (!['resolved', 'no_outcome'].includes(resolutionStatus)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid resolution status'
      });
    }

    // Check if case exists
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
        message: 'You are not authorized to submit resolution for this case'
      });
    }

    // Check if resolution already exists
    let resolution = await CaseResolution.findOne({
      case: caseId,
      panelist: panelistId
    });

    const panelist = await Panelist.findById(panelistId);

    if (resolution) {
      // Update existing resolution
      if (resolution.isSubmitted) {
        return res.status(400).json({
          status: 'error',
          message: 'Resolution has already been finalized. Contact admin to make changes.'
        });
      }

      resolution.resolutionStatus = resolutionStatus;
      resolution.resolutionNotes = resolutionNotes;
      resolution.outcome = outcome || resolution.outcome;
      resolution.recommendations = recommendations || resolution.recommendations;
      resolution.isSubmitted = true;
      resolution.submittedAt = Date.now();
      await resolution.save();

      // Log activity
      await CaseActivity.logActivity({
        case: caseId,
        activityType: 'resolution_submitted',
        performedBy: {
          userType: 'panelist',
          userId: req.user._id,
          panelistId: panelistId,
          name: panelist.name
        },
        description: `${panelist.name} submitted case resolution`,
        metadata: {
          resolutionStatus
        },
        isImportant: true
      });
    } else {
      // Create new resolution
      resolution = await CaseResolution.create({
        case: caseId,
        panelist: panelistId,
        resolutionStatus,
        resolutionNotes,
        outcome,
        recommendations,
        isSubmitted: true,
        submittedAt: Date.now()
      });

      // Log activity
      await CaseActivity.logActivity({
        case: caseId,
        activityType: 'resolution_submitted',
        performedBy: {
          userType: 'panelist',
          userId: req.user._id,
          panelistId: panelistId,
          name: panelist.name
        },
        description: `${panelist.name} submitted case resolution`,
        metadata: {
          resolutionStatus
        },
        isImportant: true
      });
    }

    // Add panelist to finalizedBy list if not already there
    if (!caseItem.finalizedBy.includes(panelistId)) {
      caseItem.finalizedBy.push(panelistId);
    }

    // Update case resolution progress
    const activePanelistIds = caseItem.assignedPanelists
      .filter(ap => ap.status === 'active')
      .map(ap => ap.panelist);

    const submittedResolutions = await CaseResolution.countDocuments({
      case: caseId,
      isSubmitted: true
    });

    caseItem.resolutionProgress = {
      total: activePanelistIds.length,
      submitted: submittedResolutions,
      lastUpdated: Date.now()
    };

    // Update resolution status
    if (submittedResolutions === 0) {
      caseItem.resolutionStatus = 'not_started';
    } else if (submittedResolutions < activePanelistIds.length) {
      caseItem.resolutionStatus = 'partial';
    } else if (submittedResolutions === activePanelistIds.length) {
      caseItem.resolutionStatus = 'complete';

      // Mark case as resolved if all panelists have submitted
      if (caseItem.status !== 'resolved') {
        caseItem.status = 'resolved';
        caseItem.finalizedAt = Date.now();

        // Log case resolution
        await CaseActivity.logActivity({
          case: caseId,
          activityType: 'case_resolved',
          performedBy: {
            userType: 'system',
            userId: null,
            panelistId: null,
            name: 'System'
          },
          description: 'Case marked as resolved - all panelists have submitted resolutions',
          isImportant: true
        });

        // Update panelist statistics
        await panelist.updateOne({
          $inc: {
            'statistics.casesResolved': 1
          }
        });
      }
    }

    caseItem.updatedAt = Date.now();
    await caseItem.save();

    // Check if all resolutions are complete
    const resolutionCheck = await CaseResolution.checkCaseResolutionComplete(caseId);

    res.status(200).json({
      status: 'success',
      message: 'Resolution submitted successfully',
      data: {
        resolution,
        resolutionComplete: resolutionCheck.allSubmitted,
        progress: resolutionCheck
      }
    });
  } catch (error) {
    console.error('Submit resolution error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Update resolution (before final submission)
 * @route   PATCH /api/panelist/cases/:caseId/resolution/update
 * @access  Private (Panelist only)
 */
exports.updateResolution = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { resolutionStatus, resolutionNotes, outcome, recommendations } = req.body;
    const panelistId = req.user.panelistProfile;

    if (!panelistId) {
      return res.status(400).json({
        status: 'error',
        message: 'Panelist profile not found'
      });
    }

    // Check if case exists
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
        message: 'You are not authorized to update resolution for this case'
      });
    }

    // Find resolution
    let resolution = await CaseResolution.findOne({
      case: caseId,
      panelist: panelistId
    });

    if (!resolution) {
      // Create draft resolution
      resolution = await CaseResolution.create({
        case: caseId,
        panelist: panelistId,
        resolutionStatus: resolutionStatus || 'pending',
        resolutionNotes: resolutionNotes || '',
        outcome,
        recommendations,
        isSubmitted: false
      });
    } else {
      // Check if already submitted
      if (resolution.isSubmitted) {
        return res.status(400).json({
          status: 'error',
          message: 'Resolution has already been finalized. Contact admin to make changes.'
        });
      }

      // Update draft resolution
      if (resolutionStatus) resolution.resolutionStatus = resolutionStatus;
      if (resolutionNotes) resolution.resolutionNotes = resolutionNotes;
      if (outcome !== undefined) resolution.outcome = outcome;
      if (recommendations !== undefined) resolution.recommendations = recommendations;

      await resolution.save();
    }

    const panelist = await Panelist.findById(panelistId);

    // Log activity
    await CaseActivity.logActivity({
      case: caseId,
      activityType: 'resolution_updated',
      performedBy: {
        userType: 'panelist',
        userId: req.user._id,
        panelistId: panelistId,
        name: panelist.name
      },
      description: `${panelist.name} updated resolution draft`
    });

    res.status(200).json({
      status: 'success',
      message: 'Resolution draft updated successfully',
      data: {
        resolution
      }
    });
  } catch (error) {
    console.error('Update resolution error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Get resolution status for a case
 * @route   GET /api/panelist/cases/:caseId/resolution/status
 * @access  Private (Panelist only)
 */
exports.getResolutionStatus = async (req, res) => {
  try {
    const { caseId } = req.params;
    const panelistId = req.user.panelistProfile;

    if (!panelistId) {
      return res.status(400).json({
        status: 'error',
        message: 'Panelist profile not found'
      });
    }

    // Check if case exists
    const caseItem = await Case.findById(caseId)
      .select('assignedPanelists resolutionStatus resolutionProgress finalizedBy finalizedAt')
      .populate('finalizedBy', 'name occupation');

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
        message: 'You are not authorized to view resolution status for this case'
      });
    }

    // Get my resolution
    const myResolution = await CaseResolution.findOne({
      case: caseId,
      panelist: panelistId
    });

    // Get all resolutions status (without showing other panelists' notes)
    const allResolutions = await CaseResolution.find({
      case: caseId
    })
      .populate('panelist', 'name occupation')
      .select('panelist isSubmitted submittedAt resolutionStatus');

    // Check completion status
    const completionStatus = await CaseResolution.checkCaseResolutionComplete(caseId);

    res.status(200).json({
      status: 'success',
      data: {
        myResolution,
        caseResolutionStatus: caseItem.resolutionStatus,
        progress: caseItem.resolutionProgress,
        finalizedBy: caseItem.finalizedBy,
        finalizedAt: caseItem.finalizedAt,
        allResolutions,
        completion: completionStatus
      }
    });
  } catch (error) {
    console.error('Get resolution status error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Get my resolution for a case
 * @route   GET /api/panelist/cases/:caseId/resolution/my
 * @access  Private (Panelist only)
 */
exports.getMyResolution = async (req, res) => {
  try {
    const { caseId } = req.params;
    const panelistId = req.user.panelistProfile;

    if (!panelistId) {
      return res.status(400).json({
        status: 'error',
        message: 'Panelist profile not found'
      });
    }

    // Check if case exists
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
        message: 'You are not authorized to view resolution for this case'
      });
    }

    // Get my resolution
    const resolution = await CaseResolution.findOne({
      case: caseId,
      panelist: panelistId
    });

    res.status(200).json({
      status: 'success',
      data: {
        resolution: resolution || null,
        hasResolution: !!resolution
      }
    });
  } catch (error) {
    console.error('Get my resolution error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};
