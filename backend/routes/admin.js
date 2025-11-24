const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

// All admin routes require authentication and admin role
router.use(protect);
router.use(admin);

// Dashboard/Analytics
router.get('/dashboard', adminController.getDashboardStats);

// Users Management
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', adminController.updateUser);
router.put('/users/:id/block', adminController.toggleUserBlock);
router.put('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

// Orders Management
router.get('/orders', adminController.getAllOrders);
router.get('/orders/:id', adminController.getOrderById);
router.put('/orders/:id/status', adminController.updateOrderStatus);

// Products Management
router.post('/products', adminController.createProduct);
router.put('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);
router.get('/products/category/:category', adminController.getProductsByCategory);

// Coupons Management
router.get('/coupons', adminController.getAllCoupons);
router.post('/coupons', adminController.createCoupon);
router.put('/coupons/:id', adminController.updateCoupon);
router.delete('/coupons/:id', adminController.deleteCoupon);

// Complaints Management
router.get('/complaints', adminController.getAllComplaints);
router.get('/complaints/:id', adminController.getComplaintById);
router.put('/complaints/:id/status', adminController.updateComplaintStatus);

// Categories Management
router.get('/categories', adminController.getAllCategories);
router.post('/categories', adminController.createCategory);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// Banners Management
router.get('/banners', adminController.getAllBanners);
router.post('/banners', adminController.createBanner);
router.put('/banners/:id', adminController.updateBanner);
router.delete('/banners/:id', adminController.deleteBanner);

module.exports = router;

