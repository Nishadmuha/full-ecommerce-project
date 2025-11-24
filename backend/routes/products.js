const express = require('express');
const router = express.Router();

// Controllers
const {
    getProducts,
    getProduct,
    getProductCategories,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');

// Middlewares
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/categories', getProductCategories); // Get unique product categories for filters
router.get('/', getProducts);
router.get('/:id', getProduct);

// Admin only routes
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;
