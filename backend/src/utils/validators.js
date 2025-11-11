const Joi = require('joi');

// User registration validation schema
exports.registerSchema = Joi.object({
  firstName: Joi.string().required().trim().messages({
    'string.empty': 'First name is required',
    'any.required': 'First name is required',
  }),
  lastName: Joi.string().required().trim().messages({
    'string.empty': 'Last name is required',
    'any.required': 'Last name is required',
  }),
  email: Joi.string().email().required().trim().messages({
    'string.email': 'Please provide a valid email',
    'string.empty': 'Email is required',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'string.empty': 'Password is required',
    'any.required': 'Password is required',
  }),
  phone: Joi.string().required().trim().messages({
    'string.empty': 'Phone number is required',
    'any.required': 'Phone number is required',
  }),
  role: Joi.string().valid('client', 'admin').default('client'),
  address: Joi.object({
    street: Joi.string().allow(''),
    city: Joi.string().allow(''),
    state: Joi.string().allow(''),
    zipCode: Joi.string().allow(''),
    country: Joi.string().allow(''),
  }).optional(),
});

// User login validation schema
exports.loginSchema = Joi.object({
  email: Joi.string().email().required().trim().messages({
    'string.email': 'Please provide a valid email',
    'string.empty': 'Email is required',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
    'any.required': 'Password is required',
  }),
});

// Update profile validation schema
exports.updateProfileSchema = Joi.object({
  firstName: Joi.string().trim(),
  lastName: Joi.string().trim(),
  phone: Joi.string().trim(),
  address: Joi.object({
    street: Joi.string().allow(''),
    city: Joi.string().allow(''),
    state: Joi.string().allow(''),
    zipCode: Joi.string().allow(''),
    country: Joi.string().allow(''),
  }),
});

// Change password validation schema
exports.changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'string.empty': 'Current password is required',
    'any.required': 'Current password is required',
  }),
  newPassword: Joi.string().min(6).required().messages({
    'string.min': 'New password must be at least 6 characters',
    'string.empty': 'New password is required',
    'any.required': 'New password is required',
  }),
});

// Case creation validation schema
exports.createCaseSchema = Joi.object({
  title: Joi.string().required().trim().messages({
    'string.empty': 'Title is required',
    'any.required': 'Title is required',
  }),
  description: Joi.string().required().trim().messages({
    'string.empty': 'Description is required',
    'any.required': 'Description is required',
  }),
  type: Joi.string()
    .valid('marriage', 'divorce', 'custody', 'property', 'family')
    .required()
    .messages({
      'string.empty': 'Case type is required',
      'any.required': 'Case type is required',
      'any.only':
        'Case type must be one of: marriage, divorce, custody, property, family',
    }),
  parties: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        contact: Joi.string().required(),
        role: Joi.string().required(),
      })
    )
    .optional(),
});

// Update case status validation schema
exports.updateCaseStatusSchema = Joi.object({
  status: Joi.string()
    .valid('open', 'assigned', 'resolved', 'closed')
    .required()
    .messages({
      'string.empty': 'Status is required',
      'any.required': 'Status is required',
      'any.only': 'Status must be one of: open, assigned, resolved, closed',
    }),
});

// Case submission validation schemas
exports.step1Schema = Joi.object({
  stepId: Joi.number().valid(1).required(),
  sessionId: Joi.string().uuid().required(),
  caseOverview: Joi.object({
    conflictType: Joi.string()
      .valid(
        'Marital Conflict',
        'Divorce Proceedings',
        'Property Division',
        'Child Custody',
        'Financial Disputes',
        'Communication Issues',
        'Family Mediation',
        'Other'
      )
      .required(),
    description: Joi.string().min(10).max(1000).required(),
    urgencyLevel: Joi.string()
      .valid('low', 'medium', 'high', 'urgent')
      .required(),
    estimatedValue: Joi.string().optional(),
  }).required(),
});

