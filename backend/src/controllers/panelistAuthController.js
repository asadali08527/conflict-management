const User = require('../models/User');
const Panelist = require('../models/Panelist');
const { generateToken } = require('../config/jwt');

/**
 * @desc    Panelist login
 * @route   POST /api/panelist/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email and password'
      });
    }

    // Check if user exists with panelist role
    const user = await User.findOne({ email, role: 'panelist' })
      .select('+password')
      .populate('panelistProfile');

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'This account has been deactivated'
      });
    }

    // Check if panelist profile exists and is active
    if (!user.panelistProfile) {
      return res.status(401).json({
        status: 'error',
        message: 'Panelist profile not found'
      });
    }

    const panelist = await Panelist.findById(user.panelistProfile);
    if (!panelist || !panelist.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'Panelist account is not active'
      });
    }

    // Generate token
    const token = generateToken(user);

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          panelistProfile: panelist._id
        },
        panelist: {
          id: panelist._id,
          name: panelist.name,
          occupation: panelist.occupation,
          specializations: panelist.specializations,
          image: panelist.image,
          availability: panelist.availability
        },
        token
      }
    });
  } catch (error) {
    console.error('Panelist login error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Get current panelist info
 * @route   GET /api/panelist/auth/me
 * @access  Private (Panelist only)
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('panelistProfile');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const panelist = await Panelist.findById(user.panelistProfile);

    if (!panelist) {
      return res.status(404).json({
        status: 'error',
        message: 'Panelist profile not found'
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
          statistics: panelist.statistics
        }
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Change panelist password
 * @route   PATCH /api/panelist/auth/change-password
 * @access  Private (Panelist only)
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide current password and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'New password must be at least 6 characters'
      });
    }

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

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
    console.error('Change password error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};

/**
 * @desc    Logout panelist
 * @route   POST /api/panelist/auth/logout
 * @access  Private (Panelist only)
 */
exports.logout = async (req, res) => {
  try {
    // In JWT-based auth, logout is handled client-side by removing the token
    // This endpoint exists for consistency and future token blacklisting if needed

    res.status(200).json({
      status: 'success',
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
};
