const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// POST /api/orders
// Create a new order from cart (authenticated or guest)
exports.createOrder = async (req, res) => {
  try {
    const { address, guestId, guestEmail, guestName, paymentMethod = 'cod' } = req.body;

    // Validate address
    if (!address) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    // For guest orders, require email and name
    if (!req.user && (!guestEmail || !guestName)) {
      return res.status(400).json({ 
        message: 'Email and name are required for guest orders' 
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

    // Get user's cart
    const cart = await Cart.findOne(cartQuery).populate('items.productId');
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty. Add items to cart before placing order.' });
    }

    // Check stock availability and validate quantities
    for (const item of cart.items) {
      const product = item.productId;
      if (!product) {
        return res.status(400).json({ 
          message: `Product not found for item ${item._id}` 
        });
      }

      if (product.stock === undefined || product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.title}. Available: ${product.stock || 0}, Requested: ${item.quantity}`,
          productId: product._id,
          availableStock: product.stock || 0,
          requestedQuantity: item.quantity
        });
      }
    }

    // Calculate total amount
    const totalAmount = cart.items.reduce((sum, item) => {
      const product = item.productId;
      const price = product?.price || 0;
      return sum + (price * item.quantity);
    }, 0);

    // Prepare order items
    const orderItems = cart.items.map(item => ({
      productId: item.productId._id,
      quantity: item.quantity,
      price: item.productId.price || 0
    }));

    // Deduct stock from products
    for (const item of cart.items) {
      const product = await Product.findById(item.productId._id);
      if (product) {
        product.stock -= item.quantity;
        await product.save();
      }
    }

    // Create order
    const orderData = {
      items: orderItems,
      totalAmount,
      status: 'pending',
      address,
      payment: {
        method: paymentMethod,
        status: paymentMethod === 'cod' ? 'completed' : 'pending'
      }
    };

    if (req.user) {
      orderData.userId = req.user._id;
    } else {
      orderData.guestEmail = guestEmail;
      orderData.guestName = guestName;
    }

    const order = await Order.create(orderData);

    // Clear cart after order creation
    cart.items = [];
    await cart.save();

    // Populate order with product details
    const populatedOrder = await Order.findById(order._id)
      .populate('items.productId');
    
    if (order.userId) {
      await populatedOrder.populate('userId', 'name email phone');
    }

    res.status(201).json(populatedOrder);
  } catch (err) {
    console.error('Create order error', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/orders
// Get all orders for the authenticated user
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate('items.productId')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error('Get user orders error', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/orders/:id
// Get a specific order by ID (user can only see their own orders)
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate order ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        message: 'Invalid order ID format.' 
      });
    }

    const order = await Order.findById(id)
      .populate('items.productId')
      .populate('userId', 'name email phone address');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order belongs to the user (unless admin)
    if (order.userId._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. This order does not belong to you.' });
    }

    res.json(order);
  } catch (err) {
    console.error('Get order by ID error', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