exports.step2Schema = Joi.object({
  stepId: Joi.number().valid(2).required(),
  sessionId: Joi.string().uuid().required(),
  partiesInvolved: Joi.object({
    parties: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().min(2).max(100).required(),
          role: Joi.string()
            .valid(
              'Spouse/Partner',
              'Child',
              'Parent',
              'Legal Representative',
              'Mediator',
              'Counselor',
              'Other Family Member',
              'Other'
            )
            .required(),
          email: Joi.string().email().required(),
          phone: Joi.string().optional(),
          relationship: Joi.string()
            .valid(
              'Married Couple',
              'Ex-Spouses',
              'Parent-Child',
              'Siblings',
              'Extended Family',
              'Legal Advisors',
              'Professional Support',
              'Other'
            )
            .required(),
        })
      )
      .min(1)
      .required(),
  }).required(),
});

exports.step3Schema = Joi.object({
  stepId: Joi.number().valid(3).required(),
  sessionId: Joi.string().uuid().required(),
  conflictBackground: Joi.object({
    timeline: Joi.string().min(20).max(2000).required(),
    keyIssues: Joi.array()
      .items(Joi.string().min(5).max(200))
      .min(1)
      .max(10)
      .required(),
    previousAttempts: Joi.string().min(10).max(1000).required(),
    emotionalImpact: Joi.string().min(10).max(1000).required(),
  }).required(),
});

exports.step4Schema = Joi.object({
  stepId: Joi.number().valid(4).required(),
  sessionId: Joi.string().uuid().required(),
  desiredOutcomes: Joi.object({
    primaryGoals: Joi.array()
      .items(Joi.string().min(5).max(200))
      .min(1)
      .max(5)
      .required(),
    successMetrics: Joi.string().min(10).max(500).required(),
    constraints: Joi.string().min(10).max(500).required(),
    timeline: Joi.string().min(5).max(200).required(),
  }).required(),
});

exports.step5Schema = Joi.object({
  stepId: Joi.number().valid(5).required(),
  sessionId: Joi.string().uuid().required(),
  schedulingPreferences: Joi.object({
    availability: Joi.array().items(Joi.string()).min(1).required(),
    preferredLocation: Joi.string()
      .valid('online', 'in-person', 'hybrid')
      .required(),
    timeZone: Joi.string().required(),
    communicationPreference: Joi.string()
      .valid('email', 'phone', 'text', 'app')
      .required(),
  }).required(),
});

exports.step6Schema = Joi.object({
  stepId: Joi.number().valid(6).required(),
  sessionId: Joi.string().uuid().required(),
  descriptions: Joi.array().items(Joi.string()).optional(),
});

exports.finalSubmissionSchema = Joi.object({
  sessionId: Joi.string().uuid().required(),
  submittedAt: Joi.date().iso().optional(),
  submitterUserId: Joi.string().optional(),
});

exports.createSessionSchema = Joi.object({
  userId: Joi.string().optional(),
  startedAt: Joi.date().iso().optional(),
});

exports.updateSessionSchema = Joi.object({
  currentStep: Joi.number().min(1).max(6).optional(),
});

exports.joinCaseSchema = Joi.object({
  parentSessionId: Joi.string().uuid().required().messages({
    'string.empty': 'Parent session ID is required',
    'any.required': 'Parent session ID is required',
    'string.guid': 'Invalid session ID format',
  }),
  userId: Joi.string().optional(),
});

