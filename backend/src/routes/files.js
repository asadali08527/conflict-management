const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const { protect } = require('../middleware/auth');
const { validateBody } = require('../middleware/validation');
const {
  generateUploadUrlSchema,
  saveFileRecordSchema
} = require('../utils/validators');

/**
 * @swagger
 * tags:
 *   name: Files
 *   description: File upload and management endpoints
 */

/**
 * @swagger
 * /api/files/config:
 *   get:
 *     summary: Get file upload configuration
 *     description: Returns allowed file types, sizes, and upload contexts
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Upload configuration retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     fileTypes:
 *                       type: object
 *                     uploadContexts:
 *                       type: object
 *                     presignedUrlExpiry:
 *                       type: number
 *                       example: 3600
 */
router.get('/config', protect, fileController.getUploadConfig);

/**
 * @swagger
 * /api/files/generate-upload-url:
 *   post:
 *     summary: Generate presigned URL for file upload
 *     description: Generate a presigned S3 URL for direct client-to-S3 upload
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fileName
 *               - fileType
 *               - fileSize
 *               - uploadContext
 *             properties:
 *               fileName:
 *                 type: string
 *                 description: Original file name
 *                 example: document.pdf
 *               fileType:
 *                 type: string
 *                 description: MIME type of the file
 *                 example: application/pdf
 *               fileSize:
 *                 type: number
 *                 description: File size in bytes
 *                 example: 1024000
 *               uploadContext:
 *                 type: string
 *                 enum: [profile, case, message, resolution]
 *                 description: Context for file upload
 *                 example: case
 *               sessionId:
 *                 type: string
 *                 description: Session ID for case submission uploads
 *               caseId:
 *                 type: string
 *                 description: Case ID for case document uploads
 *     responses:
 *       200:
 *         description: Presigned URL generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     uploadUrl:
 *                       type: string
 *                       description: Presigned S3 upload URL
 *                     fileKey:
 *                       type: string
 *                       description: S3 object key
 *                     bucket:
 *                       type: string
 *                       description: S3 bucket name
 *                     expiresIn:
 *                       type: number
 *                       description: URL expiry time in seconds
 *                       example: 3600
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post(
  '/generate-upload-url',
  protect,
  validateBody(generateUploadUrlSchema),
  fileController.generateUploadUrl
);

/**
 * @swagger
 * /api/files/save-file-record:
 *   post:
 *     summary: Save file record after successful upload
 *     description: Save file metadata to database after successful S3 upload
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fileKey
 *               - fileName
 *               - fileSize
 *               - fileType
 *               - uploadContext
 *             properties:
 *               fileKey:
 *                 type: string
 *                 description: S3 object key returned from generate-upload-url
 *               fileName:
 *                 type: string
 *                 description: Original file name
 *               fileSize:
 *                 type: number
 *                 description: File size in bytes
 *               fileType:
 *                 type: string
 *                 description: MIME type
 *               uploadContext:
 *                 type: string
 *                 enum: [profile, case, message, resolution]
 *               sessionId:
 *                 type: string
 *                 description: Session ID for case submission uploads
 *               caseId:
 *                 type: string
 *                 description: Case ID for case document uploads
 *               description:
 *                 type: string
 *                 description: Optional file description
 *     responses:
 *       201:
 *         description: File record saved successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Case or user not found
 *       500:
 *         description: Server error
 */
router.post(
  '/save-file-record',
  protect,
  validateBody(saveFileRecordSchema),
  fileController.saveFileRecord
);

/**
 * @swagger
 * /api/files/download-url/{fileKey}:
 *   get:
 *     summary: Get presigned download URL
 *     description: Generate presigned URL for downloading/viewing a file
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileKey
 *         required: true
 *         schema:
 *           type: string
 *         description: S3 object key
 *       - in: query
 *         name: expiresIn
 *         schema:
 *           type: number
 *           default: 3600
 *         description: URL expiry time in seconds
 *     responses:
 *       200:
 *         description: Download URL generated successfully
 *       400:
 *         description: File key is required
 *       500:
 *         description: Server error
 */
router.get('/download-url/:fileKey', protect, fileController.getDownloadUrl);

/**
 * @swagger
 * /api/files/{fileKey}:
 *   delete:
 *     summary: Delete file
 *     description: Delete file from S3 and database
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileKey
 *         required: true
 *         schema:
 *           type: string
 *         description: S3 object key
 *       - in: query
 *         name: uploadContext
 *         schema:
 *           type: string
 *           enum: [profile, case, message, resolution]
 *       - in: query
 *         name: caseId
 *         schema:
 *           type: string
 *       - in: query
 *         name: documentId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File deleted successfully
 *       400:
 *         description: File key is required
 *       500:
 *         description: Server error
 */
router.delete('/:fileKey', protect, fileController.deleteFile);

module.exports = router;
