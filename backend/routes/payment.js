const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createRazorpayOrder,
  verifyPayment,
  getPaymentStatus
} = require('../controllers/paymentController');

// Create Razorpay order
router.post('/create-order', protect, createRazorpayOrder);

// Verify payment
router.post('/verify', protect, verifyPayment);

// Get payment status
router.get('/status/:orderId', protect, getPaymentStatus);

module.exports = router;


