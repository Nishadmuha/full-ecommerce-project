const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

// Initialize Google OAuth client
let googleClient = null;
if (process.env.GOOGLE_CLIENT_ID) {
  googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
} else {
  console.warn('⚠️  GOOGLE_CLIENT_ID not set. Google OAuth will not work.');
}

// ============ REGISTER ============
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, password: hashed });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        profileImage: user.profileImage, 
        isAdmin: user.isAdmin 
      } 
    });
  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ============ LOGIN ============
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check if user is OAuth-only (no password)
    if (!user.password) {
      return res.status(400).json({ message: 'Please sign in with Google' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        profileImage: user.profileImage, 
        isAdmin: user.isAdmin 
      } 
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ============ GOOGLE AUTH ============
router.post('/google', async (req, res) => {
  try {
    // Check configuration
    if (!googleClient || !process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ 
        message: 'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID in environment variables.' 
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ 
        message: 'Server configuration error. JWT_SECRET is missing.' 
      });
    }

    // Get credential from request (Google sends 'credential')
    const credential = req.body.credential || req.body.token;

    if (!credential || typeof credential !== 'string') {
      return res.status(400).json({ message: 'Google credential token is required' });
    }

    // Verify Google token
    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (verifyError) {
      console.error('Google token verification failed:', verifyError.message);
      
      // Check for audience mismatch
      if (verifyError.message && verifyError.message.includes('audience')) {
        return res.status(400).json({ 
          message: 'Token audience mismatch. Frontend and backend must use the same Google Client ID.',
          error: verifyError.message,
          hint: 'Ensure VITE_GOOGLE_CLIENT_ID (frontend) matches GOOGLE_CLIENT_ID (backend)'
        });
      }
      
      return res.status(400).json({ 
        message: 'Invalid Google token', 
        error: verifyError.message 
      });
    }

    // Extract user info from token
    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({ message: 'Email not provided by Google' });
    }

    // Find or create user
    let user = await User.findOne({ 
      $or: [{ email }, { googleId }] 
    });

    if (user) {
      // Update existing user with Google info if needed
      if (!user.googleId) user.googleId = googleId;
      if (!user.profileImage && picture) user.profileImage = picture;
      if (!user.name && name) user.name = name;
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        name: name || email.split('@')[0] || 'User',
        email,
        googleId,
        profileImage: picture || undefined,
        // No password for OAuth users
      });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage || null,
        isAdmin: user.isAdmin || false
      }
    });
  } catch (error) {
    console.error('Google OAuth Error:', error);
    res.status(500).json({ 
      message: 'Google authentication failed', 
      error: error.message 
    });
  }
});

module.exports = router;
