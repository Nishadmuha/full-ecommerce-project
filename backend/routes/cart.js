const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  addToCart, 
  getCart, 
  updateQuantity, 
  removeFromCart,
  clearCart 
} = require('../controllers/cartController');

// Get user's cart
router.get('/', protect, getCart);

// Add item to cart
router.post('/', protect, addToCart);

// Update item quantity
router.put('/:itemId', protect, updateQuantity);

// Remove item from cart
router.delete('/:itemId', protect, removeFromCart);

// Clear entire cart
router.delete('/', protect, clearCart);

module.exports = router;
