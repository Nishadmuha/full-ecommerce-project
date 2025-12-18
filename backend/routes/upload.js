const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { uploadSingle, uploadMultiple, uploadImage, uploadImages } = require('../controllers/uploadController');

// Upload single image (for profile images, main product images)
router.post('/single', protect, uploadSingle, uploadImage);

// Upload multiple images (for product galleries, color images)
router.post('/multiple', protect, uploadMultiple, uploadImages);

module.exports = router;


