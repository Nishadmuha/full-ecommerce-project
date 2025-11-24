// backend/models/Banner.js
const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema({
  image: { type: String, default: '' }, // Keep for backward compatibility
  images: { type: [String], required: true, validate: { validator: (v) => v.length === 3, message: 'Banner must have exactly 3 images' } },
  link: { type: String, default: '' },
  title: { type: String, default: '' },
  highlight: { type: String, default: '' },
  title2: { type: String, default: '' },
  highlight2: { type: String, default: '' },
  description: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Banner', BannerSchema);
