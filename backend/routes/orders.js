const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  createOrder, 
  getUserOrders, 
  getOrderById 
} = require('../controllers/orderController');

// Get all orders for the authenticated user
router.get('/', protect, getUserOrders);

// Get a specific order by ID
router.get('/:id', protect, getOrderById);

// Create a new order
router.post('/', protect, createOrder);

module.exports = router;
