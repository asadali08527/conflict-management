const mongoose = require('mongoose');

const CaseSubmissionSchema = new mongoose.Schema({
  caseId: {
    type: String,
    unique: true,
    sparse: true // Only unique if not null
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'processing', 'completed'],
    default: 'draft'
  },
  currentStep: {
    type: Number,
    min: 1,
    max: 6,
    default: 1
  },
  completedSteps: [{
    type: Number,
    min: 1,
    max: 6
  }],
  // Multi-party support fields
  parentSessionId: {
    type: String,
    default: null // null for Party A, Party A's sessionId for Party B
  },
  submitterType: {
    type: String,
    enum: ['party_a', 'party_b'],
    default: 'party_a'
  },
  linkedSessionId: {
    type: String,
    default: null // Party A stores Party B's sessionId here
  },
  submittedAt: {
    type: Date,
    default: null
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

CaseSubmissionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('CaseSubmission', CaseSubmissionSchema);