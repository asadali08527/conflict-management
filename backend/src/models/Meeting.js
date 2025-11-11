const mongoose = require('mongoose');

const MeetingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Meeting title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  case: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case',
    required: [true, 'Case reference is required']
  },
  scheduledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Scheduled by user is required']
  },
  scheduledByType: {
    type: String,
    enum: ['admin', 'panelist'],
    default: 'admin',
    comment: 'Type of user who scheduled the meeting'
  },
  panelistScheduler: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Panelist',
    default: null,
    comment: 'Reference to panelist if scheduled by panelist'
  },
  attendees: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      name: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true
      },
      phone: {
        type: String
      },
      role: {
        type: String,
        trim: true
      },
      isParty: {
        type: Boolean,
        default: false
      },
      status: {
        type: String,
        enum: ['invited', 'accepted', 'declined', 'tentative'],
        default: 'invited'
      }
    }
  ],
  scheduledDate: {
    type: Date,
    required: [true, 'Scheduled date is required']
  },
  duration: {
    type: Number, // Duration in minutes
    default: 60
  },
  meetingType: {
    type: String,
    enum: ['video', 'phone', 'in-person'],
    default: 'video'
  },
  meetingLink: {
    type: String, // For video calls (Zoom, Google Meet, etc.)
    trim: true
  },
  location: {
    type: String, // For in-person meetings
    trim: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
    default: 'scheduled'
  },
  notes: {
    type: String,
    trim: true
  },
  outcome: {
    type: String,
    trim: true
  },
  nextSteps: {
    type: String,
    trim: true
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

// Update the updatedAt field before saving
MeetingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Meeting', MeetingSchema);