// Panelist creation validation schema
exports.createPanelistSchema = Joi.object({
  name: Joi.string().required().trim().messages({
    'string.empty': 'Name is required',
    'any.required': 'Name is required',
  }),
  age: Joi.number().integer().min(18).max(100).required().messages({
    'number.base': 'Age must be a number',
    'number.min': 'Age must be at least 18',
    'number.max': 'Age must be less than 100',
    'any.required': 'Age is required',
  }),
  image: Joi.object({
    url: Joi.string().uri().allow(null, ''),
    key: Joi.string().allow(null, ''),
  }).optional(),
  occupation: Joi.string().required().trim().messages({
    'string.empty': 'Occupation is required',
    'any.required': 'Occupation is required',
  }),
  education: Joi.object({
    degree: Joi.string().required().trim().messages({
      'string.empty': 'Degree is required',
      'any.required': 'Degree is required',
    }),
    institution: Joi.string().required().trim().messages({
      'string.empty': 'Institution is required',
      'any.required': 'Institution is required',
    }),
    yearCompleted: Joi.number()
      .integer()
      .min(1950)
      .max(new Date().getFullYear())
      .optional(),
  }).required(),
  specializations: Joi.array()
    .items(
      Joi.string().valid(
        'marriage',
        'land',
        'property',
        'family',
        'divorce',
        'custody',
        'financial',
        'general'
      )
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one specialization is required',
      'any.required': 'Specializations are required',
    }),
  experience: Joi.object({
    years: Joi.number().integer().min(0).max(70).required().messages({
      'number.min': 'Experience years cannot be negative',
      'number.max': 'Experience years seems unrealistic',
      'any.required': 'Years of experience is required',
    }),
    description: Joi.string().max(1000).trim().optional(),
  }).required(),
  contactInfo: Joi.object({
    email: Joi.string().email().required().trim().messages({
      'string.email': 'Please provide a valid email',
      'string.empty': 'Email is required',
      'any.required': 'Email is required',
    }),
    phone: Joi.string().required().trim().messages({
      'string.empty': 'Phone number is required',
      'any.required': 'Phone number is required',
    }),
    alternatePhone: Joi.string().trim().optional(),
  }).required(),
  availability: Joi.object({
    status: Joi.string().valid('available', 'busy', 'unavailable').optional(),
    maxCases: Joi.number().integer().min(1).max(50).optional(),
    currentCaseLoad: Joi.number().integer().min(0).optional(),
  }).optional(),
  address: Joi.object({
    street: Joi.string().allow(''),
    city: Joi.string().allow(''),
    state: Joi.string().allow(''),
    zipCode: Joi.string().allow(''),
    country: Joi.string().allow(''),
  }).optional(),
  bio: Joi.string().max(2000).trim().optional(),
  certifications: Joi.array()
    .items(
      Joi.object({
        name: Joi.string(),
        issuingOrganization: Joi.string(),
        issueDate: Joi.date(),
        expiryDate: Joi.date(),
      })
    )
    .optional(),
  languages: Joi.array().items(Joi.string().trim()).optional(),
  notes: Joi.string().max(1000).trim().optional(),
});

// Panelist update validation schema
exports.updatePanelistSchema = Joi.object({
  name: Joi.string().trim(),
  age: Joi.number().integer().min(18).max(100),
  image: Joi.object({
    url: Joi.string().uri().allow(null, ''),
    key: Joi.string().allow(null, ''),
  }),
  occupation: Joi.string().trim(),
  education: Joi.object({
    degree: Joi.string().trim(),
    institution: Joi.string().trim(),
    yearCompleted: Joi.number()
      .integer()
      .min(1950)
      .max(new Date().getFullYear()),
  }),
  specializations: Joi.array()
    .items(
      Joi.string().valid(
        'marriage',
        'land',
        'property',
        'family',
        'divorce',
        'custody',
        'financial',
        'general'
      )
    )
    .min(1),
  experience: Joi.object({
    years: Joi.number().integer().min(0).max(70),
    description: Joi.string().max(1000).trim(),
  }),
  contactInfo: Joi.object({
    email: Joi.string().email().trim(),
    phone: Joi.string().trim(),
    alternatePhone: Joi.string().trim(),
  }),
  availability: Joi.object({
    status: Joi.string().valid('available', 'busy', 'unavailable'),
    maxCases: Joi.number().integer().min(1).max(50),
    currentCaseLoad: Joi.number().integer().min(0),
  }),
  address: Joi.object({
    street: Joi.string().allow(''),
    city: Joi.string().allow(''),
    state: Joi.string().allow(''),
    zipCode: Joi.string().allow(''),
    country: Joi.string().allow(''),
  }),
  bio: Joi.string().max(2000).trim(),
  certifications: Joi.array().items(
    Joi.object({
      name: Joi.string(),
      issuingOrganization: Joi.string(),
      issueDate: Joi.date(),
      expiryDate: Joi.date(),
    })
  ),
  languages: Joi.array().items(Joi.string().trim()),
  isActive: Joi.boolean(),
  notes: Joi.string().max(1000).trim(),
}).min(1);

