const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Optional for OAuth users
  phone: { type: String },
  address: { type: Object },
  profileImage: { type: String }, // URL to profile image (can be from Google OAuth or manual upload)
  googleId: { type: String }, // Google OAuth ID
  isAdmin: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
