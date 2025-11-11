const express = require('express');
const router = express.Router();

// Import controllers
const {
  getDashboardStats,
  getRecentUpdates,
  getUpcomingMeetings
} = require('../controllers/clientDashboardController');

const {
  getMyCases,
  getCaseById,
  getCaseTimeline,
  getCaseDocuments,
  getCaseNotes,
  getCasePanel,
  getCaseResolution,
  getCaseMeetings,
  getMyMeetings,
  getMeetingById
} = require('../controllers/clientCaseController');

// Import middleware
const { protect, authorize } = require('../middleware/auth');

// ==================== Public Routes ====================
// (None - all client routes require authentication)

// ==================== Protected Client Routes ====================
// Apply authentication and client authorization to all routes below
router.use(protect);
router.use(authorize('client'));

// ==================== Dashboard Routes ====================
/**
 * @desc    Get client dashboard statistics
 * @route   GET /api/client/dashboard/stats
 * @access  Private (Client only)
 */
router.get('/dashboard/stats', getDashboardStats);

/**
 * @desc    Get recent updates for client's cases
 * @route   GET /api/client/dashboard/recent-updates
 * @access  Private (Client only)
 */
router.get('/dashboard/recent-updates', getRecentUpdates);

/**
 * @desc    Get upcoming meetings for client
 * @route   GET /api/client/dashboard/upcoming-meetings
 * @access  Private (Client only)
 */
router.get('/dashboard/upcoming-meetings', getUpcomingMeetings);

// ==================== Cases Routes ====================
/**
 * @desc    Get all cases for logged-in client
 * @route   GET /api/client/cases
 * @access  Private (Client only)
 */
router.get('/cases', getMyCases);

/**
 * @desc    Get detailed case information
 * @route   GET /api/client/cases/:caseId
 * @access  Private (Client only)
 */
router.get('/cases/:caseId', getCaseById);

/**
 * @desc    Get case timeline/activity
 * @route   GET /api/client/cases/:caseId/timeline
 * @access  Private (Client only)
 */
router.get('/cases/:caseId/timeline', getCaseTimeline);

/**
 * @desc    Get case documents
 * @route   GET /api/client/cases/:caseId/documents
 * @access  Private (Client only)
 */
router.get('/cases/:caseId/documents', getCaseDocuments);

/**
 * @desc    Get case notes (filtered for client view)
 * @route   GET /api/client/cases/:caseId/notes
 * @access  Private (Client only)
 */
router.get('/cases/:caseId/notes', getCaseNotes);

/**
 * @desc    Get assigned panelists for a case
 * @route   GET /api/client/cases/:caseId/panel
 * @access  Private (Client only)
 */
router.get('/cases/:caseId/panel', getCasePanel);

/**
 * @desc    Get case resolution status and details
 * @route   GET /api/client/cases/:caseId/resolution
 * @access  Private (Client only)
 */
router.get('/cases/:caseId/resolution', getCaseResolution);

/**
 * @desc    Get all meetings for a specific case
 * @route   GET /api/client/cases/:caseId/meetings
 * @access  Private (Client only)
 */
router.get('/cases/:caseId/meetings', getCaseMeetings);

// ==================== Meetings Routes ====================
/**
 * @desc    Get all meetings for client (across all cases)
 * @route   GET /api/client/meetings
 * @access  Private (Client only)
 */
router.get('/meetings', getMyMeetings);

/**
 * @desc    Get detailed meeting information
 * @route   GET /api/client/meetings/:meetingId
 * @access  Private (Client only)
 */
router.get('/meetings/:meetingId', getMeetingById);

module.exports = router;
