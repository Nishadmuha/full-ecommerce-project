// backend/models/Category.js
const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true }, // Removed unique constraint to allow duplicate names
  image: String,
  slug: { type: String, lowercase: true, index: true } // Removed unique constraint
}, { timestamps: true });

// Ensure indexes are created correctly (non-unique)
CategorySchema.index({ name: 1 }, { unique: false });
CategorySchema.index({ slug: 1 }, { unique: false });

module.exports = mongoose.model("Category", CategorySchema);