// Assign panel to case validation schema
exports.assignPanelSchema = Joi.object({
  panelistIds: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one panelist ID is required',
      'any.required': 'Panelist IDs are required',
      'string.pattern.base': 'Invalid panelist ID format',
    }),
});

// ==================== Panelist Validation Schemas ====================

// Panelist login validation schema
exports.panelistLoginSchema = Joi.object({
  email: Joi.string().email().required().trim().messages({
    'string.email': 'Please provide a valid email',
    'string.empty': 'Email is required',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
    'any.required': 'Password is required',
  }),
});

// Add case note validation schema
exports.addCaseNoteSchema = Joi.object({
  content: Joi.string().required().trim().max(2000).messages({
    'string.empty': 'Note content is required',
    'any.required': 'Note content is required',
    'string.max': 'Note content cannot exceed 2000 characters',
  }),
  noteType: Joi.string()
    .valid('general', 'progress', 'internal')
    .default('progress'),
});

// Upload case document validation schema
exports.uploadCaseDocumentSchema = Joi.object({
  name: Joi.string().required().trim().messages({
    'string.empty': 'Document name is required',
    'any.required': 'Document name is required',
  }),
  url: Joi.string().uri().required().messages({
    'string.empty': 'Document URL is required',
    'any.required': 'Document URL is required',
    'string.uri': 'Please provide a valid URL',
  }),
  key: Joi.string().trim(),
  size: Joi.number().integer().positive(),
  mimetype: Joi.string().trim(),
});

// Submit resolution validation schema
exports.submitResolutionSchema = Joi.object({
  resolutionStatus: Joi.string()
    .valid('resolved', 'no_outcome')
    .required()
    .messages({
      'string.empty': 'Resolution status is required',
      'any.required': 'Resolution status is required',
      'any.only': 'Resolution status must be either resolved or no_outcome',
    }),
  resolutionNotes: Joi.string().required().trim().max(5000).messages({
    'string.empty': 'Resolution notes are required',
    'any.required': 'Resolution notes are required',
    'string.max': 'Resolution notes cannot exceed 5000 characters',
  }),
  outcome: Joi.string().trim().max(2000).allow('').messages({
    'string.max': 'Outcome description cannot exceed 2000 characters',
  }),
  recommendations: Joi.string().trim().max(2000).allow('').messages({
    'string.max': 'Recommendations cannot exceed 2000 characters',
  }),
});

// Update resolution validation schema
exports.updateResolutionSchema = Joi.object({
  resolutionStatus: Joi.string().valid('resolved', 'no_outcome', 'pending'),
  resolutionNotes: Joi.string().trim().max(5000).messages({
    'string.max': 'Resolution notes cannot exceed 5000 characters',
  }),
  outcome: Joi.string().trim().max(2000).allow('').messages({
    'string.max': 'Outcome description cannot exceed 2000 characters',
  }),
  recommendations: Joi.string().trim().max(2000).allow('').messages({
    'string.max': 'Recommendations cannot exceed 2000 characters',
  }),
}).min(1);

