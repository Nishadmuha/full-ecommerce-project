const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// GET /api/wishlist
// Return (or lazily create) the authenticated user's wishlist
exports.getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ userId: req.user._id }).populate('products');

    if (!wishlist) {
      wishlist = await Wishlist.create({ userId: req.user._id, products: [] });
    }

    res.json(wishlist);
  } catch (err) {
    console.error('Get wishlist error', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/wishlist
// Add a product to the authenticated user's wishlist (idempotent)
exports.addWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'productId is required' });
    }

    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ 
        message: 'Invalid productId format. Please provide a valid product ID.' 
      });
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let wishlist = await Wishlist.findOne({ userId: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ userId: req.user._id, products: [] });
    }

    // Check if product already in wishlist
    const exists = wishlist.products.some(
      (id) => id.toString() === String(productId)
    );

    if (!exists) {
      wishlist.products.push(productId);
      await wishlist.save();
    }

    // Re-populate before sending back
    const populated = await Wishlist.findById(wishlist._id).populate('products');
    res.json(populated);
  } catch (err) {
    console.error('Add wishlist error', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/wishlist/:productId
// Remove a product from the authenticated user's wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ 
        message: 'Invalid productId format. Please provide a valid product ID.' 
      });
    }

    const wishlist = await Wishlist.findOne({ userId: req.user._id });
    if (!wishlist) {
      return res.status(404).json({ 
        message: 'Wishlist not found',
        hint: 'Your wishlist is empty. Add items to wishlist first.'
      });
    }

    // Check if wishlist has products
    if (!wishlist.products || wishlist.products.length === 0) {
      return res.status(404).json({ 
        message: 'Wishlist is empty',
        hint: 'No items in wishlist to remove.'
      });
    }

    // Find and remove the product
    const productIndex = wishlist.products.findIndex(
      (id) => id.toString() === productId
    );

    if (productIndex === -1) {
      // Provide helpful debugging info
      const availableProductIds = wishlist.products.map(id => id.toString());
      return res.status(404).json({ 
        message: 'Product not found in wishlist',
        hint: `The product ID "${productId}" is not in your wishlist.`,
        availableProductIds: availableProductIds,
        wishlistItemCount: wishlist.products.length
      });
    }

    wishlist.products.splice(productIndex, 1);
    await wishlist.save();

    // Re-populate before sending back
    const populated = await Wishlist.findById(wishlist._id).populate('products');
    res.json(populated);
  } catch (err) {
    console.error('Remove from wishlist error', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
