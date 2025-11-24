const Product = require('../models/Product');

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

    // Filter by category
    if (category) {
      query.category = { $regex: category, $options: 'i' };
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
