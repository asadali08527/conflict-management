const Panelist = require('../models/Panelist');
const Case = require('../models/Case');
const User = require('../models/User');

/**
 * @desc    Create a new panelist
 * @route   POST /api/admin/panelists
 * @access  Private (Admin only)
 */
exports.createPanelist = async (req, res) => {
  try {
    const panelistData = req.body;

    // Check if panelist with email already exists
    const existingPanelist = await Panelist.findOne({
      'contactInfo.email': panelistData.contactInfo?.email
    });

    if (existingPanelist) {
      return res.status(400).json({
        status: 'error',
        message: 'A panelist with this email already exists'
      });
    }

    // Create new panelist
    const panelist = await Panelist.create(panelistData);

    res.status(201).json({
      status: 'success',
      message: 'Panelist created successfully',
      data: {
        panelist
      }
    });
  } catch (error) {
    console.error('Error creating panelist:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Get all panelists with filters and pagination
 * @route   GET /api/admin/panelists
 * @access  Private (Admin only)
 */
exports.getAllPanelists = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      specialization,
      availability,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search
    } = req.query;

    // Build filter object
    const filter = {};

    if (specialization) {
      filter.specializations = specialization;
    }

    if (availability) {
      filter['availability.status'] = availability;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { occupation: { $regex: search, $options: 'i' } },
        { 'contactInfo.email': { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate skip
    const skip = (page - 1) * limit;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const panelists = await Panelist.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Panelist.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      data: {
        panelists,
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
    console.error('Error fetching panelists:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Get single panelist by ID with assignment history
 * @route   GET /api/admin/panelists/:id
 * @access  Private (Admin only)
 */
exports.getPanelistById = async (req, res) => {
  try {
    const panelistId = req.params.id;

    const panelist = await Panelist.findById(panelistId);

    if (!panelist) {
      return res.status(404).json({
        status: 'error',
        message: 'Panelist not found'
      });
    }

    // Get cases assigned to this panelist
    const assignedCases = await Case.find({
      'assignedPanelists.panelist': panelistId,
      'assignedPanelists.status': 'active'
    })
      .select('title type status priority createdAt')
      .sort({ createdAt: -1 });

    // Get case history (all cases including completed/removed)
    const caseHistory = await Case.find({
      'assignedPanelists.panelist': panelistId
    })
      .select('title type status priority createdAt assignedPanelists.$')
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      status: 'success',
      data: {
        panelist,
        assignedCases,
        caseHistory: caseHistory.length,
        totalCasesHandled: panelist.statistics.totalCasesHandled
      }
    });
  } catch (error) {
    console.error('Error fetching panelist:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Update panelist information
 * @route   PATCH /api/admin/panelists/:id
 * @access  Private (Admin only)
 */
exports.updatePanelist = async (req, res) => {
  try {
    const panelistId = req.params.id;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData.statistics;
    delete updateData.rating;
    delete updateData.createdAt;
    delete updateData._id;

    // If email is being updated, check for duplicates
    if (updateData.contactInfo?.email) {
      const existingPanelist = await Panelist.findOne({
        'contactInfo.email': updateData.contactInfo.email,
        _id: { $ne: panelistId }
      });

      if (existingPanelist) {
        return res.status(400).json({
          status: 'error',
          message: 'A panelist with this email already exists'
        });
      }
    }

    const panelist = await Panelist.findByIdAndUpdate(
      panelistId,
      { ...updateData, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!panelist) {
      return res.status(404).json({
        status: 'error',
        message: 'Panelist not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Panelist updated successfully',
      data: {
        panelist
      }
    });
  } catch (error) {
    console.error('Error updating panelist:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Deactivate panelist (soft delete)
 * @route   DELETE /api/admin/panelists/:id
 * @access  Private (Admin only)
 */
exports.deactivatePanelist = async (req, res) => {
  try {
    const panelistId = req.params.id;

    // Check if panelist has active cases
    const activeCases = await Case.countDocuments({
      'assignedPanelists.panelist': panelistId,
      'assignedPanelists.status': 'active',
      status: { $nin: ['resolved', 'closed'] }
    });

    if (activeCases > 0) {
      return res.status(400).json({
        status: 'error',
        message: `Cannot deactivate panelist with ${activeCases} active case(s). Please reassign or complete cases first.`
      });
    }

    const panelist = await Panelist.findByIdAndUpdate(
      panelistId,
      {
        isActive: false,
        'availability.status': 'unavailable',
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!panelist) {
      return res.status(404).json({
        status: 'error',
        message: 'Panelist not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Panelist deactivated successfully',
      data: {
        panelist
      }
    });
  } catch (error) {
    console.error('Error deactivating panelist:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Assign panelist(s) to a case
 * @route   POST /api/admin/cases/:caseId/assign-panel
 * @access  Private (Admin only)
 */
exports.assignPanelToCase = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { panelistIds } = req.body;

    if (!panelistIds || !Array.isArray(panelistIds) || panelistIds.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide at least one panelist ID'
      });
    }

    // Find the case
    const caseItem = await Case.findById(caseId);
    if (!caseItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Case not found'
      });
    }

    // Verify all panelists exist and are available
    const panelists = await Panelist.find({
      _id: { $in: panelistIds },
      isActive: true
    });

    if (panelists.length !== panelistIds.length) {
      return res.status(400).json({
        status: 'error',
        message: 'One or more panelists not found or inactive'
      });
    }

    // Check for already assigned panelists
    const alreadyAssigned = caseItem.assignedPanelists.filter(
      ap => ap.status === 'active' && panelistIds.includes(ap.panelist.toString())
    );

    if (alreadyAssigned.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'One or more panelists are already assigned to this case'
      });
    }

    // Create assignment objects
    const newAssignments = panelistIds.map(panelistId => ({
      panelist: panelistId,
      assignedBy: req.user._id,
      assignedAt: Date.now(),
      status: 'active'
    }));

    // Update case
    caseItem.assignedPanelists.push(...newAssignments);
    caseItem.status = 'panel_assigned';
    caseItem.panelAssignedAt = Date.now();
    caseItem.updatedAt = Date.now();
    await caseItem.save();

    // Update panelist case loads
    await Promise.all(
      panelists.map(panelist => panelist.incrementCaseLoad())
    );

    // Populate the updated case
    const updatedCase = await Case.findById(caseId)
      .populate('assignedPanelists.panelist', 'name occupation specializations contactInfo')
      .populate('assignedPanelists.assignedBy', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email');

    res.status(200).json({
      status: 'success',
      message: 'Panel assigned to case successfully',
      data: {
        case: updatedCase
      }
    });
  } catch (error) {
    console.error('Error assigning panel to case:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Remove panelist from case
 * @route   DELETE /api/admin/cases/:caseId/panelists/:panelistId
 * @access  Private (Admin only)
 */
exports.removePanelistFromCase = async (req, res) => {
  try {
    const { caseId, panelistId } = req.params;

    const caseItem = await Case.findById(caseId);
    if (!caseItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Case not found'
      });
    }

    // Find the panelist assignment
    const assignmentIndex = caseItem.assignedPanelists.findIndex(
      ap => ap.panelist.toString() === panelistId && ap.status === 'active'
    );

    if (assignmentIndex === -1) {
      return res.status(404).json({
        status: 'error',
        message: 'Panelist not assigned to this case or already removed'
      });
    }

    // Mark assignment as removed
    caseItem.assignedPanelists[assignmentIndex].status = 'removed';
    caseItem.updatedAt = Date.now();

    // If no active panelists remain, update case status
    const activePanelists = caseItem.assignedPanelists.filter(ap => ap.status === 'active');
    if (activePanelists.length === 0) {
      caseItem.status = 'assigned'; // Revert to previous status
    }

    await caseItem.save();

    // Update panelist case load
    const panelist = await Panelist.findById(panelistId);
    if (panelist) {
      await panelist.decrementCaseLoad();
    }

    res.status(200).json({
      status: 'success',
      message: 'Panelist removed from case successfully',
      data: {
        case: caseItem
      }
    });
  } catch (error) {
    console.error('Error removing panelist from case:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Get cases assigned to a specific panelist
 * @route   GET /api/admin/panelists/:id/cases
 * @access  Private (Admin only)
 */
exports.getPanelistCases = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Verify panelist exists
    const panelist = await Panelist.findById(id);
    if (!panelist) {
      return res.status(404).json({
        status: 'error',
        message: 'Panelist not found'
      });
    }

    // Build filter
    const filter = {
      'assignedPanelists.panelist': id,
      'assignedPanelists.status': 'active'
    };

    if (status) {
      filter.status = status;
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

    res.status(200).json({
      status: 'success',
      data: {
        panelist: {
          id: panelist._id,
          name: panelist.name,
          occupation: panelist.occupation,
          currentCaseLoad: panelist.availability.currentCaseLoad
        },
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
    console.error('Error fetching panelist cases:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Get available panelists for case assignment (filtered by case type)
 * @route   GET /api/admin/panelists/available
 * @access  Private (Admin only)
 */
exports.getAvailablePanelists = async (req, res) => {
  try {
    const { caseType } = req.query;

    const filter = {
      isActive: true,
      'availability.status': { $in: ['available', 'busy'] },
      $expr: { $lt: ['$availability.currentCaseLoad', '$availability.maxCases'] }
    };

    // Filter by specialization if case type is provided
    if (caseType) {
      filter.specializations = caseType;
    }

    const panelists = await Panelist.find(filter)
      .select('name age occupation education specializations experience contactInfo availability rating statistics')
      .sort({ 'availability.currentCaseLoad': 1, 'rating.average': -1 });

    res.status(200).json({
      status: 'success',
      data: {
        panelists,
        count: panelists.length
      }
    });
  } catch (error) {
    console.error('Error fetching available panelists:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Get panelist statistics
 * @route   GET /api/admin/panelists/statistics
 * @access  Private (Admin only)
 */
exports.getPanelistStatistics = async (req, res) => {
  try {
    const totalPanelists = await Panelist.countDocuments();
    const activePanelists = await Panelist.countDocuments({ isActive: true });
    const availablePanelists = await Panelist.countDocuments({
      isActive: true,
      'availability.status': 'available'
    });

    // Get specialization distribution
    const specializationStats = await Panelist.aggregate([
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
      .select('name occupation rating statistics')
      .sort({ 'rating.average': -1, 'statistics.casesResolved': -1 })
      .limit(5);

    res.status(200).json({
      status: 'success',
      data: {
        overview: {
          total: totalPanelists,
          active: activePanelists,
          available: availablePanelists
        },
        specializationDistribution: specializationStats,
        topPerformers: topPanelists
      }
    });
  } catch (error) {
    console.error('Error fetching panelist statistics:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Create user account for panelist
 * @route   POST /api/admin/panelists/:id/create-account
 * @access  Private (Admin only)
 */
exports.createPanelistAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password, firstName, lastName, phone } = req.body;

    // Check if panelist exists
    const panelist = await Panelist.findById(id);

    if (!panelist) {
      return res.status(404).json({
        status: 'error',
        message: 'Panelist not found'
      });
    }

    // Check if panelist already has a user account
    if (panelist.userId) {
      return res.status(400).json({
        status: 'error',
        message: 'Panelist already has a user account'
      });
    }

    // Check if email is already in use
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is already in use'
      });
    }

    // Create user account
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      role: 'panelist',
      panelistProfile: panelist._id,
      isActive: true
    });

    // Link user to panelist
    panelist.userId = user._id;
    panelist.updatedAt = Date.now();
    await panelist.save();

    res.status(201).json({
      status: 'success',
      message: 'User account created successfully for panelist',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role
        },
        panelist: {
          id: panelist._id,
          name: panelist.name,
          userId: panelist.userId
        }
      }
    });
  } catch (error) {
    console.error('Error creating panelist account:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Reset panelist password (admin)
 * @route   POST /api/admin/panelists/:id/reset-password
 * @access  Private (Admin only)
 */
exports.resetPanelistPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'New password must be at least 6 characters'
      });
    }

    // Check if panelist exists
    const panelist = await Panelist.findById(id);

    if (!panelist) {
      return res.status(404).json({
        status: 'error',
        message: 'Panelist not found'
      });
    }

    // Check if panelist has a user account
    if (!panelist.userId) {
      return res.status(400).json({
        status: 'error',
        message: 'Panelist does not have a user account'
      });
    }

    // Get user and update password
    const user = await User.findById(panelist.userId);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User account not found'
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Error resetting panelist password:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Get detailed performance metrics for panelist
 * @route   GET /api/admin/panelists/:id/performance
 * @access  Private (Admin only)
 */
exports.getPanelistPerformance = async (req, res) => {
  try {
    const { id } = req.params;

    const panelist = await Panelist.findById(id);

    if (!panelist) {
      return res.status(404).json({
        status: 'error',
        message: 'Panelist not found'
      });
    }

    // Get case resolution statistics
    const totalCases = await Case.countDocuments({
      'assignedPanelists.panelist': id
    });

    const activeCases = await Case.countDocuments({
      'assignedPanelists.panelist': id,
      'assignedPanelists.status': 'active',
      status: { $nin: ['resolved', 'closed'] }
    });

    const resolvedCases = await Case.countDocuments({
      'assignedPanelists.panelist': id,
      status: { $in: ['resolved', 'closed'] }
    });

    // Get monthly performance for last 6 months
    const monthlyPerformance = [];
    for (let i = 5; i >= 0; i--) {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - i);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);

      const resolved = await Case.countDocuments({
        'assignedPanelists.panelist': id,
        status: { $in: ['resolved', 'closed'] },
        finalizedAt: { $gte: startDate, $lt: endDate }
      });

      monthlyPerformance.push({
        month: startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        resolved
      });
    }

    // Get case distribution by type
    const casesByType = await Case.aggregate([
      {
        $match: {
          'assignedPanelists.panelist': panelist._id
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        panelist: {
          id: panelist._id,
          name: panelist.name,
          occupation: panelist.occupation,
          specializations: panelist.specializations
        },
        statistics: {
          total: totalCases,
          active: activeCases,
          resolved: resolvedCases,
          resolutionRate: totalCases > 0 ? Math.round((resolvedCases / totalCases) * 100) : 0
        },
        rating: panelist.rating,
        monthlyPerformance,
        caseDistribution: casesByType,
        availability: panelist.availability
      }
    });
  } catch (error) {
    console.error('Error fetching panelist performance:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};
