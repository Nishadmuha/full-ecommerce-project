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
    const { address, guestId, guestEmail, guestName } = req.body;

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

    // Check stock availability
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

    // Deduct stock from products
    const Product = require('../models/Product');
    for (const item of cart.items) {
      const product = await Product.findById(item.productId._id);
      if (product) {
        product.stock -= item.quantity;
        await product.save();
      }
    }

    // Create order in database first (with pending status)
    const orderData = {
      items: orderItems,
      totalAmount,
      status: 'pending',
      address,
      payment: {
        method: 'razorpay',
        status: 'pending'
      }
    };

    if (req.user) {
      orderData.userId = req.user._id;
    } else {
      orderData.guestEmail = guestEmail;
      orderData.guestName = guestName;
    }

    const order = await Order.create(orderData);

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

    // Verify the order belongs to the user (if authenticated)
    if (req.user && order.userId && order.userId.toString() !== req.user._id.toString()) {
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
        let cartQuery = {};
        if (order.userId) {
          cartQuery = { userId: order.userId };
        } else {
          // For guest orders, we can't clear by guestId easily, but order is created
          // Cart will be cleared on frontend
        }
        
        if (Object.keys(cartQuery).length > 0) {
          const cart = await Cart.findOne(cartQuery);
          if (cart) {
            cart.items = [];
            await cart.save();
          }
        }

        // Populate order with product details
        const populatedOrder = await Order.findById(order._id)
          .populate('items.productId');
        
        if (order.userId) {
          await populatedOrder.populate('userId', 'name email phone');
        }

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


