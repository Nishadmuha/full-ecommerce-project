const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Coupon = require('../models/Coupon');
const Complaint = require('../models/Complaint');
const Banner = require('../models/Banner');

// ============ ANALYTICS/OVERVIEW ============
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    const recentOrders = await Order.find()
      .populate('userId', 'name email')
      .populate('items.productId', 'title image')
      .sort({ createdAt: -1 })
      .limit(10);

    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const monthlyRevenue = await Order.aggregate([
      { $match: { status: 'delivered' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 6 }
    ]);

    res.json({
      stats: {
        totalUsers,
        totalOrders,
        totalProducts,
        totalRevenue: totalRevenue[0]?.total || 0
      },
      recentOrders,
      ordersByStatus,
      monthlyRevenue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ USERS MANAGEMENT ============
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, phone, address, isAdmin, isBlocked } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, address, isAdmin, isBlocked },
      { new: true, runValidators: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Block/Unblock user
exports.toggleUserBlock = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Prevent blocking yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot block yourself' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    const updatedUser = await User.findById(id).select('-password');
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user role (admin/user)
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { isAdmin } = req.body;

    if (typeof isAdmin !== 'boolean') {
      return res.status(400).json({ message: 'isAdmin must be a boolean value' });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Prevent removing your own admin status
    if (user._id.toString() === req.user._id.toString() && !isAdmin) {
      return res.status(400).json({ message: 'You cannot remove your own admin status' });
    }

    user.isAdmin = isAdmin;
    await user.save();

    const updatedUser = await User.findById(id).select('-password');
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ ORDERS MANAGEMENT ============
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email phone')
      .populate('items.productId', 'title image')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email phone address')
      .populate('items.productId');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'packed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('userId', 'name email').populate('items.productId', 'title image');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ PRODUCTS MANAGEMENT ============
exports.createProduct = async (req, res) => {
  try {
    const { title, description, price, image, images, category, isBestseller, isNew, stock, colors } = req.body;
    const product = await Product.create({ 
      title, 
      description, 
      price, 
      image, 
      images,
      category, 
      isBestseller: isBestseller || false,
      isNew: isNew || false,
      stock: stock || 0,
      colors: colors || []
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { title, description, price, image, images, category, isBestseller, isNew, stock, colors } = req.body;
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (image !== undefined) updateData.image = image;
    if (images !== undefined) updateData.images = images;
    if (category !== undefined) updateData.category = category;
    if (isBestseller !== undefined) updateData.isBestseller = isBestseller;
    if (isNew !== undefined) updateData.isNew = isNew;
    if (stock !== undefined) updateData.stock = stock;
    if (colors !== undefined) updateData.colors = colors;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ COUPONS MANAGEMENT ============
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ COMPLAINTS MANAGEMENT ============
exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('userId', 'name email')
      .populate('orderId', 'totalAmount status')
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('userId', 'name email phone address')
      .populate('orderId');
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status, adminResponse } = req.body;
    const updateData = { status };
    if (adminResponse) updateData.adminResponse = adminResponse;
    if (status === 'resolved' || status === 'closed') {
      updateData.resolvedAt = new Date();
    }
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('userId', 'name email').populate('orderId');
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ CATEGORIES MANAGEMENT ============
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, image, slug } = req.body;
    
    // Generate slug from name if not provided
    let categorySlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    // Ensure slug is unique (even if name is duplicate)
    let finalSlug = categorySlug;
    let counter = 1;
    while (await Category.findOne({ slug: finalSlug })) {
      finalSlug = `${categorySlug}-${counter}`;
      counter++;
    }
    
    const category = await Category.create({
      name,
      image,
      slug: finalSlug
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name, image, slug } = req.body;
    const updateData = {};
    
    if (name !== undefined) updateData.name = name;
    if (image !== undefined) updateData.image = image;
    
    if (slug !== undefined) {
      // If slug is provided, check if it's unique (excluding current category)
      const existing = await Category.findOne({ 
        slug: slug, 
        _id: { $ne: req.params.id } 
      });
      if (existing) {
        // If slug exists for another category, append number
        let finalSlug = slug;
        let counter = 1;
        while (await Category.findOne({ slug: finalSlug, _id: { $ne: req.params.id } })) {
          finalSlug = `${slug}-${counter}`;
          counter++;
        }
        updateData.slug = finalSlug;
      } else {
        updateData.slug = slug;
      }
    } else if (name !== undefined) {
      // Auto-generate slug from name if name changed but slug not provided
      let categorySlug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      let finalSlug = categorySlug;
      let counter = 1;
      while (await Category.findOne({ slug: finalSlug, _id: { $ne: req.params.id } })) {
        finalSlug = `${categorySlug}-${counter}`;
        counter++;
      }
      updateData.slug = finalSlug;
    }
    
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json({ message: 'Category deleted successfully', category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ BANNERS MANAGEMENT ============
exports.getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createBanner = async (req, res) => {
  try {
    const banner = await Banner.create(req.body);
    res.status(201).json(banner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!banner) return res.status(404).json({ message: 'Banner not found' });
    res.json(banner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ message: 'Banner not found' });
    res.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

