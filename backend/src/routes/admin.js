const express = require('express');
const router = express.Router();
const {
  registerAdmin,
  loginAdmin,
  getDashboardStats,
  getAllCases,
  updateCaseStatus,
  getAllUsers,
  toggleUserStatus,
  scheduleMeeting,
  getAllMeetings,
  getMeetingById,
  updateMeeting,
  cancelMeeting,
  getCaseMeetings,
  assignCase,
  unassignCase,
  updateCasePriority,
  getMyAssignedCases,
  getCaseWithPartyDetails,
  addCaseNote,
  getAdminUsers,
  getCaseFiles,
  getCaseStatsByAdmin,
  getPanelStatistics
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const { validateBody } = require('../middleware/validation');
const { registerSchema, loginSchema } = require('../utils/validators');

// Admin Authentication Routes
router.post('/auth/register', validateBody(registerSchema), registerAdmin);
router.post('/auth/login', validateBody(loginSchema), loginAdmin);

// Protected Admin Routes (require admin role)
router.use(protect); // Apply authentication to all routes below
router.use(authorize('admin')); // Apply admin authorization to all routes below

// Dashboard Routes
router.get('/dashboard/stats', getDashboardStats);

// Statistics Routes
router.get('/statistics/by-admin', getCaseStatsByAdmin);
router.get('/statistics/panel', getPanelStatistics);

// Case Management Routes
router.get('/cases', getAllCases);
router.get('/cases/my-assignments', getMyAssignedCases);
router.get('/cases/:id/detailed', getCaseWithPartyDetails);
router.get('/cases/:id/files', getCaseFiles);
router.patch('/cases/:id/status', updateCaseStatus);
router.patch('/cases/:id/assign', assignCase);
router.patch('/cases/:id/unassign', unassignCase);
router.patch('/cases/:id/priority', updateCasePriority);
router.post('/cases/:id/notes', addCaseNote);

// User Management Routes
router.get('/users', getAllUsers);
router.get('/users/admins', getAdminUsers);
router.patch('/users/:id/toggle-status', toggleUserStatus);

// Meeting Management Routes
router.post('/meetings', scheduleMeeting);
router.get('/meetings', getAllMeetings);
router.get('/meetings/:id', getMeetingById);
router.patch('/meetings/:id', updateMeeting);
router.patch('/meetings/:id/cancel', cancelMeeting);

// Case-specific meeting routes
router.get('/cases/:caseId/meetings', getCaseMeetings);

module.exports = router;