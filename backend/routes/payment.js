const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const {
  createRazorpayOrder,
  verifyPayment,
  getPaymentStatus
} = require('../controllers/paymentController');

// Create Razorpay order (authenticated or guest)
router.post('/create-order', optionalAuth, createRazorpayOrder);

// Verify payment (authenticated or guest)
router.post('/verify', optionalAuth, verifyPayment);

// Get payment status (requires auth)
router.get('/status/:orderId', protect, getPaymentStatus);

module.exports = router;


