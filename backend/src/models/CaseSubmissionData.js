const mongoose = require('mongoose');

const CaseSubmissionDataSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true
  },
  stepId: {
    type: Number,
    required: true,
    min: 1,
    max: 6
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient queries
CaseSubmissionDataSchema.index({ sessionId: 1, stepId: 1 }, { unique: true });

CaseSubmissionDataSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('CaseSubmissionData', CaseSubmissionDataSchema);