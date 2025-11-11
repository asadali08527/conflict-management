const Meeting = require('../models/Meeting');
const Case = require('../models/Case');
const Panelist = require('../models/Panelist');
const CaseActivity = require('../models/CaseActivity');

/**
 * @desc    Schedule a new meeting
 * @route   POST /api/panelist/meetings
 * @access  Private (Panelist only)
 */
exports.scheduleMeeting = async (req, res) => {
  try {
    const {
      title,
      description,
      caseId,
      attendees,
      scheduledDate,
      duration,
      meetingType,
      meetingLink,
      location
    } = req.body;
    const panelistId = req.user.panelistProfile;

    if (!panelistId) {
      return res.status(400).json({
        status: 'error',
        message: 'Panelist profile not found'
      });
    }

    // Validation
    if (!title || !caseId || !scheduledDate) {
      return res.status(400).json({
        status: 'error',
        message: 'Title, case ID, and scheduled date are required'
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
        message: 'You are not authorized to schedule meetings for this case'
      });
    }

    const panelist = await Panelist.findById(panelistId);

    // Create meeting
    const meeting = await Meeting.create({
      title,
      description,
      case: caseId,
      scheduledBy: req.user._id,
      scheduledByType: 'panelist',
      panelistScheduler: panelistId,
      attendees: attendees || [],
      scheduledDate,
      duration: duration || 60,
      meetingType: meetingType || 'video',
      meetingLink,
      location,
      status: 'scheduled'
    });

    // Log activity
    await CaseActivity.logActivity({
      case: caseId,
      activityType: 'meeting_scheduled',
      performedBy: {
        userType: 'panelist',
        userId: req.user._id,
        panelistId: panelistId,
        name: panelist.name
      },
      description: `${panelist.name} scheduled meeting: ${title}`,
      metadata: {
        meetingId: meeting._id,
        scheduledDate,
        meetingType
      },
      relatedModel: {
        modelType: 'Meeting',
        modelId: meeting._id
      },
      isImportant: true
    });

    const populatedMeeting = await Meeting.findById(meeting._id)
      .populate('case', 'title caseId type')
      .populate('scheduledBy', 'firstName lastName email')
      .populate('panelistScheduler', 'name occupation');

    res.status(201).json({
      status: 'success',
      message: 'Meeting scheduled successfully',
      data: {
        meeting: populatedMeeting
      }
    });
  } catch (error) {
    console.error('Schedule meeting error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Get all meetings for panelist
 * @route   GET /api/panelist/meetings
 * @access  Private (Panelist only)
 */
exports.getMeetings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      caseId,
      upcoming,
      past,
      sortBy = 'scheduledDate',
      sortOrder = 'asc'
    } = req.query;

    // Build filter
    const filter = {
      $or: [
        { scheduledBy: req.user._id },
        { 'attendees.user': req.user._id }
      ]
    };

    if (status) {
      filter.status = status;
    }

    if (caseId) {
      filter.case = caseId;
    }

    if (upcoming === 'true') {
      filter.scheduledDate = { $gte: new Date() };
      filter.status = 'scheduled';
    }

    if (past === 'true') {
      filter.scheduledDate = { $lt: new Date() };
    }

    // Calculate skip
    const skip = (page - 1) * limit;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const meetings = await Meeting.find(filter)
      .populate('case', 'title caseId type status')
      .populate('scheduledBy', 'firstName lastName email')
      .populate('panelistScheduler', 'name occupation')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
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
    console.error('Get meetings error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Get single meeting details
 * @route   GET /api/panelist/meetings/:meetingId
 * @access  Private (Panelist only)
 */
exports.getMeetingById = async (req, res) => {
  try {
    const { meetingId } = req.params;

    const meeting = await Meeting.findById(meetingId)
      .populate('case', 'title caseId type status parties')
      .populate('scheduledBy', 'firstName lastName email phone')
      .populate('panelistScheduler', 'name occupation contactInfo')
      .populate('attendees.user', 'firstName lastName email phone');

    if (!meeting) {
      return res.status(404).json({
        status: 'error',
        message: 'Meeting not found'
      });
    }

    // Check if panelist has access to this meeting
    const hasAccess =
      meeting.scheduledBy._id.toString() === req.user._id.toString() ||
      meeting.attendees.some(a => a.user && a.user._id.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to view this meeting'
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

/**
 * @desc    Update meeting
 * @route   PATCH /api/panelist/meetings/:meetingId
 * @access  Private (Panelist only)
 */
exports.updateMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const updateData = req.body;
    const panelistId = req.user.panelistProfile;

    if (!panelistId) {
      return res.status(400).json({
        status: 'error',
        message: 'Panelist profile not found'
      });
    }

    const meeting = await Meeting.findById(meetingId);

    if (!meeting) {
      return res.status(404).json({
        status: 'error',
        message: 'Meeting not found'
      });
    }

    // Check if panelist scheduled this meeting
    if (meeting.scheduledBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only update meetings you scheduled'
      });
    }

    // Remove fields that shouldn't be updated
    delete updateData.case;
    delete updateData.scheduledBy;
    delete updateData.scheduledByType;
    delete updateData.panelistScheduler;
    delete updateData.createdAt;
    delete updateData._id;

    // Update meeting
    Object.assign(meeting, updateData);
    meeting.updatedAt = Date.now();
    await meeting.save();

    const panelist = await Panelist.findById(panelistId);

    // Log activity
    await CaseActivity.logActivity({
      case: meeting.case,
      activityType: 'meeting_updated',
      performedBy: {
        userType: 'panelist',
        userId: req.user._id,
        panelistId: panelistId,
        name: panelist.name
      },
      description: `${panelist.name} updated meeting: ${meeting.title}`,
      metadata: {
        meetingId: meeting._id
      },
      relatedModel: {
        modelType: 'Meeting',
        modelId: meeting._id
      }
    });

    const populatedMeeting = await Meeting.findById(meeting._id)
      .populate('case', 'title caseId type')
      .populate('scheduledBy', 'firstName lastName email')
      .populate('panelistScheduler', 'name occupation');

    res.status(200).json({
      status: 'success',
      message: 'Meeting updated successfully',
      data: {
        meeting: populatedMeeting
      }
    });
  } catch (error) {
    console.error('Update meeting error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Cancel meeting
 * @route   DELETE /api/panelist/meetings/:meetingId
 * @access  Private (Panelist only)
 */
exports.cancelMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const panelistId = req.user.panelistProfile;

    if (!panelistId) {
      return res.status(400).json({
        status: 'error',
        message: 'Panelist profile not found'
      });
    }

    const meeting = await Meeting.findById(meetingId);

    if (!meeting) {
      return res.status(404).json({
        status: 'error',
        message: 'Meeting not found'
      });
    }

    // Check if panelist scheduled this meeting
    if (meeting.scheduledBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only cancel meetings you scheduled'
      });
    }

    meeting.status = 'cancelled';
    meeting.updatedAt = Date.now();
    await meeting.save();

    const panelist = await Panelist.findById(panelistId);

    // Log activity
    await CaseActivity.logActivity({
      case: meeting.case,
      activityType: 'meeting_cancelled',
      performedBy: {
        userType: 'panelist',
        userId: req.user._id,
        panelistId: panelistId,
        name: panelist.name
      },
      description: `${panelist.name} cancelled meeting: ${meeting.title}`,
      metadata: {
        meetingId: meeting._id
      },
      relatedModel: {
        modelType: 'Meeting',
        modelId: meeting._id
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'Meeting cancelled successfully',
      data: {
        meeting
      }
    });
  } catch (error) {
    console.error('Cancel meeting error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Add meeting notes/outcome
 * @route   POST /api/panelist/meetings/:meetingId/notes
 * @access  Private (Panelist only)
 */
exports.addMeetingNotes = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { notes, outcome, nextSteps } = req.body;
    const panelistId = req.user.panelistProfile;

    if (!panelistId) {
      return res.status(400).json({
        status: 'error',
        message: 'Panelist profile not found'
      });
    }

    const meeting = await Meeting.findById(meetingId);

    if (!meeting) {
      return res.status(404).json({
        status: 'error',
        message: 'Meeting not found'
      });
    }

    // Check if panelist has access to this meeting
    const hasAccess =
      meeting.scheduledBy.toString() === req.user._id.toString() ||
      meeting.attendees.some(a => a.user && a.user.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to add notes to this meeting'
      });
    }

    // Update meeting notes
    if (notes) meeting.notes = notes;
    if (outcome) meeting.outcome = outcome;
    if (nextSteps) meeting.nextSteps = nextSteps;

    // Mark meeting as completed if adding outcome
    if (outcome && meeting.status === 'scheduled') {
      meeting.status = 'completed';

      const panelist = await Panelist.findById(panelistId);

      // Log activity
      await CaseActivity.logActivity({
        case: meeting.case,
        activityType: 'meeting_completed',
        performedBy: {
          userType: 'panelist',
          userId: req.user._id,
          panelistId: panelistId,
          name: panelist.name
        },
        description: `${panelist.name} completed meeting: ${meeting.title}`,
        metadata: {
          meetingId: meeting._id
        },
        relatedModel: {
          modelType: 'Meeting',
          modelId: meeting._id
        }
      });
    }

    meeting.updatedAt = Date.now();
    await meeting.save();

    res.status(200).json({
      status: 'success',
      message: 'Meeting notes added successfully',
      data: {
        meeting
      }
    });
  } catch (error) {
    console.error('Add meeting notes error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};
