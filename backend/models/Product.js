const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    price: Number,
    image: String,
    images: [String],
    category: String,
    isBestseller: { type: Boolean, default: false },
    isNew: { type: Boolean, default: false },
    stock: { type: Number, default: 0 },
    colors: [{
      name: String,
      image: String,
      images: [String] // Array of 3 images per color
    }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', ProductSchema);
