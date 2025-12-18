const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  guestId: { type: String, required: false }, // For guest users (session ID)
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, default: 1 }
    }
  ]
}, { timestamps: true });

// Compound index: either userId or guestId must be unique
CartSchema.index({ userId: 1 }, { unique: true, sparse: true });
CartSchema.index({ guestId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Cart', CartSchema);
