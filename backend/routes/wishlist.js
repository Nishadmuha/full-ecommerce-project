const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  addWishlist, 
  getWishlist, 
  removeFromWishlist 
} = require('../controllers/wishlistController');

// Get user's wishlist
router.get('/', protect, getWishlist);

// Add product to wishlist
router.post('/', protect, addWishlist);

// Remove product from wishlist
router.delete('/:productId', protect, removeFromWishlist);

module.exports = router;
