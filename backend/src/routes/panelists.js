const express = require('express');
const router = express.Router();
const {
  createPanelist,
  getAllPanelists,
  getPanelistById,
  updatePanelist,
  deactivatePanelist,
  assignPanelToCase,
  removePanelistFromCase,
  getPanelistCases,
  getAvailablePanelists,
  getPanelistStatistics,
  createPanelistAccount,
  resetPanelistPassword,
  getPanelistPerformance
} = require('../controllers/panelistController');
const { protect, authorize } = require('../middleware/auth');
const { validateBody } = require('../middleware/validation');
const {
  createPanelistSchema,
  updatePanelistSchema,
  assignPanelSchema,
  createPanelistAccountSchema
} = require('../utils/validators');

// Apply authentication and admin authorization to all routes
router.use(protect);
router.use(authorize('admin'));

// Panelist Management Routes
router.post('/', validateBody(createPanelistSchema), createPanelist);
router.get('/', getAllPanelists);
router.get('/available', getAvailablePanelists);
router.get('/statistics', getPanelistStatistics);
router.get('/:id', getPanelistById);
router.patch('/:id', validateBody(updatePanelistSchema), updatePanelist);
router.delete('/:id', deactivatePanelist);

// Panelist Case Management Routes
router.get('/:id/cases', getPanelistCases);

// Panelist Account Management Routes
router.post('/:id/create-account', validateBody(createPanelistAccountSchema), createPanelistAccount);
router.post('/:id/reset-password', resetPanelistPassword);
router.get('/:id/performance', getPanelistPerformance);

// Panel Assignment Routes (for cases)
router.post('/cases/:caseId/assign-panel', validateBody(assignPanelSchema), assignPanelToCase);
router.delete('/cases/:caseId/panelists/:panelistId', removePanelistFromCase);

module.exports = router;
