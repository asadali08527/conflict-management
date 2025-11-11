const mongoose = require('mongoose');

const PanelistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    comment: 'Reference to User model for authentication'
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [18, 'Age must be at least 18'],
    max: [100, 'Age must be less than 100']
  },
  image: {
    url: {
      type: String,
      default: null,
      comment: 'S3 URL for panelist profile image'
    },
    key: {
      type: String,
      default: null,
      comment: 'S3 object key for image management'
    }
  },
  occupation: {
    type: String,
    required: [true, 'Occupation is required'],
    trim: true
  },
  education: {
    degree: {
      type: String,
      required: [true, 'Education degree is required'],
      trim: true
    },
    institution: {
      type: String,
      required: [true, 'Institution name is required'],
      trim: true
    },
    yearCompleted: {
      type: Number,
      min: 1950,
      max: new Date().getFullYear()
    }
  },
  specializations: [
    {
      type: String,
      enum: ['marriage', 'land', 'property', 'family', 'divorce', 'custody', 'financial', 'general'],
      required: true
    }
  ],
  experience: {
    years: {
      type: Number,
      required: [true, 'Years of experience is required'],
      min: [0, 'Experience cannot be negative'],
      max: [70, 'Experience years seems unrealistic']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Experience description cannot exceed 1000 characters']
    }
  },
  contactInfo: {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    alternatePhone: {
      type: String,
      trim: true
    }
  },
  availability: {
    status: {
      type: String,
      enum: ['available', 'busy', 'unavailable'],
      default: 'available'
    },
    maxCases: {
      type: Number,
      default: 5,
      min: [1, 'Max cases must be at least 1'],
      max: [50, 'Max cases cannot exceed 50']
    },
    currentCaseLoad: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  bio: {
    type: String,
    maxlength: [2000, 'Bio cannot exceed 2000 characters'],
    trim: true
  },
  certifications: [
    {
      name: String,
      issuingOrganization: String,
      issueDate: Date,
      expiryDate: Date
    }
  ],
  languages: [
    {
      type: String,
      trim: true
    }
  ],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  statistics: {
    totalCasesHandled: {
      type: Number,
      default: 0,
      min: 0
    },
    casesResolved: {
      type: Number,
      default: 0,
      min: 0
    },
    averageResolutionTime: {
      type: Number,
      default: 0,
      comment: 'In days'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters'],
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
PanelistSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
PanelistSchema.index({ 'contactInfo.email': 1 });
PanelistSchema.index({ specializations: 1 });
PanelistSchema.index({ 'availability.status': 1 });
PanelistSchema.index({ isActive: 1 });

// Virtual for full availability check
PanelistSchema.virtual('isAvailableForNewCase').get(function() {
  return (
    this.isActive &&
    this.availability.status === 'available' &&
    this.availability.currentCaseLoad < this.availability.maxCases
  );
});

// Method to increment case load
PanelistSchema.methods.incrementCaseLoad = async function() {
  this.availability.currentCaseLoad += 1;
  if (this.availability.currentCaseLoad >= this.availability.maxCases) {
    this.availability.status = 'busy';
  }
  return this.save();
};

// Method to decrement case load
PanelistSchema.methods.decrementCaseLoad = async function() {
  if (this.availability.currentCaseLoad > 0) {
    this.availability.currentCaseLoad -= 1;
    if (this.availability.currentCaseLoad < this.availability.maxCases) {
      this.availability.status = 'available';
    }
  }
  return this.save();
};

module.exports = mongoose.model('Panelist', PanelistSchema);
