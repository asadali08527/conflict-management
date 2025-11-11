const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const s3Service = require('../services/s3Service');

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
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
          role: user.role,
          address: user.address,
          profilePicture: user.profilePicture,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 *
 * Note: For profile picture uploads, use the new presigned URL flow:
 * 1. POST /api/files/generate-upload-url (with uploadContext='profile')
 * 2. Upload directly to S3 using the presigned URL from frontend
 * 3. POST /api/files/save-file-record (automatically updates user.profilePicture)
 *
 * This endpoint still supports the old multer-based upload for backward compatibility.
 */
exports.updateProfile = async (req, res) => {
  try {
    // Find user
    let user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Update profile picture if provided (old flow - backward compatibility)
    if (req.file) {
      // Delete old profile picture from S3 if it exists
      if (user.profilePicture && user.profilePicture.key) {
        const deleteResult = await s3Service.deleteFile(user.profilePicture.key);
        if (!deleteResult.success) {
          console.warn(`Failed to delete old profile picture from S3: ${user.profilePicture.key}`, deleteResult.error);
        }
      }

      // Upload new profile picture to S3
      const uploadResult = await s3Service.uploadFile(req.file, 'profiles');

      if (uploadResult.success) {
        user.profilePicture = {
          url: uploadResult.url,
          key: uploadResult.key
        };
      } else {
        return res.status(400).json({
          status: 'error',
          message: 'Failed to upload profile picture',
          error: uploadResult.error
        });
      }
    }

    // Update user fields
    const fieldsToUpdate = {
      firstName: req.body.firstName || user.firstName,
      lastName: req.body.lastName || user.lastName,
      phone: req.body.phone || user.phone
    };

    // Update address if provided
    if (req.body.address) {
      fieldsToUpdate.address = {
        street: req.body.address.street || user.address?.street || '',
        city: req.body.address.city || user.address?.city || '',
        state: req.body.address.state || user.address?.state || '',
        zipCode: req.body.address.zipCode || user.address?.zipCode || '',
        country: req.body.address.country || user.address?.country || ''
      };
    }

    // Update user
    user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          address: user.address,
          profilePicture: user.profilePicture
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Change user password
 * @route   PUT /api/users/change-password
 * @access  Private
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Check if current password matches
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};