const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// POST /api/orders
// Create a new order from cart
exports.createOrder = async (req, res) => {
  try {
    const { address } = req.body;

    // Validate address
    if (!address) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    // Get user's cart
    const cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId');
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty. Add items to cart before placing order.' });
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

    // Create order
    const order = await Order.create({
      userId: req.user._id,
      items: orderItems,
      totalAmount,
      status: 'pending',
      address
    });

    // Clear cart after order creation
    cart.items = [];
    await cart.save();

    // Populate order with product details
    const populatedOrder = await Order.findById(order._id)
      .populate('items.productId')
      .populate('userId', 'name email phone');

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
