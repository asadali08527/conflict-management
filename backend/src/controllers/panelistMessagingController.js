const Message = require('../models/Message');
const Case = require('../models/Case');
const Panelist = require('../models/Panelist');
const CaseActivity = require('../models/CaseActivity');

/**
 * @desc    Get messages for panelist
 * @route   GET /api/panelist/messages
 * @access  Private (Panelist only)
 */
exports.getMessages = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      caseId,
      unreadOnly,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter = {
      'recipients.userId': req.user._id,
      isDeleted: false
    };

    if (caseId) {
      filter.case = caseId;
    }

    if (unreadOnly === 'true') {
      filter['recipients.isRead'] = false;
    }

    // Calculate skip
    const skip = (page - 1) * limit;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const messages = await Message.find(filter)
      .populate('case', 'title caseId type')
      .populate('sender.userId', 'firstName lastName email')
      .populate('sender.panelistId', 'name occupation')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Message.countDocuments(filter);

    // Get unread count
    const unreadCount = await Message.countDocuments({
      'recipients.userId': req.user._id,
      'recipients.isRead': false,
      isDeleted: false
    });

    res.status(200).json({
      status: 'success',
      data: {
        messages,
        unreadCount,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Get messages for a specific case
 * @route   GET /api/panelist/messages/cases/:caseId
 * @access  Private (Panelist only)
 */
exports.getCaseMessages = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const panelistId = req.user.panelistProfile;

    if (!panelistId) {
      return res.status(400).json({
        status: 'error',
        message: 'Panelist profile not found'
      });
    }

    // Check if panelist has access to this case
    const caseItem = await Case.findById(caseId).select('assignedPanelists');

    if (!caseItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Case not found'
      });
    }

    const isAssigned = caseItem.assignedPanelists.some(
      ap => ap.panelist.toString() === panelistId.toString() && ap.status === 'active'
    );

    if (!isAssigned) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to view messages for this case'
      });
    }

    // Get messages for this case
    const skip = (page - 1) * limit;

    const messages = await Message.find({
      case: caseId,
      isDeleted: false
    })
      .populate('sender.userId', 'firstName lastName email')
      .populate('sender.panelistId', 'name occupation')
      .populate('recipients.userId', 'firstName lastName email')
      .populate('recipients.panelistId', 'name occupation')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Message.countDocuments({
      case: caseId,
      isDeleted: false
    });

    res.status(200).json({
      status: 'success',
      data: {
        messages,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get case messages error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Send message to parties
 * @route   POST /api/panelist/messages/send
 * @access  Private (Panelist only)
 */
exports.sendMessage = async (req, res) => {
  try {
    const { caseId, subject, content, recipients, messageType, priority, attachments } = req.body;
    const panelistId = req.user.panelistProfile;

    if (!panelistId) {
      return res.status(400).json({
        status: 'error',
        message: 'Panelist profile not found'
      });
    }

    // Validation
    if (!caseId || !content) {
      return res.status(400).json({
        status: 'error',
        message: 'Case ID and message content are required'
      });
    }

    if (!recipients || recipients.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'At least one recipient is required'
      });
    }

    // Check if panelist has access to this case
    const caseItem = await Case.findById(caseId)
      .populate('createdBy', 'firstName lastName email')
      .populate('assignedPanelists.panelist', 'name occupation contactInfo');

    if (!caseItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Case not found'
      });
    }

    const isAssigned = caseItem.assignedPanelists.some(
      ap => ap.panelist._id.toString() === panelistId.toString() && ap.status === 'active'
    );

    if (!isAssigned) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to send messages for this case'
      });
    }

    const panelist = await Panelist.findById(panelistId);

    // Process recipients
    const processedRecipients = [];

    for (const recipient of recipients) {
      if (recipient.recipientType === 'all_parties') {
        // Add all parties from the case
        for (const party of caseItem.parties) {
          processedRecipients.push({
            recipientType: 'party',
            userId: null,
            panelistId: null,
            name: party.name,
            email: party.contact,
            isRead: false
          });
        }
      } else {
        processedRecipients.push({
          recipientType: recipient.recipientType,
          userId: recipient.userId || null,
          panelistId: recipient.panelistId || null,
          name: recipient.name,
          email: recipient.email,
          isRead: false
        });
      }
    }

    // Create message
    const message = await Message.create({
      case: caseId,
      sender: {
        userType: 'panelist',
        userId: req.user._id,
        panelistId: panelistId,
        name: panelist.name
      },
      recipients: processedRecipients,
      subject,
      content,
      messageType: messageType || 'general',
      priority: priority || 'normal',
      attachments: attachments || []
    });

    // Log activity
    await CaseActivity.logActivity({
      case: caseId,
      activityType: 'message_sent',
      performedBy: {
        userType: 'panelist',
        userId: req.user._id,
        panelistId: panelistId,
        name: panelist.name
      },
      description: `${panelist.name} sent a message: ${subject || 'No subject'}`,
      metadata: {
        messageId: message._id,
        recipientCount: processedRecipients.length
      },
      relatedModel: {
        modelType: 'Message',
        modelId: message._id
      }
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('case', 'title caseId type')
      .populate('sender.userId', 'firstName lastName email')
      .populate('sender.panelistId', 'name occupation');

    res.status(201).json({
      status: 'success',
      message: 'Message sent successfully',
      data: {
        message: populatedMessage
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Mark message as read
 * @route   PATCH /api/panelist/messages/:messageId/read
 * @access  Private (Panelist only)
 */
exports.markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        status: 'error',
        message: 'Message not found'
      });
    }

    // Find recipient and mark as read
    const recipient = message.recipients.find(
      r => r.userId && r.userId.toString() === req.user._id.toString()
    );

    if (!recipient) {
      return res.status(404).json({
        status: 'error',
        message: 'You are not a recipient of this message'
      });
    }

    if (!recipient.isRead) {
      recipient.isRead = true;
      recipient.readAt = Date.now();
      message.updatedAt = Date.now();
      await message.save();
    }

    res.status(200).json({
      status: 'success',
      message: 'Message marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Get unread message count
 * @route   GET /api/panelist/messages/unread-count
 * @access  Private (Panelist only)
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Message.getUnreadCount(req.user._id);

    res.status(200).json({
      status: 'success',
      data: {
        unreadCount
      }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Delete message (soft delete)
 * @route   DELETE /api/panelist/messages/:messageId
 * @access  Private (Panelist only)
 */
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        status: 'error',
        message: 'Message not found'
      });
    }

    // Only sender can delete message
    if (message.sender.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only delete messages you sent'
      });
    }

    message.isDeleted = true;
    message.updatedAt = Date.now();
    await message.save();

    res.status(200).json({
      status: 'success',
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};
