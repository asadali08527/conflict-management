const mongoose = require('mongoose');

const CaseActivitySchema = new mongoose.Schema({
  case: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case',
    required: [true, 'Case reference is required']
  },
  activityType: {
    type: String,
    enum: [
      'case_created',
      'case_assigned',
      'panel_assigned',
      'panelist_added',
      'panelist_removed',
      'status_changed',
      'note_added',
      'document_uploaded',
      'document_deleted',
      'meeting_scheduled',
      'meeting_updated',
      'meeting_cancelled',
      'meeting_completed',
      'message_sent',
      'resolution_submitted',
      'resolution_updated',
      'case_resolved',
      'case_closed',
      'party_joined',
      'priority_changed'
    ],
    required: [true, 'Activity type is required']
  },
  performedBy: {
    userType: {
      type: String,
      enum: ['admin', 'panelist', 'client', 'system'],
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    panelistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Panelist',
      default: null
    },
    name: {
      type: String,
      required: true
    }
  },
  description: {
    type: String,
    required: [true, 'Activity description is required'],
    trim: true,
    maxlength: [1000, 'Activity description cannot exceed 1000 characters']
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
    comment: 'Additional data related to the activity (e.g., old/new status, document name, etc.)'
  },
  relatedModel: {
    modelType: {
      type: String,
      enum: ['Meeting', 'Message', 'CaseResolution', 'Document', 'Note', 'Panelist', 'User'],
      default: null
    },
    modelId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    }
  },
  isImportant: {
    type: Boolean,
    default: false,
    comment: 'Mark important activities for highlighting in timeline'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for efficient queries
CaseActivitySchema.index({ case: 1, createdAt: -1 });
CaseActivitySchema.index({ 'performedBy.userId': 1 });
CaseActivitySchema.index({ activityType: 1 });
CaseActivitySchema.index({ isImportant: 1 });

// Static method to create activity log
CaseActivitySchema.statics.logActivity = async function(activityData) {
  try {
    const activity = await this.create(activityData);
    return activity;
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw error to prevent activity logging from breaking main operations
    return null;
  }
};

// Static method to get case timeline
CaseActivitySchema.statics.getCaseTimeline = async function(caseId, options = {}) {
  const {
    page = 1,
    limit = 50,
    activityType = null,
    startDate = null,
    endDate = null
  } = options;

  const filter = { case: caseId };

  if (activityType) {
    filter.activityType = activityType;
  }

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const skip = (page - 1) * limit;

  const activities = await this.find(filter)
    .populate('performedBy.userId', 'firstName lastName email')
    .populate('performedBy.panelistId', 'name occupation')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await this.countDocuments(filter);

  return {
    activities,
    pagination: {
      current: page,
      pages: Math.ceil(total / limit),
      total,
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  };
};

module.exports = mongoose.model('CaseActivity', CaseActivitySchema);
