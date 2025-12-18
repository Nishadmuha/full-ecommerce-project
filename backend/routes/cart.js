const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { 
  addToCart, 
  getCart, 
  updateQuantity, 
  removeFromCart,
  clearCart 
} = require('../controllers/cartController');

// Get user's cart (authenticated or guest)
router.get('/', optionalAuth, getCart);

// Add item to cart (authenticated or guest)
router.post('/', optionalAuth, addToCart);

// Update item quantity (authenticated or guest)
router.put('/:itemId', optionalAuth, updateQuantity);

// Remove item from cart (authenticated or guest)
router.delete('/:itemId', optionalAuth, removeFromCart);

// Clear entire cart (authenticated or guest)
router.delete('/', optionalAuth, clearCart);

module.exports = router;
