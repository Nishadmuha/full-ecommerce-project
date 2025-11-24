const Cart = require('../models/Cart');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// GET /api/cart
// Return the authenticated user's cart with product details populated
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId');

    // If the user has no cart yet, create an empty one so the frontend
    // always receives a consistent object shape.
    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, items: [] });
    }

    res.json(cart);
  } catch (err) {
    console.error('Get cart error', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/cart
// Add or update a product line in the cart for the authenticated user
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'productId is required' });
    }

    // Validate productId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ 
        message: 'Invalid productId format. Please provide a valid product ID.' 
      });
    }

    // Validate quantity
    if (quantity < 1 || !Number.isInteger(quantity)) {
      return res.status(400).json({ 
        message: 'Quantity must be a positive integer' 
      });
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (i) => i.productId.toString() === String(productId)
    );

    if (itemIndex > -1) {
      // Update quantity for existing item (add to existing quantity)
      cart.items[itemIndex].quantity += quantity;
    } else {
      // Push new line item
      cart.items.push({ productId, quantity });
    }

    await cart.save();

    // Re-populate before sending back so frontend gets full product info
    const populated = await Cart.findById(cart._id).populate('items.productId');
    res.json(populated);
  } catch (err) {
    console.error('Add to cart error', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/cart/:itemId
// Update quantity of a specific cart item
exports.updateQuantity = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    // Validate itemId format
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ 
        message: 'Invalid itemId format. Please provide a valid cart item ID.' 
      });
    }

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ 
        message: 'Cart not found',
        hint: 'Your cart is empty. Add items to cart first.'
      });
    }

    // Check if cart has items
    if (!cart.items || cart.items.length === 0) {
      return res.status(404).json({ 
        message: 'Cart is empty',
        hint: 'No items in cart to update.'
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      // Provide helpful debugging info
      const availableItemIds = cart.items.map(item => item._id.toString());
      return res.status(404).json({ 
        message: 'Cart item not found',
        hint: `The item ID "${itemId}" does not exist in your cart.`,
        availableItemIds: availableItemIds,
        cartItemCount: cart.items.length
      });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    // Re-populate before sending back
    const populated = await Cart.findById(cart._id).populate('items.productId');
    res.json(populated);
  } catch (err) {
    console.error('Update quantity error', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/cart/:itemId
// Remove an item from the cart
exports.removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    // Validate itemId format
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ 
        message: 'Invalid itemId format. Please provide a valid cart item ID.' 
      });
    }

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ 
        message: 'Cart not found',
        hint: 'Your cart is empty. Add items to cart first.'
      });
    }

    // Check if cart has items
    if (!cart.items || cart.items.length === 0) {
      return res.status(404).json({ 
        message: 'Cart is empty',
        hint: 'No items in cart to remove.'
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      // Provide helpful debugging info
      const availableItemIds = cart.items.map(item => item._id.toString());
      return res.status(404).json({ 
        message: 'Cart item not found',
        hint: `The item ID "${itemId}" does not exist in your cart.`,
        availableItemIds: availableItemIds,
        cartItemCount: cart.items.length
      });
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    // Re-populate before sending back
    const populated = await Cart.findById(cart._id).populate('items.productId');
    res.json(populated);
  } catch (err) {
    console.error('Remove from cart error', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/cart
// Clear entire cart
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = [];
    await cart.save();

    res.json({ message: 'Cart cleared successfully', cart });
  } catch (err) {
    console.error('Clear cart error', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