// Schedule meeting validation schema
exports.scheduleMeetingSchema = Joi.object({
  title: Joi.string().required().trim().messages({
    'string.empty': 'Meeting title is required',
    'any.required': 'Meeting title is required',
  }),
  description: Joi.string().trim().allow(''),
  caseId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.empty': 'Case ID is required',
      'any.required': 'Case ID is required',
      'string.pattern.base': 'Invalid case ID format',
    }),
  attendees: Joi.array()
    .items(
      Joi.object({
        user: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        phone: Joi.string(),
        role: Joi.string(),
        isParty: Joi.boolean().default(false),
        status: Joi.string()
          .valid('invited', 'accepted', 'declined', 'tentative')
          .default('invited'),
      })
    )
    .default([]),
  scheduledDate: Joi.date().required().messages({
    'date.base': 'Please provide a valid date',
    'any.required': 'Scheduled date is required',
  }),
  duration: Joi.number().integer().positive().default(60),
  meetingType: Joi.string()
    .valid('video', 'phone', 'in-person')
    .default('video'),
  meetingLink: Joi.string().uri().allow(''),
  location: Joi.string().trim().allow(''),
});

// Update meeting validation schema
exports.updateMeetingSchema = Joi.object({
  title: Joi.string().trim(),
  description: Joi.string().trim().allow(''),
  attendees: Joi.array().items(
    Joi.object({
      user: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      phone: Joi.string(),
      role: Joi.string(),
      isParty: Joi.boolean(),
      status: Joi.string().valid(
        'invited',
        'accepted',
        'declined',
        'tentative'
      ),
    })
  ),
  scheduledDate: Joi.date(),
  duration: Joi.number().integer().positive(),
  meetingType: Joi.string().valid('video', 'phone', 'in-person'),
  meetingLink: Joi.string().uri().allow(''),
  location: Joi.string().trim().allow(''),
  status: Joi.string().valid(
    'scheduled',
    'completed',
    'cancelled',
    'rescheduled'
  ),
}).min(1);

// Add meeting notes validation schema
exports.addMeetingNotesSchema = Joi.object({
  notes: Joi.string().trim().allow(''),
  outcome: Joi.string().trim().allow(''),
  nextSteps: Joi.string().trim().allow(''),
}).min(1);

// Send message validation schema
exports.sendMessageSchema = Joi.object({
  caseId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.empty': 'Case ID is required',
      'any.required': 'Case ID is required',
      'string.pattern.base': 'Invalid case ID format',
    }),
  subject: Joi.string().trim().max(200).allow('').messages({
    'string.max': 'Subject cannot exceed 200 characters',
  }),
  content: Joi.string().required().trim().max(5000).messages({
    'string.empty': 'Message content is required',
    'any.required': 'Message content is required',
    'string.max': 'Message content cannot exceed 5000 characters',
  }),
  recipients: Joi.array()
    .items(
      Joi.object({
        recipientType: Joi.string()
          .valid('party', 'panelist', 'admin', 'all_parties')
          .required(),
        userId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
        panelistId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
        name: Joi.string().required(),
        email: Joi.string().email(),
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one recipient is required',
      'any.required': 'Recipients are required',
    }),
  messageType: Joi.string()
    .valid(
      'general',
      'meeting_notification',
      'case_update',
      'resolution_request'
    )
    .default('general'),
  priority: Joi.string()
    .valid('low', 'normal', 'high', 'urgent')
    .default('normal'),
  attachments: Joi.array()
    .items(
      Joi.object({
        name: Joi.string(),
        url: Joi.string().uri(),
        key: Joi.string(),
        size: Joi.number(),
        mimetype: Joi.string(),
      })
    )
    .default([]),
});

// Update availability validation schema
exports.updateAvailabilitySchema = Joi.object({
  status: Joi.string().valid('available', 'busy', 'unavailable'),
  maxCases: Joi.number().integer().min(1).max(50),
})
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided',
  });

