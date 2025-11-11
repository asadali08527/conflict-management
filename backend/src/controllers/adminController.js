const User = require('../models/User');
const Case = require('../models/Case');
const Meeting = require('../models/Meeting');
const CaseSubmission = require('../models/CaseSubmission');
const CaseSubmissionData = require('../models/CaseSubmissionData');
const CaseFile = require('../models/CaseFile');
const Panelist = require('../models/Panelist');
const { generateToken } = require('../config/jwt');

/**
 * @desc    Register a new admin
 * @route   POST /api/admin/auth/register
 * @access  Public (but enforces admin role)
 */
exports.registerAdmin = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        status: 'error',
        message: 'User with this email already exists'
      });
    }

    // Force admin role
    const adminData = {
      ...req.body,
      role: 'admin'
    };

    // Create new admin user
    const admin = await User.create(adminData);

    // Generate token
    const token = generateToken(admin);

    res.status(201).json({
      status: 'success',
      message: 'Admin registered successfully',
      data: {
        user: {
          id: admin._id,
          firstName: admin.firstName,
          lastName: admin.lastName,
          email: admin.email,
          phone: admin.phone,
          role: admin.role
        },
        token
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
 * @desc    Admin login (admin role only)
 * @route   POST /api/admin/auth/login
 * @access  Public
 */
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists and is admin
    const admin = await User.findOne({ email, role: 'admin' }).select('+password');
    if (!admin) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid admin credentials'
      });
    }

    // Check if password matches
    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid admin credentials'
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'This admin account has been deactivated'
      });
    }

    // Generate token
    const token = generateToken(admin);

    res.status(200).json({
      status: 'success',
      message: 'Admin login successful',
      data: {
        user: {
          id: admin._id,
          firstName: admin.firstName,
          lastName: admin.lastName,
          email: admin.email,
          phone: admin.phone,
          role: admin.role
        },
        token
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
 * @desc    Get admin dashboard statistics
 * @route   GET /api/admin/dashboard/stats
 * @access  Private (Admin only)
 */
exports.getDashboardStats = async (req, res) => {
  try {
    // Get case statistics
    const totalCases = await Case.countDocuments();
    const openCases = await Case.countDocuments({ status: 'open' });
    const assignedCases = await Case.countDocuments({ status: 'assigned' });
    const resolvedCases = await Case.countDocuments({ status: 'resolved' });
    const closedCases = await Case.countDocuments({ status: 'closed' });

    // Get user statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const clientUsers = await User.countDocuments({ role: 'client' });

    // Get case type distribution
    const casesByType = await Case.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent cases (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentCases = await Case.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    res.status(200).json({
      status: 'success',
      data: {
        cases: {
          total: totalCases,
          open: openCases,
          assigned: assignedCases,
          resolved: resolvedCases,
          closed: closedCases,
          recent: recentCases
        },
        users: {
          total: totalUsers,
          active: activeUsers,
          admins: adminUsers,
          clients: clientUsers
        },
        casesByType: casesByType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
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
 * @desc    Get all cases for admin management with party details
 * @route   GET /api/admin/cases
 * @access  Private (Admin only)
 */
exports.getAllCases = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      priority
    } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'parties.name': { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate skip
    const skip = (page - 1) * limit;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const cases = await Case.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Case.countDocuments(filter);

    // Get submission information for each case
    const enhancedCases = await Promise.all(cases.map(async (caseItem) => {
      const caseObj = caseItem.toObject();

      // Use sessionId directly from case if available (optimized)
      if (caseObj.sessionId) {
        // Check if Party B has joined using linkedSessionId from case
        caseObj.hasPartyBResponse = !!caseObj.linkedSessionId;

        if (caseObj.linkedSessionId) {
          // Get Party B's submission status
          const partyBSubmission = await CaseSubmission.findOne({
            sessionId: caseObj.linkedSessionId
          });

          if (partyBSubmission) {
            caseObj.partyBSubmissionStatus = partyBSubmission.status;
            caseObj.partyBSubmittedAt = partyBSubmission.submittedAt;
          }
        }
      } else if (caseObj.caseId) {
        // Fallback for older cases without sessionId field
        const partyASubmission = await CaseSubmission.findOne({
          caseId: caseObj.caseId,
          submitterType: 'party_a'
        });

        if (partyASubmission) {
          caseObj.hasPartyBResponse = !!partyASubmission.linkedSessionId;

          if (partyASubmission.linkedSessionId) {
            const partyBSubmission = await CaseSubmission.findOne({
              sessionId: partyASubmission.linkedSessionId
            });

            if (partyBSubmission) {
              caseObj.partyBSubmissionStatus = partyBSubmission.status;
              caseObj.partyBSubmittedAt = partyBSubmission.submittedAt;
            }
          }

          caseObj.sessionId = partyASubmission.sessionId;
          caseObj.linkedSessionId = partyASubmission.linkedSessionId;
        }
      }

      return caseObj;
    }));

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
    console.error('Error fetching cases:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Update case status with resolution details
 * @route   PATCH /api/admin/cases/:id/status
 * @access  Private (Admin only)
 */
exports.updateCaseStatus = async (req, res) => {
  try {
    const { status, resolutionDetails, adminFeedback, nextSteps } = req.body;
    const caseId = req.params.id;

    // Validate status
    const validStatuses = ['open', 'assigned', 'in_progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status'
      });
    }

    // Build update object
    const updateData = { 
      status, 
      updatedAt: Date.now() 
    };

    // Add resolution details if provided and status is resolved or closed
    if ((status === 'resolved' || status === 'closed') && resolutionDetails) {
      // Add a note with resolution details
      const newNote = {
        content: resolutionDetails,
        createdBy: req.user._id,
        createdAt: Date.now()
      };

      updateData.$push = { notes: newNote };
    }

    // Update case
    const updatedCase = await Case.findByIdAndUpdate(
      caseId,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email');

    if (!updatedCase) {
      return res.status(404).json({
        status: 'error',
        message: 'Case not found'
      });
    }

    // If admin feedback is provided, store it in a separate collection or as a note
    if (adminFeedback) {
      // Add admin feedback as a note
      await Case.findByIdAndUpdate(
        caseId,
        {
          $push: {
            notes: {
              content: `Admin Feedback: ${adminFeedback}`,
              createdBy: req.user._id,
              createdAt: Date.now()
            }
          }
        }
      );
    }

    // If next steps are provided, store them as a note
    if (nextSteps) {
      await Case.findByIdAndUpdate(
        caseId,
        {
          $push: {
            notes: {
              content: `Next Steps: ${nextSteps}`,
              createdBy: req.user._id,
              createdAt: Date.now()
            }
          }
        }
      );
    }

    res.status(200).json({
      status: 'success',
      message: 'Case status updated successfully',
      data: {
        case: updatedCase
      }
    });
  } catch (error) {
    console.error('Error updating case status:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Add admin note to a case
 * @route   POST /api/admin/cases/:id/notes
 * @access  Private (Admin only)
 */
exports.addCaseNote = async (req, res) => {
  try {
    const { content, noteType } = req.body;
    const caseId = req.params.id;

    if (!content) {
      return res.status(400).json({
        status: 'error',
        message: 'Note content is required'
      });
    }

    // Format note content based on type
    let formattedContent = content;
    if (noteType) {
      formattedContent = `[${noteType}] ${content}`;
    }

    // Create note object
    const newNote = {
      content: formattedContent,
      createdBy: req.user._id,
      createdAt: Date.now()
    };

    // Add note to case
    const updatedCase = await Case.findByIdAndUpdate(
      caseId,
      {
        $push: { notes: newNote },
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .populate('notes.createdBy', 'firstName lastName email');

    if (!updatedCase) {
      return res.status(404).json({
        status: 'error',
        message: 'Case not found'
      });
    }

    res.status(201).json({
      status: 'success',
      message: 'Note added successfully',
      data: {
        case: updatedCase,
        addedNote: newNote
      }
    });
  } catch (error) {
    console.error('Error adding case note:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Get all users for admin management
 * @route   GET /api/admin/users
 * @access  Private (Admin only)
 */
exports.getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search
    } = req.query;

    // Build filter object
    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate skip
    const skip = (page - 1) * limit;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const users = await User.find(filter)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await User.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      data: {
        users,
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
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Toggle user active status
 * @route   PATCH /api/admin/users/:id/toggle-status
 * @access  Private (Admin only)
 */
exports.toggleUserStatus = async (req, res) => {
  try {
    const userId = req.params.id;

    // Get current user
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Toggle active status
    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        user
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
 * @desc    Schedule a meeting for a case with party details
 * @route   POST /api/admin/meetings
 * @access  Private (Admin only)
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
      location,
      notes,
      includeParties
    } = req.body;

    // Verify case exists
    const caseItem = await Case.findById(caseId);
    if (!caseItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Case not found'
      });
    }

    // Process attendees
    let processedAttendees = attendees || [];

    // If includeParties is true, automatically add case parties as attendees
    if (includeParties && caseItem.parties && caseItem.parties.length > 0) {
      // Use sessionId directly from case (optimized) or fallback to caseId lookup
      let partyASubmission = null;

      if (caseItem.sessionId) {
        // Find Party A's submission using sessionId
        partyASubmission = await CaseSubmission.findOne({
          sessionId: caseItem.sessionId
        });
      } else if (caseItem.caseId) {
        // Fallback for older cases without sessionId
        partyASubmission = await CaseSubmission.findOne({
          caseId: caseItem.caseId,
          submitterType: 'party_a'
        });
      }
      
      // Add parties from the case to attendees
      for (const party of caseItem.parties) {
        // Check if this party is already in attendees
        const existingAttendee = processedAttendees.find(
          att => att.email === party.contact
        );
        
        if (!existingAttendee) {
          const newAttendee = {
            name: party.name,
            email: party.contact,
            isParty: true,
            status: 'invited',
            role: party.role
          };
          
          // If this is Party A and we have a user ID, add it
          if (party.role === 'Party A' && partyASubmission && partyASubmission.userId) {
            newAttendee.user = partyASubmission.userId;
          }
          
          processedAttendees.push(newAttendee);
        }
      }
      
      // If Party B has joined, add them too (use optimized linkedSessionId from case)
      const partyBSessionId = caseItem.linkedSessionId || (partyASubmission && partyASubmission.linkedSessionId);
      if (partyBSessionId) {
        const partyBSubmission = await CaseSubmission.findOne({
          sessionId: partyBSessionId
        });
        
        if (partyBSubmission && partyBSubmission.userId) {
          // Find Party B in the attendees
          const partyB = processedAttendees.find(att => att.role === 'Party B');
          if (partyB) {
            partyB.user = partyBSubmission.userId;
          }
        }
      }
    }

    // Create meeting
    const meeting = await Meeting.create({
      title,
      description,
      case: caseId,
      scheduledBy: req.user._id,
      attendees: processedAttendees,
      scheduledDate,
      duration,
      meetingType,
      meetingLink,
      location,
      notes
    });

    // Populate the meeting with case and scheduled by info
    const populatedMeeting = await Meeting.findById(meeting._id)
      .populate('case', 'title type')
      .populate('scheduledBy', 'firstName lastName email')
      .populate('attendees.user', 'firstName lastName email');

    // Add a note to the case about the scheduled meeting
    await Case.findByIdAndUpdate(
      caseId,
      {
        $push: {
          notes: {
            content: `Meeting scheduled: "${title}" on ${new Date(scheduledDate).toLocaleString()}`,
            createdBy: req.user._id,
            createdAt: Date.now()
          }
        },
        updatedAt: Date.now()
      }
    );

    res.status(201).json({
      status: 'success',
      message: 'Meeting scheduled successfully',
      data: {
        meeting: populatedMeeting
      }
    });
  } catch (error) {
    console.error('Error scheduling meeting:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Get all meetings
 * @route   GET /api/admin/meetings
 * @access  Private (Admin only)
 */
exports.getAllMeetings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      meetingType,
      caseId,
      sortBy = 'scheduledDate',
      sortOrder = 'asc'
    } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (meetingType) filter.meetingType = meetingType;
    if (caseId) filter.case = caseId;

    // Calculate skip
    const skip = (page - 1) * limit;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const meetings = await Meeting.find(filter)
      .populate('case', 'title type status')
      .populate('scheduledBy', 'firstName lastName email')
      .populate('attendees.user', 'firstName lastName email')
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
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Get meeting by ID
 * @route   GET /api/admin/meetings/:id
 * @access  Private (Admin only)
 */
exports.getMeetingById = async (req, res) => {
  try {
    const meetingId = req.params.id;

    const meeting = await Meeting.findById(meetingId)
      .populate('case', 'title type status description parties')
      .populate('scheduledBy', 'firstName lastName email')
      .populate('attendees.user', 'firstName lastName email phone');

    if (!meeting) {
      return res.status(404).json({
        status: 'error',
        message: 'Meeting not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        meeting
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
 * @desc    Update meeting with outcomes and next steps
 * @route   PATCH /api/admin/meetings/:id
 * @access  Private (Admin only)
 */
exports.updateMeeting = async (req, res) => {
  try {
    const meetingId = req.params.id;
    const updateData = req.body;
    const { outcome, nextSteps, status, updateCase } = updateData;

    // Remove fields that shouldn't be updated directly
    delete updateData.scheduledBy;
    delete updateData.case;
    delete updateData.createdAt;
    delete updateData.updateCase;

    // Get the meeting before updating
    const existingMeeting = await Meeting.findById(meetingId)
      .populate('case', 'title type status');
    
    if (!existingMeeting) {
      return res.status(404).json({
        status: 'error',
        message: 'Meeting not found'
      });
    }

    // Update the meeting
    const meeting = await Meeting.findByIdAndUpdate(
      meetingId,
      { ...updateData, updatedAt: Date.now() },
      { new: true, runValidators: true }
    )
      .populate('case', 'title type status')
      .populate('scheduledBy', 'firstName lastName email')
      .populate('attendees.user', 'firstName lastName email');

    // If meeting is marked as completed and has outcome, update the case with the outcome
    if (status === 'completed' && outcome && existingMeeting.case) {
      await Case.findByIdAndUpdate(
        existingMeeting.case._id,
        {
          $push: {
            notes: {
              content: `Meeting "${meeting.title}" completed. Outcome: ${outcome}`,
              createdBy: req.user._id,
              createdAt: Date.now()
            }
          },
          updatedAt: Date.now()
        }
      );
    }

    // If meeting has next steps, update the case with the next steps
    if (nextSteps && existingMeeting.case) {
      await Case.findByIdAndUpdate(
        existingMeeting.case._id,
        {
          $push: {
            notes: {
              content: `Meeting "${meeting.title}" next steps: ${nextSteps}`,
              createdBy: req.user._id,
              createdAt: Date.now()
            }
          },
          updatedAt: Date.now()
        }
      );
    }

    // If updateCase is true and status is completed, update the case status to in_progress
    if (updateCase && status === 'completed' && existingMeeting.case) {
      await Case.findByIdAndUpdate(
        existingMeeting.case._id,
        {
          status: 'in_progress',
          updatedAt: Date.now()
        }
      );
    }

    res.status(200).json({
      status: 'success',
      message: 'Meeting updated successfully',
      data: {
        meeting
      }
    });
  } catch (error) {
    console.error('Error updating meeting:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Cancel meeting
 * @route   PATCH /api/admin/meetings/:id/cancel
 * @access  Private (Admin only)
 */
exports.cancelMeeting = async (req, res) => {
  try {
    const meetingId = req.params.id;
    const { reason } = req.body;

    const meeting = await Meeting.findByIdAndUpdate(
      meetingId,
      {
        status: 'cancelled',
        notes: reason ? `Cancelled: ${reason}` : 'Meeting cancelled',
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    )
      .populate('case', 'title type status')
      .populate('scheduledBy', 'firstName lastName email');

    if (!meeting) {
      return res.status(404).json({
        status: 'error',
        message: 'Meeting not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Meeting cancelled successfully',
      data: {
        meeting
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
 * @desc    Get meetings for a specific case
 * @route   GET /api/admin/cases/:caseId/meetings
 * @access  Private (Admin only)
 */
exports.getCaseMeetings = async (req, res) => {
  try {
    const { caseId } = req.params;

    // Verify case exists
    const caseExists = await Case.findById(caseId);
    if (!caseExists) {
      return res.status(404).json({
        status: 'error',
        message: 'Case not found'
      });
    }

    const meetings = await Meeting.find({ case: caseId })
      .populate('scheduledBy', 'firstName lastName email')
      .populate('attendees.user', 'firstName lastName email')
      .sort({ scheduledDate: 1 });

    res.status(200).json({
      status: 'success',
      data: {
        meetings
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
 * @desc    Assign case to admin/mediator
 * @route   PATCH /api/admin/cases/:id/assign
 * @access  Private (Admin only)
 */
exports.assignCase = async (req, res) => {
  try {
    const caseId = req.params.id;
    const { assignedTo } = req.body;

    // Verify the user to assign exists and is admin
    const userToAssign = await User.findById(assignedTo);
    if (!userToAssign) {
      return res.status(404).json({
        status: 'error',
        message: 'User to assign not found'
      });
    }

    if (userToAssign.role !== 'admin') {
      return res.status(400).json({
        status: 'error',
        message: 'Can only assign cases to admin users'
      });
    }

    // Update case
    const updatedCase = await Case.findByIdAndUpdate(
      caseId,
      {
        assignedTo,
        assignedAt: Date.now(),
        status: 'assigned',
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email');

    if (!updatedCase) {
      return res.status(404).json({
        status: 'error',
        message: 'Case not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Case assigned successfully',
      data: {
        case: updatedCase
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
 * @desc    Unassign case
 * @route   PATCH /api/admin/cases/:id/unassign
 * @access  Private (Admin only)
 */
exports.unassignCase = async (req, res) => {
  try {
    const caseId = req.params.id;

    // Update case
    const updatedCase = await Case.findByIdAndUpdate(
      caseId,
      {
        assignedTo: null,
        assignedAt: null,
        status: 'open',
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'firstName lastName email');

    if (!updatedCase) {
      return res.status(404).json({
        status: 'error',
        message: 'Case not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Case unassigned successfully',
      data: {
        case: updatedCase
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
 * @desc    Update case priority
 * @route   PATCH /api/admin/cases/:id/priority
 * @access  Private (Admin only)
 */
exports.updateCasePriority = async (req, res) => {
  try {
    const caseId = req.params.id;
    const { priority } = req.body;

    // Validate priority
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid priority level'
      });
    }

    // Update case
    const updatedCase = await Case.findByIdAndUpdate(
      caseId,
      { priority, updatedAt: Date.now() },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email');

    if (!updatedCase) {
      return res.status(404).json({
        status: 'error',
        message: 'Case not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Case priority updated successfully',
      data: {
        case: updatedCase
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
 * @desc    Get cases assigned to logged-in admin
 * @route   GET /api/admin/cases/my-assignments
 * @access  Private (Admin only)
 */
exports.getMyAssignedCases = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      priority,
      sortBy = 'assignedAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { assignedTo: req.user._id };
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (priority) filter.priority = priority;

    // Calculate skip
    const skip = (page - 1) * limit;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const cases = await Case.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
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
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Get detailed case information with both parties' stories
 * @route   GET /api/admin/cases/:id/detailed
 * @access  Private (Admin only)
 */
exports.getCaseWithPartyDetails = async (req, res) => {
  try {
    const caseId = req.params.id;

    // Find the case with populated fields
    const caseItem = await Case.findById(caseId)
      .populate('createdBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email');

    if (!caseItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Case not found'
      });
    }

    // Use sessionId directly from case (optimized) or fallback to caseId lookup
    let partyASessionId = caseItem.sessionId;
    let partyBSessionId = caseItem.linkedSessionId;

    // Fallback for older cases without sessionId in Case model
    if (!partyASessionId && caseItem.caseId) {
      const partyASubmission = await CaseSubmission.findOne({
        caseId: caseItem.caseId,
        submitterType: 'party_a'
      });

      if (!partyASubmission) {
        return res.status(404).json({
          status: 'error',
          message: 'Case submission data not found'
        });
      }

      partyASessionId = partyASubmission.sessionId;
      partyBSessionId = partyASubmission.linkedSessionId;
    }

    if (!partyASessionId) {
      return res.status(404).json({
        status: 'error',
        message: 'Session ID not found for this case'
      });
    }

    // Get Party A's submission details
    const partyASubmission = await CaseSubmission.findOne({
      sessionId: partyASessionId
    });

    // Get Party A's step data
    const partyAStepData = await CaseSubmissionData.find({
      sessionId: partyASessionId
    }).sort({ stepId: 1 });

    // Get Party A's files
    const partyAFiles = await CaseFile.find({
      sessionId: partyASessionId
    });

    // Organize Party A's data
    const partyAData = {
      sessionId: partyASessionId,
      status: partyASubmission ? partyASubmission.status : 'submitted',
      submittedAt: partyASubmission ? partyASubmission.submittedAt : null,
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

    // Check if Party B has joined (using optimized linkedSessionId from case)
    if (partyBSessionId) {
      const partyBSubmission = await CaseSubmission.findOne({
        sessionId: partyBSessionId
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

    // Get all meetings related to this case
    const caseMeetings = await Meeting.find({ case: caseId })
      .populate('scheduledBy', 'firstName lastName email')
      .populate('attendees.user', 'firstName lastName email')
      .sort({ scheduledDate: 1 });

    responseData.meetings = caseMeetings;

    res.status(200).json({
      status: 'success',
      data: responseData
    });
  } catch (error) {
    console.error('Error fetching case details:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Get all admin users for case assignment
 * @route   GET /api/admin/users/admins
 * @access  Private (Admin only)
 */
exports.getAdminUsers = async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin', isActive: true })
      .select('firstName lastName email phone')
      .sort({ firstName: 1 });

    // Get case counts for each admin
    const adminsWithStats = await Promise.all(admins.map(async (admin) => {
      const assignedCasesCount = await Case.countDocuments({ assignedTo: admin._id });
      const activeCasesCount = await Case.countDocuments({
        assignedTo: admin._id,
        status: { $in: ['assigned', 'in_progress'] }
      });

      return {
        ...admin.toObject(),
        assignedCasesCount,
        activeCasesCount
      };
    }));

    res.status(200).json({
      status: 'success',
      data: {
        admins: adminsWithStats
      }
    });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Get all files for a specific case
 * @route   GET /api/admin/cases/:id/files
 * @access  Private (Admin only)
 */
exports.getCaseFiles = async (req, res) => {
  try {
    const caseId = req.params.id;

    // Find the case
    const caseItem = await Case.findById(caseId);
    if (!caseItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Case not found'
      });
    }

    // Get files from case document
    const caseDocuments = caseItem.documents || [];

    // Get files from CaseFile collection using sessionId (optimized)
    let submissionFiles = [];
    const partyASessionId = caseItem.sessionId;
    const partyBSessionId = caseItem.linkedSessionId;

    if (partyASessionId) {
      const partyAFiles = await CaseFile.find({
        sessionId: partyASessionId
      }).sort({ createdAt: -1 });

      submissionFiles.push({
        party: 'Party A',
        sessionId: partyASessionId,
        files: partyAFiles.map(file => ({
          id: file._id,
          fileName: file.originalName,
          fileSize: file.fileSize,
          fileType: file.fileType,
          uploadUrl: file.uploadUrl,
          storageKey: file.storageKey,
          description: file.description,
          uploadedAt: file.createdAt
        }))
      });

      // Check if Party B has joined
      if (partyBSessionId) {
        const partyBFiles = await CaseFile.find({
          sessionId: partyBSessionId
        }).sort({ createdAt: -1 });

        submissionFiles.push({
          party: 'Party B',
          sessionId: partyBSessionId,
          files: partyBFiles.map(file => ({
            id: file._id,
            fileName: file.originalName,
            fileSize: file.fileSize,
            fileType: file.fileType,
            uploadUrl: file.uploadUrl,
            storageKey: file.storageKey,
            description: file.description,
            uploadedAt: file.createdAt
          }))
        });
      }
    } else if (caseItem.caseId) {
      // Fallback for older cases without sessionId in Case model
      const partyASubmission = await CaseSubmission.findOne({
        caseId: caseItem.caseId,
        submitterType: 'party_a'
      });

      if (partyASubmission) {
        const partyAFiles = await CaseFile.find({
          sessionId: partyASubmission.sessionId
        }).sort({ createdAt: -1 });

        submissionFiles.push({
          party: 'Party A',
          sessionId: partyASubmission.sessionId,
          files: partyAFiles.map(file => ({
            id: file._id,
            fileName: file.originalName,
            fileSize: file.fileSize,
            fileType: file.fileType,
            uploadUrl: file.uploadUrl,
            storageKey: file.storageKey,
            description: file.description,
            uploadedAt: file.createdAt
          }))
        });

        // Check if Party B has joined
        if (partyASubmission.linkedSessionId) {
          const partyBFiles = await CaseFile.find({
            sessionId: partyASubmission.linkedSessionId
          }).sort({ createdAt: -1 });

          submissionFiles.push({
            party: 'Party B',
            sessionId: partyASubmission.linkedSessionId,
            files: partyBFiles.map(file => ({
              id: file._id,
              fileName: file.originalName,
              fileSize: file.fileSize,
              fileType: file.fileType,
              uploadUrl: file.uploadUrl,
              storageKey: file.storageKey,
              description: file.description,
              uploadedAt: file.createdAt
            }))
          });
        }
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        caseId: caseItem._id,
        caseIdFormatted: caseItem.caseId,
        caseTitle: caseItem.title,
        caseDocuments: caseDocuments.map(doc => ({
          name: doc.name,
          url: doc.url,
          key: doc.key,
          size: doc.size,
          mimetype: doc.mimetype,
          uploadedAt: doc.uploadedAt
        })),
        submissionFiles: submissionFiles,
        totalFiles: caseDocuments.length + submissionFiles.reduce((acc, sf) => acc + sf.files.length, 0)
      }
    });
  } catch (error) {
    console.error('Error fetching case files:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Get case statistics by admin
 * @route   GET /api/admin/statistics/by-admin
 * @access  Private (Admin only)
 */
exports.getCaseStatsByAdmin = async (req, res) => {
  try {
    const stats = await Case.aggregate([
      {
        $match: {
          assignedTo: { $ne: null }
        }
      },
      {
        $group: {
          _id: '$assignedTo',
          totalCases: { $sum: 1 },
          openCases: {
            $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] }
          },
          assignedCases: {
            $sum: { $cond: [{ $eq: ['$status', 'assigned'] }, 1, 0] }
          },
          inProgressCases: {
            $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
          },
          resolvedCases: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          },
          closedCases: {
            $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'admin'
        }
      },
      {
        $unwind: '$admin'
      },
      {
        $project: {
          _id: 1,
          adminName: {
            $concat: ['$admin.firstName', ' ', '$admin.lastName']
          },
          adminEmail: '$admin.email',
          totalCases: 1,
          openCases: 1,
          assignedCases: 1,
          inProgressCases: 1,
          resolvedCases: 1,
          closedCases: 1,
          activeCases: { $add: ['$assignedCases', '$inProgressCases'] }
        }
      },
      {
        $sort: { totalCases: -1 }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        statistics: stats
      }
    });
  } catch (error) {
    console.error('Error fetching case statistics by admin:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Get panel statistics for admin dashboard
 * @route   GET /api/admin/statistics/panel
 * @access  Private (Admin only)
 */
exports.getPanelStatistics = async (req, res) => {
  try {
    // Get overall panelist statistics
    const totalPanelists = await Panelist.countDocuments();
    const activePanelists = await Panelist.countDocuments({ isActive: true });
    const availablePanelists = await Panelist.countDocuments({
      isActive: true,
      'availability.status': 'available'
    });
    const busyPanelists = await Panelist.countDocuments({
      isActive: true,
      'availability.status': 'busy'
    });

    // Get cases with panel assignments
    const casesWithPanel = await Case.countDocuments({
      status: 'panel_assigned'
    });

    // Get total active panel assignments
    const totalActiveAssignments = await Case.aggregate([
      {
        $match: {
          'assignedPanelists.status': 'active'
        }
      },
      {
        $unwind: '$assignedPanelists'
      },
      {
        $match: {
          'assignedPanelists.status': 'active'
        }
      },
      {
        $count: 'total'
      }
    ]);

    // Get specialization distribution
    const specializationStats = await Panelist.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$specializations' },
      {
        $group: {
          _id: '$specializations',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get top performing panelists
    const topPanelists = await Panelist.find({ isActive: true })
      .select('name occupation specializations rating statistics availability')
      .sort({ 'rating.average': -1, 'statistics.casesResolved': -1 })
      .limit(5);

    // Get panelist workload distribution
    const workloadStats = await Panelist.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalCapacity: { $sum: '$availability.maxCases' },
          currentLoad: { $sum: '$availability.currentCaseLoad' },
          averageLoad: { $avg: '$availability.currentCaseLoad' }
        }
      }
    ]);

    // Get panelists by availability status
    const availabilityDistribution = await Panelist.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$availability.status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        overview: {
          total: totalPanelists,
          active: activePanelists,
          available: availablePanelists,
          busy: busyPanelists,
          casesWithPanel: casesWithPanel,
          totalActiveAssignments: totalActiveAssignments[0]?.total || 0
        },
        specializationDistribution: specializationStats,
        availabilityDistribution: availabilityDistribution,
        workload: workloadStats[0] || {
          totalCapacity: 0,
          currentLoad: 0,
          averageLoad: 0
        },
        topPerformers: topPanelists
      }
    });
  } catch (error) {
    console.error('Error fetching panel statistics:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};