const express = require('express');
const router = express.Router();

// Import controllers
const {
  login,
  getMe,
  changePassword,
  logout
} = require('../controllers/panelistAuthController');

const {
  getDashboardStats,
  getRecentActivity,
  getUpcomingMeetings,
  getPerformanceMetrics
} = require('../controllers/panelistDashboardController');

const {
  getProfile,
  updateProfile,
  updateAvailability,
  updateProfilePicture,
  updateAccountInfo
} = require('../controllers/panelistProfileController');

const {
  getMyCases,
  getCaseById,
  getCaseParties,
  getCaseDocuments,
  addCaseNote,
  uploadCaseDocument,
  getCaseTimeline,
  getCaseResolutions
} = require('../controllers/panelistCaseController');

const {
  submitResolution,
  updateResolution,
  getResolutionStatus,
  getMyResolution
} = require('../controllers/panelistResolutionController');

const {
  scheduleMeeting,
  getMeetings,
  getMeetingById,
  updateMeeting,
  cancelMeeting,
  addMeetingNotes
} = require('../controllers/panelistMeetingController');

// Import middleware
const { protect, authorize } = require('../middleware/auth');

// ==================== Authentication Routes ====================
// Public routes (no authentication required)
router.post('/auth/login', login);

// Protected routes (require panelist authentication)
router.use(protect); // All routes after this require authentication
router.use(authorize('panelist')); // All routes require panelist role

// Auth routes (protected)
router.get('/auth/me', getMe);
router.post('/auth/logout', logout);
router.patch('/auth/change-password', changePassword);

// ==================== Dashboard Routes ====================
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/recent-activity', getRecentActivity);
router.get('/dashboard/upcoming-meetings', getUpcomingMeetings);
router.get('/dashboard/performance', getPerformanceMetrics);

// ==================== Profile Routes ====================
router.get('/profile', getProfile);
router.patch('/profile', updateProfile);
router.patch('/profile/availability', updateAvailability);
router.patch('/profile/profile-picture', updateProfilePicture);
router.patch('/profile/account', updateAccountInfo);

// ==================== Case Management Routes ====================
router.get('/cases', getMyCases);
router.get('/cases/:caseId', getCaseById);
router.get('/cases/:caseId/parties', getCaseParties);
router.get('/cases/:caseId/documents', getCaseDocuments);
router.post('/cases/:caseId/notes', addCaseNote);
router.post('/cases/:caseId/documents', uploadCaseDocument);
router.get('/cases/:caseId/timeline', getCaseTimeline);
router.get('/cases/:caseId/resolutions', getCaseResolutions);

// ==================== Resolution Routes ====================
router.post('/cases/:caseId/resolution/submit', submitResolution);
router.patch('/cases/:caseId/resolution/update', updateResolution);
router.get('/cases/:caseId/resolution/status', getResolutionStatus);
router.get('/cases/:caseId/resolution/my', getMyResolution);

// ==================== Meeting Routes ====================
router.post('/meetings', scheduleMeeting);
router.get('/meetings', getMeetings);
router.get('/meetings/:meetingId', getMeetingById);
router.patch('/meetings/:meetingId', updateMeeting);
router.delete('/meetings/:meetingId', cancelMeeting);
router.post('/meetings/:meetingId/notes', addMeetingNotes);

module.exports = router;
