const Cart = require('../models/Cart');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// GET /api/cart
// Return the user's cart (authenticated or guest) with product details populated
exports.getCart = async (req, res) => {
  try {
    let cart;
    const guestId = req.headers['x-guest-id'] || req.body.guestId;

    if (req.user) {
      // Authenticated user
      cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId');
      if (!cart) {
        cart = await Cart.create({ userId: req.user._id, items: [] });
      }
    } else if (guestId) {
      // Guest user
      cart = await Cart.findOne({ guestId }).populate('items.productId');
      if (!cart) {
        cart = await Cart.create({ guestId, items: [] });
      }
    } else {
      // No user and no guestId - return empty cart
      return res.json({ items: [], userId: null, guestId: null });
    }

    // Check stock availability for each item
    const itemsWithStock = await Promise.all(
      cart.items.map(async (item) => {
        const product = item.productId;
        if (product && product.stock !== undefined) {
          return {
            ...item.toObject(),
            availableStock: product.stock,
            isOutOfStock: product.stock === 0,
            canAddMore: item.quantity < product.stock
          };
        }
        return item.toObject();
      })
    );

    res.json({ ...cart.toObject(), items: itemsWithStock });
  } catch (err) {
    console.error('Get cart error', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/cart
// Add or update a product line in the cart (authenticated or guest)
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, guestId } = req.body;

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

    // Verify product exists and check stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if product is in stock
    if (product.stock === 0) {
      return res.status(400).json({ 
        message: 'Product is out of stock',
        availableStock: 0
      });
    }

    // Determine cart identifier
    let cartQuery = {};
    if (req.user) {
      cartQuery = { userId: req.user._id };
    } else if (guestId) {
      cartQuery = { guestId };
    } else {
      return res.status(400).json({ 
        message: 'Authentication required or provide guestId' 
      });
    }

    let cart = await Cart.findOne(cartQuery);
    if (!cart) {
      cart = await Cart.create({ ...cartQuery, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (i) => i.productId.toString() === String(productId)
    );

    let newQuantity;
    if (itemIndex > -1) {
      // Update quantity for existing item (add to existing quantity)
      newQuantity = cart.items[itemIndex].quantity + quantity;
    } else {
      // New item
      newQuantity = quantity;
    }

    // Check if requested quantity exceeds available stock
    if (newQuantity > product.stock) {
      return res.status(400).json({ 
        message: `Only ${product.stock} items available in stock`,
        availableStock: product.stock,
        requestedQuantity: newQuantity
      });
    }

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = newQuantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    await cart.save();

    // Re-populate before sending back so frontend gets full product info
    const populated = await Cart.findById(cart._id).populate('items.productId');
    
    // Add stock info to response
    const itemsWithStock = populated.items.map(item => ({
      ...item.toObject(),
      availableStock: item.productId.stock,
      isOutOfStock: item.productId.stock === 0
    }));

    res.json({ ...populated.toObject(), items: itemsWithStock });
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
    const { quantity, guestId } = req.body;

    // Validate itemId format
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ 
        message: 'Invalid itemId format. Please provide a valid cart item ID.' 
      });
    }

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    // Determine cart identifier
    let cartQuery = {};
    if (req.user) {
      cartQuery = { userId: req.user._id };
    } else if (guestId) {
      cartQuery = { guestId };
    } else {
      return res.status(400).json({ 
        message: 'Authentication required or provide guestId' 
      });
    }

    const cart = await Cart.findOne(cartQuery).populate('items.productId');
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

    // Check stock availability
    const product = cart.items[itemIndex].productId;
    if (product && product.stock !== undefined) {
      if (product.stock === 0) {
        return res.status(400).json({ 
          message: 'Product is out of stock',
          availableStock: 0
        });
      }
      if (quantity > product.stock) {
        return res.status(400).json({ 
          message: `Only ${product.stock} items available in stock`,
          availableStock: product.stock,
          requestedQuantity: quantity
        });
      }
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    // Re-populate before sending back
    const populated = await Cart.findById(cart._id).populate('items.productId');
    
    // Add stock info to response
    const itemsWithStock = populated.items.map(item => ({
      ...item.toObject(),
      availableStock: item.productId.stock,
      isOutOfStock: item.productId.stock === 0
    }));

    res.json({ ...populated.toObject(), items: itemsWithStock });
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
    const { guestId } = req.body;

    // Validate itemId format
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ 
        message: 'Invalid itemId format. Please provide a valid cart item ID.' 
      });
    }

    // Determine cart identifier
    let cartQuery = {};
    if (req.user) {
      cartQuery = { userId: req.user._id };
    } else if (guestId) {
      cartQuery = { guestId };
    } else {
      return res.status(400).json({ 
        message: 'Authentication required or provide guestId' 
      });
    }

    const cart = await Cart.findOne(cartQuery);
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
    
    // Add stock info to response
    const itemsWithStock = populated.items.map(item => ({
      ...item.toObject(),
      availableStock: item.productId.stock,
      isOutOfStock: item.productId.stock === 0
    }));

    res.json({ ...populated.toObject(), items: itemsWithStock });
  } catch (err) {
    console.error('Remove from cart error', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/cart
// Clear entire cart
exports.clearCart = async (req, res) => {
  try {
    const { guestId } = req.body;

    // Determine cart identifier
    let cartQuery = {};
    if (req.user) {
      cartQuery = { userId: req.user._id };
    } else if (guestId) {
      cartQuery = { guestId };
    } else {
      return res.status(400).json({ 
        message: 'Authentication required or provide guestId' 
      });
    }

    const cart = await Cart.findOne(cartQuery);
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
