// backend/controllers/homeController.js
const Banner = require('../models/Banner');
const Category = require('../models/Category');
const Product = require('../models/Product');

exports.getHome = async (req, res) => {
  try {
    // Banners (sorted by order) - Only banners with exactly 3 images
    const banners = await Banner.find({ 
      $or: [
        { images: { $size: 3 } }, // Has exactly 3 images
        { images: { $exists: false }, image: { $exists: true } } // Fallback for old banners
      ]
    }).sort({ order: 1 }).limit(1).lean();

    // Clean and format banner images (remove whitespace/tabs from URLs)
    const formattedBanners = banners.map(banner => {
      if (banner.images && Array.isArray(banner.images)) {
        return {
          ...banner,
          images: banner.images.map(img => typeof img === 'string' ? img.trim() : img)
        };
      }
      return banner;
    });

    // Collections (categories)
    const collections = await Category.find().limit(8).lean();

    // Bestsellers - return top 8 bestsellers
    const bestsellers = await Product.find({ isBestseller: true }).limit(8).lean();

    // New Arrivals - latest by createdAt or marked isNew
    let newArrivals = await Product.find({ isNew: true }).sort({ createdAt: -1 }).limit(8).lean();

    // If there's not enough marked isNew, fallback to latest products:
    if (newArrivals.length < 4) {
      const fallback = await Product.find().sort({ createdAt: -1 }).limit(8).lean();
      // merge while keeping uniqueness
      const ids = new Set(newArrivals.map(p => String(p._id)));
      fallback.forEach(p => {
        if (!ids.has(String(p._id)) && newArrivals.length < 8) {
          newArrivals.push(p);
        }
      });
    }

    // Format products to match frontend expectations
    const formatProduct = (product) => ({
      _id: product._id,
      title: product.title,
      subtitle: product.description || '',
      price: product.price || 0,
      images: product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []),
      image: product.image || (product.images && product.images[0]) || '',
      category: product.category || ''
    });

    const formattedBestsellers = bestsellers.map(formatProduct);
    const formattedNewArrivals = newArrivals.map(formatProduct);

    res.json({ 
      banners: formattedBanners.length > 0 ? formattedBanners : [], 
      collections, 
      bestsellers: formattedBestsellers, 
      newArrivals: formattedNewArrivals 
    });
  } catch (err) {
    console.error('Home API error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
