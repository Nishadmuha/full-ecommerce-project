// backend/routes/collections.js
const express = require('express');
const router = express.Router();
const collectionController = require('../controllers/collectionController');

// Public routes - no authentication required
router.get('/', collectionController.getAllCollections);
router.get('/:id', collectionController.getCollectionById);
router.get('/slug/:slug', collectionController.getCollectionBySlug);

module.exports = router;



