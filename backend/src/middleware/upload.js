const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fileValidator = require('../utils/fileValidator');
const s3Service = require('../services/s3Service');

// Note: Using memory storage since files will be uploaded to S3
// Temporary directories are still created for fallback/debugging purposes
const createUploadDirs = () => {
  const profilesDir = path.join(__dirname, '../../uploads/profiles');
  const casesDir = path.join(__dirname, '../../uploads/cases');

  if (!fs.existsSync(profilesDir)) {
    fs.mkdirSync(profilesDir, { recursive: true });
  }

  if (!fs.existsSync(casesDir)) {
    fs.mkdirSync(casesDir, { recursive: true });
  }
};

createUploadDirs();

// Allowed file types
const allowedFileTypes = [
  // Images
  '.jpg', '.jpeg', '.png', '.gif',
  // Documents
  '.pdf', '.doc', '.docx', '.txt',
  // Spreadsheets
  '.xls', '.xlsx',
  // Presentations
  '.ppt', '.pptx'
];

// Use memory storage for S3 uploads
const memoryStorage = multer.memoryStorage();

// File filter for allowed file types
const fileFilter = (req, file, cb) => {
  const fileExt = path.extname(file.originalname).toLowerCase();
  
  if (fileValidator.validateFileType(file, allowedFileTypes)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed. Allowed types: ' + allowedFileTypes.join(', ')));
  }
};

// Configure multer for profile pictures
exports.uploadProfilePicture = multer({
  storage: memoryStorage,
  limits: {
    fileSize: process.env.MAX_FILE_SIZE || 10000000 // 10MB default
  },
  fileFilter
}).single('profilePicture');

// Configure multer for case documents
exports.uploadCaseDocuments = multer({
  storage: memoryStorage,
  limits: {
    fileSize: process.env.MAX_FILE_SIZE || 10000000 // 10MB default
  },
  fileFilter
}).array('documents', 5); // Allow up to 5 documents per upload

// Middleware to handle multer errors
exports.handleUploadErrors = (uploadMiddleware) => {
  return (req, res, next) => {
    uploadMiddleware(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        // Multer error (file size, etc.)
        return res.status(400).json({
          status: 'error',
          message: `Upload error: ${err.message}`
        });
      } else if (err) {
        // Other errors (file type, etc.)
        return res.status(400).json({
          status: 'error',
          message: err.message
        });
      }
      
      // If files were uploaded, scan them for malicious content
      // Note: With memory storage, files are in memory (req.file.buffer) not on disk
      if (req.file) {
        // Single file upload - validate file buffer
        const isSafe = await fileValidator.scanFileBuffer(req.file.buffer);
        if (!isSafe) {
          return res.status(400).json({
            status: 'error',
            message: 'File failed security scan and was rejected'
          });
        }
      } else if (req.files && req.files.length > 0) {
        // Multiple files upload - validate all file buffers
        for (const file of req.files) {
          const isSafe = await fileValidator.scanFileBuffer(file.buffer);
          if (!isSafe) {
            return res.status(400).json({
              status: 'error',
              message: 'One or more files failed security scan and were rejected'
            });
          }
        }
      }
      
      next();
    });
  };
};