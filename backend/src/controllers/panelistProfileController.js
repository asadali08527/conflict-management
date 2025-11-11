const User = require('../models/User');
const Panelist = require('../models/Panelist');
const CaseActivity = require('../models/CaseActivity');

/**
 * @desc    Get panelist profile
 * @route   GET /api/panelist/profile
 * @access  Private (Panelist only)
 */
exports.getProfile = async (req, res) => {
  try {
    const panelistId = req.user.panelistProfile;

    if (!panelistId) {
      return res.status(400).json({
        status: 'error',
        message: 'Panelist profile not found'
      });
    }

    const panelist = await Panelist.findById(panelistId);
    const user = await User.findById(req.user._id);

    if (!panelist) {
      return res.status(404).json({
        status: 'error',
        message: 'Panelist not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          profilePicture: user.profilePicture,
          address: user.address
        },
        panelist: {
          id: panelist._id,
          name: panelist.name,
          age: panelist.age,
          image: panelist.image,
          occupation: panelist.occupation,
          education: panelist.education,
          specializations: panelist.specializations,
          experience: panelist.experience,
          contactInfo: panelist.contactInfo,
          availability: panelist.availability,
          address: panelist.address,
          bio: panelist.bio,
          certifications: panelist.certifications,
          languages: panelist.languages,
          rating: panelist.rating,
          statistics: panelist.statistics,
          isActive: panelist.isActive,
          createdAt: panelist.createdAt,
          updatedAt: panelist.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Update panelist profile
 * @route   PATCH /api/panelist/profile
 * @access  Private (Panelist only)
 */
exports.updateProfile = async (req, res) => {
  try {
    const panelistId = req.user.panelistProfile;

    if (!panelistId) {
      return res.status(400).json({
        status: 'error',
        message: 'Panelist profile not found'
      });
    }

    const updateData = req.body;

    // Remove fields that shouldn't be updated by panelist
    delete updateData.userId;
    delete updateData.rating;
    delete updateData.statistics;
    delete updateData.isActive;
    delete updateData.createdAt;
    delete updateData._id;
    delete updateData.contactInfo?.email; // Email managed through user account

    // Update panelist profile
    const panelist = await Panelist.findByIdAndUpdate(
      panelistId,
      { ...updateData, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!panelist) {
      return res.status(404).json({
        status: 'error',
        message: 'Panelist not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        panelist
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Update availability settings
 * @route   PATCH /api/panelist/profile/availability
 * @access  Private (Panelist only)
 */
exports.updateAvailability = async (req, res) => {
  try {
    const panelistId = req.user.panelistProfile;
    const { status, maxCases } = req.body;

    if (!panelistId) {
      return res.status(400).json({
        status: 'error',
        message: 'Panelist profile not found'
      });
    }

    const panelist = await Panelist.findById(panelistId);

    if (!panelist) {
      return res.status(404).json({
        status: 'error',
        message: 'Panelist not found'
      });
    }

    // Update availability fields
    if (status && ['available', 'busy', 'unavailable'].includes(status)) {
      panelist.availability.status = status;
    }

    if (maxCases !== undefined) {
      if (maxCases < panelist.availability.currentCaseLoad) {
        return res.status(400).json({
          status: 'error',
          message: `Cannot set max cases below current case load (${panelist.availability.currentCaseLoad})`
        });
      }

      panelist.availability.maxCases = maxCases;

      // Update status based on new max cases
      if (panelist.availability.currentCaseLoad >= maxCases) {
        panelist.availability.status = 'busy';
      } else if (panelist.availability.status === 'busy' && panelist.availability.currentCaseLoad < maxCases) {
        panelist.availability.status = 'available';
      }
    }

    panelist.updatedAt = Date.now();
    await panelist.save();

    res.status(200).json({
      status: 'success',
      message: 'Availability updated successfully',
      data: {
        availability: panelist.availability
      }
    });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Update profile picture
 * @route   PATCH /api/panelist/profile/profile-picture
 * @access  Private (Panelist only)
 */
exports.updateProfilePicture = async (req, res) => {
  try {
    const panelistId = req.user.panelistProfile;
    const { url, key } = req.body;

    if (!panelistId) {
      return res.status(400).json({
        status: 'error',
        message: 'Panelist profile not found'
      });
    }

    if (!url) {
      return res.status(400).json({
        status: 'error',
        message: 'Image URL is required'
      });
    }

    const panelist = await Panelist.findByIdAndUpdate(
      panelistId,
      {
        image: { url, key },
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!panelist) {
      return res.status(404).json({
        status: 'error',
        message: 'Panelist not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Profile picture updated successfully',
      data: {
        image: panelist.image
      }
    });
  } catch (error) {
    console.error('Update profile picture error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Update user account information
 * @route   PATCH /api/panelist/profile/account
 * @access  Private (Panelist only)
 */
exports.updateAccountInfo = async (req, res) => {
  try {
    const updateData = req.body;

    // Remove fields that shouldn't be updated
    delete updateData.email; // Email updates need separate verification
    delete updateData.password; // Password has separate endpoint
    delete updateData.role;
    delete updateData.panelistProfile;
    delete updateData._id;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Account information updated successfully',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          address: user.address,
          profilePicture: user.profilePicture
        }
      }
    });
  } catch (error) {
    console.error('Update account info error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};
