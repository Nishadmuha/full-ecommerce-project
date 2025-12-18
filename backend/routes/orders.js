const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { 
  createOrder, 
  getUserOrders, 
  getOrderById 
} = require('../controllers/orderController');

// Get all orders for the authenticated user (requires auth)
router.get('/', protect, getUserOrders);

// Get a specific order by ID (requires auth)
router.get('/:id', protect, getOrderById);

// Create a new order (authenticated or guest)
router.post('/', optionalAuth, createOrder);

module.exports = router;
