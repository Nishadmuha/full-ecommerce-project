const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: Number,
      price: Number
    }
  ],
  totalAmount: Number,
  status: { 
    type: String, 
    enum: ["pending", "packed", "shipped", "delivered", "cancelled"],
    default: "pending"
  },
  address: Object,
  payment: {
    method: { type: String, enum: ['razorpay', 'cod'], default: 'razorpay' },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' }
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
