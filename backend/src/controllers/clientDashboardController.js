const Case = require('../models/Case');
const Meeting = require('../models/Meeting');
const CaseActivity = require('../models/CaseActivity');

/**
 * @desc    Get client dashboard statistics
 * @route   GET /api/client/dashboard/stats
 * @access  Private (Client only)
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get case statistics for this user
    const totalCases = await Case.countDocuments({ createdBy: userId });
    const openCases = await Case.countDocuments({
      createdBy: userId,
      status: 'open'
    });
    const assignedCases = await Case.countDocuments({
      createdBy: userId,
      status: { $in: ['assigned', 'panel_assigned'] }
    });
    const inProgressCases = await Case.countDocuments({
      createdBy: userId,
      status: 'in_progress'
    });
    const resolvedCases = await Case.countDocuments({
      createdBy: userId,
      status: { $in: ['resolved', 'closed'] }
    });

    // Get upcoming meetings count
    const upcomingMeetings = await Meeting.countDocuments({
      'attendees.user': userId,
      scheduledDate: { $gte: new Date() },
      status: 'scheduled'
    });

    // Get recent activity count (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get user's cases for activity filtering
    const userCases = await Case.find({ createdBy: userId }).select('_id');
    const caseIds = userCases.map(c => c._id);

    const recentActivityCount = await CaseActivity.countDocuments({
      case: { $in: caseIds },
      createdAt: { $gte: sevenDaysAgo }
    });

    // Get cases by type distribution
    const casesByType = await Case.aggregate([
      {
        $match: { createdBy: userId }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get latest case update
    const latestActivity = await CaseActivity.findOne({
      case: { $in: caseIds }
    })
      .populate('case', 'title caseId status')
      .sort({ createdAt: -1 })
      .limit(1);

    res.status(200).json({
      status: 'success',
      data: {
        overview: {
          totalCases,
          openCases,
          assignedCases,
          inProgressCases,
          resolvedCases,
          upcomingMeetings,
          recentActivityCount
        },
        caseDistribution: casesByType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        latestUpdate: latestActivity ? {
          caseTitle: latestActivity.case?.title,
          caseId: latestActivity.case?.caseId,
          activityType: latestActivity.activityType,
          description: latestActivity.description,
          timestamp: latestActivity.createdAt
        } : null
      }
    });
  } catch (error) {
    console.error('Client dashboard stats error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Get recent updates for client's cases
 * @route   GET /api/client/dashboard/recent-updates
 * @access  Private (Client only)
 */
exports.getRecentUpdates = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 20 } = req.query;

    // Get user's cases
    const userCases = await Case.find({ createdBy: userId }).select('_id');
    const caseIds = userCases.map(c => c._id);

    // Get recent activities
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
    console.error('Recent updates error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Get upcoming meetings for client
 * @route   GET /api/client/dashboard/upcoming-meetings
 * @access  Private (Client only)
 */
exports.getUpcomingMeetings = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 10 } = req.query;

    const meetings = await Meeting.find({
      'attendees.user': userId,
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
