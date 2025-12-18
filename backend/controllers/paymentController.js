const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Cart = require('../models/Cart');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay order
exports.createRazorpayOrder = async (req, res) => {
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

    // Calculate total amount (in paise for Razorpay)
    const totalAmount = cart.items.reduce((sum, item) => {
      const product = item.productId;
      const price = product?.price || 0;
      return sum + (price * item.quantity);
    }, 0);

    // Convert to paise (Razorpay uses smallest currency unit)
    const amountInPaise = Math.round(totalAmount * 100);

    // Prepare order items
    const orderItems = cart.items.map(item => ({
      productId: item.productId._id,
      quantity: item.quantity,
      price: item.productId.price || 0
    }));

    // Create order in database first (with pending status)
    const order = await Order.create({
      userId: req.user._id,
      items: orderItems,
      totalAmount,
      status: 'pending',
      address,
      payment: {
        method: 'razorpay',
        status: 'pending'
      }
    });

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `order_${order._id}`,
      notes: {
        orderId: order._id.toString(),
        userId: req.user._id.toString()
      }
    });

    // Update order with Razorpay order ID
    order.payment.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.json({
      orderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Create Razorpay order error:', error);
    res.status(500).json({ message: 'Error creating payment order', error: error.message });
  }
};

// Verify Razorpay payment
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !orderId) {
      return res.status(400).json({ message: 'Missing payment details' });
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify the order belongs to the user
    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    // Verify payment signature
    const text = `${razorpayOrderId}|${razorpayPaymentId}`;
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Verify payment with Razorpay
    try {
      const payment = await razorpay.payments.fetch(razorpayPaymentId);
      
      if (payment.status === 'captured' || payment.status === 'authorized') {
        // Update order with payment details
        order.payment.razorpayPaymentId = razorpayPaymentId;
        order.payment.razorpaySignature = razorpaySignature;
        order.payment.status = 'completed';
        order.status = 'pending'; // Order confirmed, waiting for processing
        await order.save();

        // Clear cart
        const cart = await Cart.findOne({ userId: req.user._id });
        if (cart) {
          cart.items = [];
          await cart.save();
        }

        // Populate order with product details
        const populatedOrder = await Order.findById(order._id)
          .populate('items.productId')
          .populate('userId', 'name email phone');

        res.json({
          success: true,
          message: 'Payment verified successfully',
          order: populatedOrder
        });
      } else {
        order.payment.status = 'failed';
        await order.save();
        return res.status(400).json({ message: 'Payment not completed' });
      }
    } catch (razorpayError) {
      console.error('Razorpay verification error:', razorpayError);
      order.payment.status = 'failed';
      await order.save();
      return res.status(400).json({ message: 'Payment verification failed' });
    }
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Error verifying payment', error: error.message });
  }
};

// Get payment status
exports.getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate('items.productId')
      .populate('userId', 'name email phone');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify the order belongs to the user
    if (order.userId._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    res.json({
      orderId: order._id,
      paymentStatus: order.payment.status,
      orderStatus: order.status,
      razorpayOrderId: order.payment.razorpayOrderId
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ message: 'Error fetching payment status', error: error.message });
  }
};


