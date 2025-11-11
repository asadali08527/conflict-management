const mongoose = require('mongoose');

const CaseFileSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  storagePath: {
    type: String,
    required: true
  },
  storageKey: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  uploadUrl: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
CaseFileSchema.index({ sessionId: 1 });

module.exports = mongoose.model('CaseFile', CaseFileSchema);