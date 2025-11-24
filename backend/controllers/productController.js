const Product = require('../models/Product');

// GET UNIQUE PRODUCT CATEGORIES (for filter dropdown)
exports.getProductCategories = async (req, res) => {
  try {
    // Get distinct categories from products
    const categories = await Product.distinct('category');
    
    // Filter out null/undefined/empty values and sort
    const validCategories = categories
      .filter(cat => cat && typeof cat === 'string' && cat.trim().length > 0)
      .map(cat => cat.trim())
      .filter((cat, index, self) => self.indexOf(cat) === index) // Remove duplicates (case-sensitive)
      .sort(); // Sort alphabetically
    
    res.json(validCategories);
  } catch (error) {
    console.error('Get product categories error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET ALL PRODUCTS with Search, Filter, and Sort
exports.getProducts = async (req, res) => {
  try {
    const { 
      search,           // Search in title and description
      category,         // Filter by category
      minPrice,         // Minimum price filter
      maxPrice,         // Maximum price filter
      sort,             // Sort: price-asc, price-desc, newest, oldest, name-asc, name-desc
      isBestseller,     // Filter bestsellers
      isNew             // Filter new arrivals
    } = req.query;

    // Build query object
    const query = {};

    // Search in title and description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by category - support multiple categories
    if (category) {
      // Handle both single category (string) and multiple categories (array)
      const categories = Array.isArray(category) ? category : [category];
      // Trim and filter empty categories
      const validCategories = categories
        .map(cat => String(cat).trim())
        .filter(cat => cat.length > 0);
      
      if (validCategories.length > 0) {
        if (validCategories.length === 1) {
          // Single category: exact match (case-insensitive)
          query.category = { $regex: `^${validCategories[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' };
        } else {
          // Multiple categories: use $or to match any of the selected categories
          // This works with existing $or from search by using $and if both exist
          const categoryConditions = validCategories.map(cat => ({
            category: { $regex: `^${cat.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' }
          }));
          
          // If search also exists, we need to combine: (search) AND (category1 OR category2 OR ...)
          if (query.$or) {
            // Search exists: combine with $and
            query.$and = [
              { $or: query.$or }, // Search conditions
              { $or: categoryConditions } // Category conditions
            ];
            delete query.$or; // Remove $or as it's now in $and
          } else {
            // No search: just use $or for categories
            query.$or = categoryConditions;
          }
        }
      }
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Filter by bestseller
    if (isBestseller === 'true') {
      query.isBestseller = true;
    }

    // Filter by new
    if (isNew === 'true') {
      query.isNew = true;
    }

    // Build sort object
    let sortObj = {};
    switch (sort) {
      case 'price-asc':
        sortObj = { price: 1 };
        break;
      case 'price-desc':
        sortObj = { price: -1 };
        break;
      case 'newest':
        sortObj = { createdAt: -1 };
        break;
      case 'oldest':
        sortObj = { createdAt: 1 };
        break;
      case 'name-asc':
        sortObj = { title: 1 };
        break;
      case 'name-desc':
        sortObj = { title: -1 };
        break;
      default:
        sortObj = { createdAt: -1 }; // Default: newest first
    }

    // Execute query
    const products = await Product.find(query).sort(sortObj);

    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET ONE PRODUCT
exports.getProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) return res.status(404).json({ message: "Product not found" });

  res.json(product);
};

// CREATE PRODUCT
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.json({ message: "Product created successfully", product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE PRODUCT
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product updated", product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE PRODUCT
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
