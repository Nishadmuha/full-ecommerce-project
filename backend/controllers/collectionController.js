// backend/controllers/collectionController.js
const Category = require('../models/Category');

// Get all collections (public endpoint)
exports.getAllCollections = async (req, res) => {
  try {
    const { limit } = req.query;
    const query = Category.find().sort({ name: 1 });
    
    if (limit) {
      query.limit(parseInt(limit));
    }
    
    const collections = await query.lean();
    
    res.json({
      success: true,
      count: collections.length,
      collections
    });
  } catch (error) {
    console.error('Get collections error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get single collection by ID (public endpoint)
exports.getCollectionById = async (req, res) => {
  try {
    const collection = await Category.findById(req.params.id).lean();
    
    if (!collection) {
      return res.status(404).json({ 
        success: false,
        message: 'Collection not found' 
      });
    }
    
    res.json({
      success: true,
      collection
    });
  } catch (error) {
    console.error('Get collection by ID error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get collection by slug (public endpoint)
exports.getCollectionBySlug = async (req, res) => {
  try {
    const collection = await Category.findOne({ 
      slug: req.params.slug 
    }).lean();
    
    if (!collection) {
      return res.status(404).json({ 
        success: false,
        message: 'Collection not found' 
      });
    }
    
    res.json({
      success: true,
      collection
    });
  } catch (error) {
    console.error('Get collection by slug error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};