// Update profile picture validation schema
exports.updateProfilePictureSchema = Joi.object({
  url: Joi.string().uri().required().messages({
    'string.empty': 'Image URL is required',
    'any.required': 'Image URL is required',
    'string.uri': 'Please provide a valid URL',
  }),
  key: Joi.string().trim(),
});

// Create panelist account validation schema (for admin)
exports.createPanelistAccountSchema = Joi.object({
  email: Joi.string().email().required().trim().messages({
    'string.email': 'Please provide a valid email',
    'string.empty': 'Email is required',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'string.empty': 'Password is required',
    'any.required': 'Password is required',
  }),
  firstName: Joi.string().required().trim().messages({
    'string.empty': 'First name is required',
    'any.required': 'First name is required',
  }),
  lastName: Joi.string().required().trim().messages({
    'string.empty': 'Last name is required',
    'any.required': 'Last name is required',
  }),
  phone: Joi.string().required().trim().messages({
    'string.empty': 'Phone number is required',
    'any.required': 'Phone number is required',
  }),
});

// ==================== File Upload Validation Schemas ====================

// Allowed file types with their MIME types and max sizes
const FILE_TYPES = {
  image: {
    mimes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
  document: {
    mimes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ],
    extensions: ['.pdf', '.doc', '.docx', '.txt'],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  spreadsheet: {
    mimes: [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
    ],
    extensions: ['.xls', '.xlsx', '.csv'],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  presentation: {
    mimes: [
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ],
    extensions: ['.ppt', '.pptx'],
    maxSize: 15 * 1024 * 1024, // 15MB
  },
};

// Upload contexts and their file type restrictions
const UPLOAD_CONTEXTS = {
  profile: {
    allowedTypes: ['image'],
    maxSize: 5 * 1024 * 1024,
    maxFiles: 1,
  },
  case: {
    allowedTypes: ['image', 'document', 'spreadsheet', 'presentation'],
    maxSize: 10 * 1024 * 1024,
    maxFiles: 10,
  },
  message: {
    allowedTypes: ['image', 'document', 'spreadsheet'],
    maxSize: 10 * 1024 * 1024,
    maxFiles: 5,
  },
  resolution: {
    allowedTypes: ['document', 'spreadsheet'],
    maxSize: 10 * 1024 * 1024,
    maxFiles: 5,
  },
};

// Generate presigned upload URL validation schema
exports.generateUploadUrlSchema = Joi.object({
  fileName: Joi.string().required().trim().max(255).messages({
    'string.empty': 'File name is required',
    'any.required': 'File name is required',
    'string.max': 'File name is too long',
  }),
  fileType: Joi.string().required().messages({
    'string.empty': 'File type (MIME type) is required',
    'any.required': 'File type is required',
  }),
  fileSize: Joi.number().integer().positive().required().messages({
    'number.base': 'File size must be a number',
    'number.positive': 'File size must be positive',
    'any.required': 'File size is required',
  }),
  uploadContext: Joi.string()
    .valid('profile', 'case', 'message', 'resolution')
    .required()
    .messages({
      'string.empty': 'Upload context is required',
      'any.required': 'Upload context is required',
      'any.only': 'Invalid upload context',
    }),
  sessionId: Joi.string().optional(),
  caseId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
});

// Save file record validation schema
exports.saveFileRecordSchema = Joi.object({
  fileKey: Joi.string().required().trim().messages({
    'string.empty': 'File key is required',
    'any.required': 'File key is required',
  }),
  fileName: Joi.string().required().trim().max(255).messages({
    'string.empty': 'File name is required',
    'any.required': 'File name is required',
    'string.max': 'File name is too long',
  }),
  fileSize: Joi.number().integer().positive().required().messages({
    'number.base': 'File size must be a number',
    'number.positive': 'File size must be positive',
    'any.required': 'File size is required',
  }),
  fileType: Joi.string().required().messages({
    'string.empty': 'File type is required',
    'any.required': 'File type is required',
  }),
  uploadContext: Joi.string()
    .valid('profile', 'case', 'message', 'resolution')
    .required()
    .messages({
      'any.required': 'Upload context is required',
      'any.only': 'Invalid upload context',
    }),
  sessionId: Joi.string().optional(),
  caseId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  description: Joi.string().trim().max(500).allow('').optional(),
});

//  Validate file type against allowed types for context

/**
 * Validate file type against allowed types for context
 */
exports.validateFileType = (fileType, fileName, uploadContext) => {
  console.log('🔍 validateFileType called with:', {
    fileType,
    fileName,
    uploadContext,
  });

  const context = UPLOAD_CONTEXTS[uploadContext];
  if (!context) {
    return { valid: false, error: 'Invalid upload context' };
  }

  // Check file extension
  const fileExtension = fileName
    .substring(fileName.lastIndexOf('.'))
    .toLowerCase();

  // Normalize MIME type to lowercase
  const normalizedMimeType = fileType.toLowerCase().trim();

  // Check if file type is allowed for this context
  let typeAllowed = false;
  let matchedCategory = null;

  for (const category of context.allowedTypes) {
    const typeConfig = FILE_TYPES[category];

    // Check if MIME type is allowed AND extension is allowed
    const mimeMatches = typeConfig.mimes.includes(normalizedMimeType);
    const extensionMatches = typeConfig.extensions.includes(fileExtension);

    if (mimeMatches && extensionMatches) {
      typeAllowed = true;
      matchedCategory = category;
      break;
    }
  }

  if (!typeAllowed) {
    const allowedExtensions = context.allowedTypes
      .flatMap((cat) => FILE_TYPES[cat].extensions)
      .join(', ');

    return {
      valid: false,
      error: `File type not allowed for ${uploadContext}. Allowed types: ${allowedExtensions}`,
    };
  }

  return { valid: true, category: matchedCategory };
};

/**
 * Validate file size against limits
 */
exports.validateFileSize = (fileSize, uploadContext, fileCategory) => {
  const context = UPLOAD_CONTEXTS[uploadContext];
  if (!context) {
    return { valid: false, error: 'Invalid upload context' };
  }

  // Check context max size
  if (fileSize > context.maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${
        context.maxSize / (1024 * 1024)
      }MB for ${uploadContext}`,
    };
  }

  // Check file type specific max size
  if (fileCategory && FILE_TYPES[fileCategory]) {
    const categoryMaxSize = FILE_TYPES[fileCategory].maxSize;
    if (fileSize > categoryMaxSize) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed size of ${
          categoryMaxSize / (1024 * 1024)
        }MB for ${fileCategory} files`,
      };
    }
  }

  return { valid: true };
};

/**
 * Sanitize filename to prevent path traversal and injection attacks
 */
/**
 * Sanitize filename to prevent path traversal and injection attacks
 */
exports.sanitizeFileName = (fileName) => {
  // Remove path separators and parent directory references (but keep the file extension dot)
  let sanitized = fileName.replace(/[\/\\]/g, ''); // Remove slashes only
  sanitized = sanitized.replace(/\.\./g, ''); // Remove parent directory references (..)

  // Remove potentially dangerous characters
  sanitized = sanitized.replace(/[&;$%@"'<>()\|`]/g, '');

  // Limit length
  if (sanitized.length > 255) {
    const ext = sanitized.substring(sanitized.lastIndexOf('.'));
    sanitized = sanitized.substring(0, 255 - ext.length) + ext;
  }

  // Ensure filename isn't empty after sanitization
  if (!sanitized || sanitized.trim().length === 0) {
    sanitized = 'file_' + Date.now();
  }

  return sanitized.trim();
};

// Export file type configurations for reference
exports.FILE_TYPES = FILE_TYPES;
exports.UPLOAD_CONTEXTS = UPLOAD_CONTEXTS;
