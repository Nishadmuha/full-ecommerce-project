// frontend/src/pages/ProductList.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import ProductListCard from '../components/ProductListCard';

const defaultCategories = ['Backpacks', 'Handbags', 'Totes', 'Crossbody', 'Clutches', 'Wallets'];
const priceRanges = [
  { label: 'Under ₹5,000', min: 0, max: 5000 },
  { label: '₹5,000 - ₹10,000', min: 5000, max: 10000 },
  { label: '₹10,000 - ₹15,000', min: 10000, max: 15000 },
  { label: 'Over ₹15,000', min: 15000, max: Infinity },
];

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [categories, setCategories] = useState(defaultCategories.map(name => ({ name, _id: name }))); // Store as objects with _id

  // Expand products with colors into individual color variants
  const expandProductColors = (products) => {
    const expandedProducts = [];
    
    products.forEach(product => {
      // If product has colors array with valid colors, create a variant for each color
      if (product.colors && Array.isArray(product.colors) && product.colors.length > 0) {
        product.colors.forEach((color, colorIndex) => {
          // Only add color variant if color has a name
          if (color.name && color.name.trim()) {
            expandedProducts.push({
              ...product,
              _id: `${product._id}_color_${colorIndex}`, // Unique ID for each color variant
              colorVariant: color,
              colorName: color.name,
              // Use color's main image if available, otherwise use first color image, fallback to product image
              image: color.image || (color.images && color.images[0]) || product.image,
              images: color.images && color.images.length > 0 
                ? color.images.filter(img => img && img.trim())
                : (color.image ? [color.image] : product.images || [product.image]),
              // Update title to include color name
              title: `${product.title} - ${color.name}`,
              originalTitle: product.title, // Keep original title for reference
            });
          }
        });
      } else {
        // If no colors, add the product as-is
        expandedProducts.push(product);
      }
    });
    
    return expandedProducts;
  };

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/home');
        if (res.data.collections && res.data.collections.length > 0) {
          // Store full category objects with _id for unique keys
          const categoryObjects = res.data.collections.map(cat => ({
            _id: cat._id || cat.name, // Use _id if available, fallback to name
            name: cat.name
          }));
          setCategories(categoryObjects.length > 0 ? categoryObjects : defaultCategories.map(name => ({ name, _id: name })));
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        // Keep default categories on error
        setCategories(defaultCategories.map(name => ({ name, _id: name })));
      }
    };
    fetchCategories();
  }, []);

  // Fetch products with filters - Auto-updates when filters change
  useEffect(() => {
    let active = true;
    const fetchProducts = async () => {
      setIsSyncing(true);
      try {
        // Build query parameters
        const params = new URLSearchParams();
        
        // Add search query
        if (searchQuery.trim()) {
          params.append('search', searchQuery.trim());
        }
        
        // Add category filter (use first selected category)
        if (selectedCategories.length > 0) {
          params.append('category', selectedCategories[0]);
        }
        
        // Add price range filter
        if (selectedPriceRanges.length > 0) {
          // Use the first selected price range
          const range = selectedPriceRanges[0];
          if (range.min !== undefined) params.append('minPrice', range.min);
          if (range.max !== undefined && range.max !== Infinity) {
            params.append('maxPrice', range.max);
          }
        }
        
        // Add sort
        if (sortBy !== 'default') {
          const sortMap = {
            'price-low': 'price-asc',
            'price-high': 'price-desc',
            'newest': 'newest',
            'name': 'name-asc'
          };
          if (sortMap[sortBy]) {
            params.append('sort', sortMap[sortBy]);
          }
        }
        
        // Build URL with query parameters
        const queryString = params.toString();
        const url = queryString ? `/products?${queryString}` : '/products';
        
        const res = await api.get(url);
        if (active) {
          const fetchedProducts = res.data || [];
          // Expand products with colors into individual variants
          const expandedProducts = expandProductColors(fetchedProducts);
          setProducts(expandedProducts);
        }
      } catch (err) {
        console.error('Products fetch error', err);
      } finally {
        if (active) setIsSyncing(false);
      }
    };

    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(() => {
      fetchProducts();
    }, searchQuery ? 500 : 0); // 500ms delay for search, immediate for other filters

    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [searchQuery, selectedCategories, selectedPriceRanges, sortBy]);

  const handleCategoryToggle = (categoryName) => {
    setSelectedCategories(prev => {
      // Toggle category - if already selected, remove it; otherwise replace with new selection
      if (prev.includes(categoryName)) {
        return prev.filter(c => c !== categoryName);
      } else {
        // For single category filter, replace the array with new selection
        // Or keep multiple if you want multi-category support
        return [categoryName];
      }
    });
  };

  const handlePriceRangeToggle = (range) => {
    setSelectedPriceRanges(prev => {
      // Toggle price range - if already selected, remove it; otherwise replace
      if (prev.some(r => r.label === range.label)) {
        return prev.filter(r => r.label !== range.label);
      } else {
        // For single price range filter, replace with new selection
        return [range];
      }
    });
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedPriceRanges([]);
    setSearchQuery('');
    setSortBy('default');
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    // Auto-filter will trigger via useEffect
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    // Auto-filter will trigger via useEffect
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedPriceRanges.length > 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        {/* Top Control Bar */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Left: Filters Button */}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-charcoal transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>Filters</span>
          </button>

          {/* Center: Search Bar */}
          <div className="flex-1 max-w-md mx-auto md:mx-0">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Right: Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-sm text-gray-600">Sort by:</label>
            <select
              id="sort"
              value={sortBy}
              onChange={handleSortChange}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal focus:border-transparent"
            >
              <option value="default">Default</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
        </div>

        {isSyncing && (
          <div className="mb-4 text-center text-xs uppercase tracking-[0.4em] text-gray-400">
            Syncing inventory…
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Left Sidebar - Filter Panel */}
          <aside
            className={`${
              showFilters ? 'block' : 'hidden'
            } w-full lg:w-64 flex-shrink-0`}
          >
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              {/* Clear All Button */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="mb-6 w-full text-left text-sm font-medium text-gray-600 hover:text-charcoal transition-colors"
                >
                  Clear All
                </button>
              )}

              <div className="space-y-8">
                {/* Category Section */}
                <div>
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-900">Category</h3>
                  <div className="space-y-3">
                    {categories.map(category => (
                      <label key={category._id} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category.name)}
                          onChange={() => handleCategoryToggle(category.name)}
                          className="h-4 w-4 rounded border-gray-300 text-charcoal focus:ring-charcoal"
                        />
                        <span className="text-sm text-gray-700">{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range Section */}
    <div>
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-900">Price Range</h3>
                  <div className="space-y-3">
                    {priceRanges.map(range => (
                      <label key={range.label} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedPriceRanges.some(r => r.label === range.label)}
                          onChange={() => handlePriceRangeToggle(range)}
                          className="h-4 w-4 rounded border-gray-300 text-charcoal focus:ring-charcoal"
                        />
                        <span className="text-sm text-gray-700">{range.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Grid - Product List */}
          <section className="flex-1">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {products.map(product => (
                <ProductListCard key={product._id} product={product} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
