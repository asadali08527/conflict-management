const path = require('path');
const fs = require('fs');

/**
 * Validates file size against maximum allowed size
 * @param {Object} file - The uploaded file object
 * @param {Number} maxSize - Maximum allowed file size in bytes
 * @returns {Boolean} - Whether the file size is valid
 */
const validateFileSize = (file, maxSize) => {
  return file.size <= maxSize;
};

/**
 * Validates file type against allowed extensions
 * @param {Object} file - The uploaded file object
 * @param {Array} allowedTypes - Array of allowed file extensions
 * @returns {Boolean} - Whether the file type is valid
 */
const validateFileType = (file, allowedTypes) => {
  const fileExt = path.extname(file.originalname).toLowerCase();
  return allowedTypes.includes(fileExt);
};

/**
 * Performs basic virus scan simulation on uploaded file
 * In a production environment, this should be replaced with a real antivirus scan
 * @param {Object} file - The uploaded file object
 * @returns {Promise<Boolean>} - Whether the file passed the scan
 */
const scanFile = async (file) => {
  // This is a placeholder for a real virus scan
  // In production, integrate with a virus scanning service or library

  // Simulate scanning by checking file signature/magic numbers
  try {
    // Read the first few bytes of the file to check its signature
    const buffer = Buffer.alloc(8);
    const fd = fs.openSync(file.path, 'r');
    fs.readSync(fd, buffer, 0, 8, 0);
    fs.closeSync(fd);

    return scanFileBuffer(buffer);
  } catch (error) {
    console.error('Error scanning file:', error);
    return false; // Fail closed for safety
  }
};

/**
 * Performs basic virus scan simulation on file buffer (for memory storage)
 * @param {Buffer} buffer - The file buffer
 * @returns {Promise<Boolean>} - Whether the file passed the scan
 */
const scanFileBuffer = async (buffer) => {
  try {
    // Check for suspicious patterns (this is just a basic example)
    // In reality, you would use a proper virus scanning library
    const hexSignature = buffer.slice(0, 8).toString('hex');

    // List of suspicious file signatures (example only)
    const suspiciousSignatures = [
      '4d5a9000', // Executable
      '504b0304', // ZIP files (could contain malicious scripts)
      '7f454c46'  // ELF binaries
    ];

    // Check if file signature matches any suspicious signatures
    for (const signature of suspiciousSignatures) {
      if (hexSignature.startsWith(signature)) {
        return false; // Potentially malicious file
      }
    }

    return true; // File passed basic scan
  } catch (error) {
    console.error('Error scanning file buffer:', error);
    return false; // Fail closed for safety
  }
};

/**
 * Sanitizes filename to prevent path traversal and command injection
 * @param {String} filename - Original filename
 * @returns {String} - Sanitized filename
 */
const sanitizeFilename = (filename) => {
  // Remove any directory traversal characters
  let sanitized = filename.replace(/\.\.+/g, '');
  
  // Remove any path separators
  sanitized = sanitized.replace(/[\/\\]/g, '');
  
  // Remove any potentially dangerous characters
  sanitized = sanitized.replace(/[&;$%@"'<>()\|]/g, '');
  
  // Ensure filename isn't empty after sanitization
  if (!sanitized) {
    sanitized = 'file_' + Date.now();
  }
  
  return sanitized;
};

module.exports = {
  validateFileSize,
  validateFileType,
  scanFile,
  scanFileBuffer,
  sanitizeFilename
};