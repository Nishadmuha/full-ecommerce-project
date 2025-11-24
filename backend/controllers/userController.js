const User = require('../models/User');
const bcrypt = require('bcryptjs');

// GET /api/users/me
// Get authenticated user's profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Get profile error', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/users/me
// Update authenticated user's profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone, address, profileImage } = req.body;
    const userId = req.user._id;

    // Check if email is being changed and if it's already taken
    if (email && email !== req.user.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: userId } });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Update user
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (profileImage !== undefined) updateData.profileImage = profileImage;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error('Update profile error', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/users/me/password
// Update user password
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Update password error', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/users/me
// Delete user account permanently
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    // Delete user account
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Delete account error', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
