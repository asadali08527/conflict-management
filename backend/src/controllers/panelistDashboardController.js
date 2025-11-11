const Case = require('../models/Case');
const Panelist = require('../models/Panelist');
const Meeting = require('../models/Meeting');
const CaseActivity = require('../models/CaseActivity');
const CaseResolution = require('../models/CaseResolution');

/**
 * @desc    Get panelist dashboard statistics
 * @route   GET /api/panelist/dashboard/stats
 * @access  Private (Panelist only)
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const panelistId = req.user.panelistProfile;

    if (!panelistId) {
      return res.status(400).json({
        status: 'error',
        message: 'Panelist profile not found'
      });
    }

    const panelist = await Panelist.findById(panelistId);

    if (!panelist) {
      return res.status(404).json({
        status: 'error',
        message: 'Panelist not found'
      });
    }

    // Get active cases count
    const activeCases = await Case.countDocuments({
      'assignedPanelists.panelist': panelistId,
      'assignedPanelists.status': 'active',
      status: { $nin: ['resolved', 'closed'] }
    });

    // Get cases pending resolution submission
    const pendingResolutionCases = await Case.find({
      'assignedPanelists.panelist': panelistId,
      'assignedPanelists.status': 'active',
      status: 'in_progress'
    });

    // Check which cases need resolution submission
    let casesNeedingResolution = 0;
    for (const caseItem of pendingResolutionCases) {
      const resolution = await CaseResolution.findOne({
        case: caseItem._id,
        panelist: panelistId
      });

      if (!resolution || !resolution.isSubmitted) {
        casesNeedingResolution++;
      }
    }

    // Get resolved cases count
    const resolvedCases = await Case.countDocuments({
      'assignedPanelists.panelist': panelistId,
      status: { $in: ['resolved', 'closed'] }
    });

    // Get upcoming meetings
    const upcomingMeetings = await Meeting.countDocuments({
      $or: [
        { scheduledBy: req.user._id },
        { 'attendees.user': req.user._id }
      ],
      scheduledDate: { $gte: new Date() },
      status: 'scheduled'
    });

    // Calculate this month's statistics
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyResolved = await Case.countDocuments({
      'assignedPanelists.panelist': panelistId,
      status: { $in: ['resolved', 'closed'] },
      finalizedAt: { $gte: startOfMonth }
    });

    res.status(200).json({
      status: 'success',
      data: {
        overview: {
          activeCases,
          casesNeedingResolution,
          resolvedCases: panelist.statistics.casesResolved,
          totalCases: panelist.statistics.totalCasesHandled,
          upcomingMeetings
        },
        thisMonth: {
          resolvedCases: monthlyResolved
        },
        availability: {
          currentCaseLoad: panelist.availability.currentCaseLoad,
          maxCases: panelist.availability.maxCases,
          status: panelist.availability.status,
          capacityPercentage: Math.round(
            (panelist.availability.currentCaseLoad / panelist.availability.maxCases) * 100
          )
        },
        performance: {
          rating: panelist.rating.average,
          ratingCount: panelist.rating.count,
          averageResolutionTime: panelist.statistics.averageResolutionTime
        }
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Get recent activity for panelist
 * @route   GET /api/panelist/dashboard/recent-activity
 * @access  Private (Panelist only)
 */
exports.getRecentActivity = async (req, res) => {
  try {
    const panelistId = req.user.panelistProfile;
    const { limit = 20 } = req.query;

    if (!panelistId) {
      return res.status(400).json({
        status: 'error',
        message: 'Panelist profile not found'
      });
    }

    // Get cases assigned to this panelist
    const assignedCases = await Case.find({
      'assignedPanelists.panelist': panelistId,
      'assignedPanelists.status': 'active'
    }).select('_id');

    const caseIds = assignedCases.map(c => c._id);

    // Get recent activities for these cases
    const activities = await CaseActivity.find({
      case: { $in: caseIds }
    })
      .populate('case', 'title caseId type status')
      .populate('performedBy.userId', 'firstName lastName email')
      .populate('performedBy.panelistId', 'name occupation')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      status: 'success',
      data: {
        activities,
        count: activities.length
      }
    });
  } catch (error) {
    console.error('Recent activity error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Get upcoming meetings for panelist
 * @route   GET /api/panelist/dashboard/upcoming-meetings
 * @access  Private (Panelist only)
 */
exports.getUpcomingMeetings = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const meetings = await Meeting.find({
      $or: [
        { scheduledBy: req.user._id },
        { 'attendees.user': req.user._id }
      ],
      scheduledDate: { $gte: new Date() },
      status: 'scheduled'
    })
      .populate('case', 'title caseId type')
      .populate('scheduledBy', 'firstName lastName email')
      .sort({ scheduledDate: 1 })
      .limit(parseInt(limit));

    res.status(200).json({
      status: 'success',
      data: {
        meetings,
        count: meetings.length
      }
    });
  } catch (error) {
    console.error('Upcoming meetings error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Get panelist performance metrics
 * @route   GET /api/panelist/dashboard/performance
 * @access  Private (Panelist only)
 */
exports.getPerformanceMetrics = async (req, res) => {
  try {
    const panelistId = req.user.panelistProfile;

    if (!panelistId) {
      return res.status(400).json({
        status: 'error',
        message: 'Panelist profile not found'
      });
    }

    const panelist = await Panelist.findById(panelistId);

    if (!panelist) {
      return res.status(404).json({
        status: 'error',
        message: 'Panelist not found'
      });
    }

    // Get monthly case resolution trend (last 6 months)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - i);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);

      const count = await Case.countDocuments({
        'assignedPanelists.panelist': panelistId,
        status: { $in: ['resolved', 'closed'] },
        finalizedAt: { $gte: startDate, $lt: endDate }
      });

      monthlyTrend.push({
        month: startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        resolved: count
      });
    }

    // Get case distribution by type
    const casesByType = await Case.aggregate([
      {
        $match: {
          'assignedPanelists.panelist': panelistId,
          'assignedPanelists.status': 'active'
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
        statistics: panelist.statistics,
        rating: panelist.rating,
        monthlyTrend,
        caseDistribution: casesByType
      }
    });
  } catch (error) {
    console.error('Performance metrics error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};
