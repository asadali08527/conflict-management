const mongoose = require('mongoose');

const CaseResolutionSchema = new mongoose.Schema({
  case: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case',
    required: [true, 'Case reference is required']
  },
  panelist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Panelist',
    required: [true, 'Panelist reference is required']
  },
  resolutionStatus: {
    type: String,
    enum: ['resolved', 'no_outcome', 'pending'],
    default: 'pending',
    comment: 'Whether the panelist believes the case was resolved or not'
  },
  resolutionNotes: {
    type: String,
    required: [true, 'Resolution notes are required'],
    trim: true,
    maxlength: [5000, 'Resolution notes cannot exceed 5000 characters'],
    comment: 'Panelist understanding and notes about how the case was resolved'
  },
  outcome: {
    type: String,
    trim: true,
    maxlength: [2000, 'Outcome description cannot exceed 2000 characters'],
    comment: 'Brief description of the outcome or agreement reached'
  },
  recommendations: {
    type: String,
    trim: true,
    maxlength: [2000, 'Recommendations cannot exceed 2000 characters'],
    comment: 'Recommendations for future actions or follow-ups'
  },
  isSubmitted: {
    type: Boolean,
    default: false,
    comment: 'Whether this resolution has been finalized and submitted'
  },
  submittedAt: {
    type: Date,
    default: null
  },
  lastModifiedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
CaseResolutionSchema.index({ case: 1, panelist: 1 }, { unique: true });
CaseResolutionSchema.index({ case: 1 });
CaseResolutionSchema.index({ panelist: 1 });
CaseResolutionSchema.index({ isSubmitted: 1 });

// Update lastModifiedAt before saving
CaseResolutionSchema.pre('save', function(next) {
  this.lastModifiedAt = Date.now();
  if (this.isSubmitted && !this.submittedAt) {
    this.submittedAt = Date.now();
  }
  next();
});

// Method to check if all panelists for a case have submitted
CaseResolutionSchema.statics.checkCaseResolutionComplete = async function(caseId) {
  const Case = mongoose.model('Case');
  const caseDoc = await Case.findById(caseId).populate('assignedPanelists.panelist');

  if (!caseDoc) {
    throw new Error('Case not found');
  }

  // Get active panelists for this case
  const activePanelistIds = caseDoc.assignedPanelists
    .filter(ap => ap.status === 'active')
    .map(ap => ap.panelist._id.toString());

  // Get submitted resolutions
  const submittedResolutions = await this.find({
    case: caseId,
    isSubmitted: true
  });

  const submittedPanelistIds = submittedResolutions.map(r => r.panelist.toString());

  // Check if all active panelists have submitted
  const allSubmitted = activePanelistIds.every(id => submittedPanelistIds.includes(id));

  return {
    allSubmitted,
    total: activePanelistIds.length,
    submitted: submittedResolutions.length,
    pending: activePanelistIds.length - submittedResolutions.length,
    resolutions: submittedResolutions
  };
};

module.exports = mongoose.model('CaseResolution', CaseResolutionSchema);
