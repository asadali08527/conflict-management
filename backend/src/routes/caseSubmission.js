const express = require('express');
const multer = require('multer');
const router = express.Router();

const {
  createSession,
  getSession,
  getCaseDraft,
  updateSession,
  submitStep1,
  submitStep2,
  submitStep3,
  submitStep4,
  submitStep5,
  submitStep6,
  submitCase,
  joinCase
} = require('../controllers/caseSubmissionController');

const { protect, optionalAuth } = require('../middleware/auth');
const { validateBody } = require('../middleware/validation');
const fileValidator = require('../utils/fileValidator');

const {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
  step6Schema,
  finalSubmissionSchema,
  createSessionSchema,
  updateSessionSchema,
  joinCaseSchema
} = require('../utils/validators');

// Configure multer for file uploads (Step 6)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Max 5 files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword',
                         'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                         'image/jpeg', 'image/png', 'text/plain'];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Allowed: PDF, DOC, DOCX, JPG, PNG, TXT'), false);
    }
  }
});

// Session management routes
router.post('/session', optionalAuth, validateBody(createSessionSchema), createSession);
router.get('/session/:sessionId', getSession);
router.patch('/session/:sessionId', validateBody(updateSessionSchema), updateSession);
router.get('/draft/:sessionId', getCaseDraft);

// Party B join route
router.post('/join-case', optionalAuth, validateBody(joinCaseSchema), joinCase);

// Step submission routes
router.post('/step1', protect, validateBody(step1Schema), submitStep1);
router.post('/step2', protect, validateBody(step2Schema), submitStep2);
router.post('/step3', protect, validateBody(step3Schema), submitStep3);
router.post('/step4', protect, validateBody(step4Schema), submitStep4);
router.post('/step5', protect, validateBody(step5Schema), submitStep5);
router.post('/step6', protect, upload.array('files', 5), validateBody(step6Schema), submitStep6);

// Final submission
router.post('/submit', protect, validateBody(finalSubmissionSchema), submitCase);

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'FILE_UPLOAD_ERROR',
        message: 'File size too large. Maximum 10MB per file.'
      });
    } else if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'FILE_UPLOAD_ERROR',
        message: 'Too many files. Maximum 5 files allowed.'
      });
    }
  } else if (error.message.includes('Unsupported file type')) {
    return res.status(400).json({
      success: false,
      error: 'FILE_UPLOAD_ERROR',
      message: error.message
    });
  }

  next(error);
});

module.exports = router;