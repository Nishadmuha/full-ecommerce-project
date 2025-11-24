const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  getProfile, 
  updateProfile,
  updatePassword,
  deleteAccount
} = require('../controllers/userController');

// Get user profile
router.get('/me', protect, getProfile);

// Update user profile
router.put('/me', protect, updateProfile);

// Update user password
router.put('/me/password', protect, updatePassword);

// Delete user account
router.delete('/me', protect, deleteAccount);

module.exports = router;
