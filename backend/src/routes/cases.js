const express = require('express');
const router = express.Router();
const { createCase, getCases, getCaseById, updateCaseStatus, deleteCase, uploadCaseDocuments, deleteCaseDocument, getFullCaseDetails } = require('../controllers/caseController');
const { protect } = require('../middleware/auth');
const { validateBody, validateParams } = require('../middleware/validation');
const { createCaseSchema, updateCaseStatusSchema } = require('../utils/validators');
const { uploadCaseDocuments: uploadMiddleware, handleUploadErrors } = require('../middleware/upload');

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateCaseRequest:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - priority
 *       properties:
 *         title:
 *           type: string
 *           description: Case title
 *         description:
 *           type: string
 *           description: Case description
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *           description: Case priority level
 *         participants:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of participant user IDs
 *         mediator:
 *           type: string
 *           description: Mediator user ID
 *     UpdateCaseStatusRequest:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [pending, in_progress, resolved, closed]
 *           description: New case status
 *     CasesListResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         data:
 *           type: object
 *           properties:
 *             cases:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Case'
 *             pagination:
 *               type: object
 *               properties:
 *                 page:
 *                   type: number
 *                 limit:
 *                   type: number
 *                 total:
 *                   type: number
 *                 pages:
 *                   type: number
 */

/**
 * @swagger
 * /api/cases:
 *   post:
 *     summary: Create a new case
 *     description: Create a new conflict resolution case
 *     tags: [Cases]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCaseRequest'
 *     responses:
 *       201:
 *         description: Case created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Case'
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', protect, validateBody(createCaseSchema), createCase);

/**
 * @swagger
 * /api/cases:
 *   get:
 *     summary: Get all cases
 *     description: Retrieve all cases with pagination
 *     tags: [Cases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of cases per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, resolved, closed]
 *         description: Filter cases by status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         description: Filter cases by priority
 *     responses:
 *       200:
 *         description: Cases retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CasesListResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', protect, getCases);

/**
 * @swagger
 * /api/cases/{id}:
 *   get:
 *     summary: Get case by ID
 *     description: Retrieve a specific case by its ID
 *     tags: [Cases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Case ID
 *     responses:
 *       200:
 *         description: Case retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Case'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Case not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', protect, getCaseById);

/**
 * @swagger
 * /api/cases/{id}/status:
 *   put:
 *     summary: Update case status
 *     description: Update the status of a specific case
 *     tags: [Cases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Case ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCaseStatusRequest'
 *     responses:
 *       200:
 *         description: Case status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Case'
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Case not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id/status', protect, validateBody(updateCaseStatusSchema), updateCaseStatus);

/**
 * @swagger
 * /api/cases/{id}:
 *   delete:
 *     summary: Delete case
 *     description: Delete a specific case by its ID
 *     tags: [Cases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Case ID
 *     responses:
 *       200:
 *         description: Case deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Case deleted successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Case not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', protect, deleteCase);

// Upload documents to a case
router.post('/:id/documents', protect, handleUploadErrors(uploadMiddleware), uploadCaseDocuments);

// Delete a document from a case
router.delete('/:id/documents/:documentId', protect, deleteCaseDocument);

// Get full case details with both parties' submissions (Admin only)
router.get('/:id/full-details', protect, getFullCaseDetails);

module.exports = router;