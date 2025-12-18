// frontend/src/pages/ProductDetails.jsx
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { AuthContext } from '../contexts/AuthContext.jsx';
import { addToCart } from '../api/cartApi';
import { getWishlist, addToWishlist, removeFromWishlist } from '../api/wishlistApi';
import SuccessAlert from '../components/SuccessAlert';

const formatPrice = value => `₹${Number(value).toLocaleString('en-IN')}`;

export default function ProductDetails() {
  const { productId } = useParams();
  const { requireAuth, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null); // Start with null to show main images first
  const [colorClicked, setColorClicked] = useState(false); // Track if user has clicked a color
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [showAlert, setShowAlert] = useState(false);

  // Update images when color changes (only if user clicked a color)
  useEffect(() => {
    if (selectedColor && colorClicked) {
      // When color changes, update product images based on selected color
      if (selectedColor.images && selectedColor.images.length > 0 && selectedColor.images.filter(img => img).length > 0) {
        // Use color-specific images if available
        const colorImages = selectedColor.images.filter(img => img && img.trim());
        if (colorImages.length > 0) {
          setProduct(prev => ({
            ...prev,
            images: colorImages.length >= 3 ? colorImages.slice(0, 3) : colorImages
          }));
        }
      } else if (selectedColor.image) {
        // Fallback to single color image
        setProduct(prev => ({
          ...prev,
          images: [selectedColor.image]
        }));
      }
      // Reset to first image of that color
      setSelectedImageIndex(0);
    }
  }, [selectedColor, colorClicked]);

  // Scroll to top when productId changes (when navigating to a different product)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [productId]);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!productId) return;
      setLoading(true);
      // Reset states when product changes
      setSelectedColor(null);
      setColorClicked(false);
      setSelectedImageIndex(0);
      try {
        const res = await api.get(`/products/${productId}`);
        if (active && res?.data) {
          // Set main product images first (from product.image or product.images)
          const mainImages = [];
          if (res.data.image) mainImages.push(res.data.image);
          if (res.data.images && res.data.images.length > 0) {
            mainImages.push(...res.data.images.filter(img => img && img.trim()));
          }
          const productImages = mainImages.length > 0 ? mainImages.slice(0, 3) : [];

          const incoming = {
            ...res.data,
            images: productImages, // Use main product images first
            colors: res.data.colors || [],
          };
          setProduct(incoming);
          setSelectedImageIndex(0);
          
          // Don't set selectedColor initially - show main product images first
          // User will click a color to see color-specific images
          setSelectedColor(null);
          setColorClicked(false);
          if (incoming.sizes?.length) {
            setSelectedSize(incoming.sizes[0]);
          } else {
            setSelectedSize(null);
          }

          // Fetch related products from same category
          if (incoming.category) {
            try {
              const relatedRes = await api.get(`/products?category=${encodeURIComponent(incoming.category)}`);
              if (active && relatedRes?.data) {
                // Filter out current product and limit to 4
                const related = relatedRes.data
                  .filter(p => p._id !== incoming._id)
                  .slice(0, 4)
                  .map(p => ({
                    _id: p._id,
                    title: p.title,
                    price: p.price,
                    images: p.images?.length ? p.images : (p.image ? [p.image] : []),
                    image: p.image || (p.images?.[0] || ''),
                  }));
                setRelatedProducts(related);
              }
            } catch (err) {
              console.error('Error fetching related products:', err);
              setRelatedProducts([]);
            }
          } else {
            setRelatedProducts([]);
          }
        }
      } catch (err) {
        console.error('Product detail fetch error', err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [productId]);

  // Check if product is in wishlist
  const currentProductId = productId || product?._id || null;
  
  useEffect(() => {
    if (!currentProductId) return; // Don't check if no product ID
    
    const checkWishlistStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsWishlisted(false);
          return;
        }
        const response = await getWishlist();
        const wishlistProducts = response.data.products || [];
        
        const isInWishlist = wishlistProducts.some(
          (p) => p._id === currentProductId || p.toString() === currentProductId
        );
        setIsWishlisted(isInWishlist);
      } catch (err) {
        // If user is not authenticated, wishlist check will fail - that's okay
        setIsWishlisted(false);
      }
    };

      checkWishlistStatus();
  }, [currentProductId]);

  // Get images - show main product images first, color images only if color was clicked
  const thumbnails = useMemo(() => {
    // If user clicked a color, show color-specific images
    if (colorClicked && selectedColor) {
      if (selectedColor.images && selectedColor.images.length > 0) {
        const colorImages = selectedColor.images.filter(img => img && img.trim());
        if (colorImages.length > 0) {
          // Return all color images (up to 3 for display, but can show more in fullscreen)
          return colorImages;
        }
      }
      if (selectedColor.image) {
        return [selectedColor.image];
      }
    }
    // Otherwise, show main product images (from product.image or product.images)
    return product?.images || [];
  }, [product?.images, selectedColor, colorClicked]);
  const selectedImage = thumbnails[selectedImageIndex];

  // Auto-rotation slideshow: cycle through 3 images every 3 seconds
  useEffect(() => {
    if (!isAutoRotating || thumbnails.length === 0) return;

    const interval = setInterval(() => {
      setSelectedImageIndex(prev => (prev + 1) % thumbnails.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoRotating, thumbnails.length]);

  const handleThumbnailClick = (index) => {
    setSelectedImageIndex(index);
    setIsAutoRotating(false);
    // Restart auto-rotation after 3 seconds
    setTimeout(() => {
      setIsAutoRotating(true);
    }, 3000);
  };

  const openFullScreen = (index) => {
    setSelectedImageIndex(index);
    setIsFullScreen(true);
    setIsAutoRotating(false);
  };

  const closeFullScreen = () => {
    setIsFullScreen(false);
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % thumbnails.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + thumbnails.length) % thumbnails.length);
  };

  // Keyboard navigation in fullscreen
  useEffect(() => {
    if (!isFullScreen || thumbnails.length === 0) return;
    
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeFullScreen();
      } else if (e.key === 'ArrowLeft' && thumbnails.length > 1) {
        setSelectedImageIndex((prev) => (prev - 1 + thumbnails.length) % thumbnails.length);
      } else if (e.key === 'ArrowRight' && thumbnails.length > 1) {
        setSelectedImageIndex((prev) => (prev + 1) % thumbnails.length);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreen, thumbnails.length]);

  const adjustQuantity = delta => {
    setQuantity(prev => {
      const newQuantity = prev + delta;
      const maxQuantity = product?.stock || 0;
      if (maxQuantity > 0) {
        return Math.max(1, Math.min(newQuantity, maxQuantity));
      }
      return Math.max(1, newQuantity);
    });
  };

  const handleWishlist = async () => {
    if (!requireAuth(() => {})) return;

    const productIdToUse = productId || product?._id;
    if (!productIdToUse) {
      setAlertMessage('Product information is missing');
      setAlertType('error');
      setShowAlert(true);
      return;
    }

    try {
      if (isWishlisted) {
        // Remove from wishlist
        await removeFromWishlist(productIdToUse);
        setIsWishlisted(false);
      } else {
        // Add to wishlist
        await addToWishlist(productIdToUse);
        setIsWishlisted(true);
      }
    } catch (err) {
      console.error('Error updating wishlist:', err);
      setAlertMessage(err.response?.data?.message || 'Failed to update wishlist. Please try again.');
      setAlertType('error');
      setShowAlert(true);
    }
  };

  const handleAddToCart = async () => {
    const productIdToUse = productId || product?._id;
    if (!productIdToUse) {
      setAlertMessage('Product information is missing');
      setAlertType('error');
      setShowAlert(true);
      return;
    }

    // Check stock availability
    if (product?.stock !== undefined && product.stock === 0) {
      setAlertMessage('This product is out of stock');
      setAlertType('error');
      setShowAlert(true);
      return;
    }

    if (product?.stock !== undefined && quantity > product.stock) {
      setAlertMessage(`Only ${product.stock} items available in stock`);
      setAlertType('error');
      setShowAlert(true);
      setQuantity(product.stock);
      return;
    }

    try {
      setAddingToCart(true);
      await addToCart(productIdToUse, quantity);
      setAlertMessage('Item added to cart successfully!');
      setAlertType('success');
      setShowAlert(true);
      // Optionally navigate to cart
      // navigate('/cart');
    } catch (err) {
      console.error('Error adding to cart:', err);
      const errorMessage = err.response?.data?.message || 'Failed to add item to cart. Please try again.';
      setAlertMessage(errorMessage);
      setAlertType('error');
      setShowAlert(true);
      
      // If stock error, update quantity to available stock
      if (err.response?.data?.availableStock !== undefined) {
        setQuantity(err.response.data.availableStock);
      }
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    const productIdToUse = productId || product?._id;
    if (!productIdToUse) {
      setAlertMessage('Product information is missing');
      setAlertType('error');
      setShowAlert(true);
      return;
    }

    // Check stock availability
    if (product?.stock !== undefined && product.stock === 0) {
      setAlertMessage('This product is out of stock');
      setAlertType('error');
      setShowAlert(true);
      return;
    }

    if (product?.stock !== undefined && quantity > product.stock) {
      setAlertMessage(`Only ${product.stock} items available in stock`);
      setAlertType('error');
      setShowAlert(true);
      setQuantity(product.stock);
      return;
    }

    try {
      // Add to cart first
      await addToCart(productIdToUse, quantity);
      
      // For unlogged users, navigate to cart page
      // For logged users, navigate to checkout
      if (!user) {
        navigate('/cart');
        setAlertMessage('Item added to cart! Continue shopping or proceed to checkout.');
        setAlertType('success');
        setShowAlert(true);
      } else {
        navigate('/checkout');
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      const errorMessage = err.response?.data?.message || 'Failed to add item to cart. Please try again.';
      setAlertMessage(errorMessage);
      setAlertType('error');
      setShowAlert(true);
      
      // If stock error, update quantity to available stock
      if (err.response?.data?.availableStock !== undefined) {
        setQuantity(err.response.data.availableStock);
      }
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-gray-400">Loading product details…</p>
        </div>
      </div>
    );
  }

  // Show error state if product not found
  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">Product not found</p>
          <Link to="/products" className="text-charcoal hover:underline">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        {/* Two-Column Layout Container - Responsive */}
        <div className="relative mb-12 sm:mb-16 grid gap-6 sm:gap-8 md:gap-12 md:grid-cols-12">
          {/* Left Column: Image Gallery - Sticky */}
          <div className="md:col-span-6">
            <div className="sticky top-24 h-fit">
              {/* Container with fixed width and centered - Responsive */}
              <div className="mx-auto w-full max-w-full md:w-[516px] space-y-4">
                {/* Main Image - Fixed dimensions: 516px x 550px - Responsive */}
                <div 
                  className="relative overflow-hidden rounded-lg bg-gray-100 w-full h-[400px] sm:h-[450px] md:w-[516px] md:h-[550px] cursor-pointer group"
                  onClick={() => openFullScreen(selectedImageIndex)}
                >
                  {thumbnails.map((src, index) => (
                    <img
                      key={index}
                      src={src}
                      alt={`${product.title} - View ${index + 1}`}
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                        selectedImageIndex === index ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                  ))}
                  {/* Click indicator */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-3">
                      <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Thumbnails - 3-column grid, matching main image width - Responsive */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full md:w-[516px]">
                  {thumbnails.map((src, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleThumbnailClick(index)}
                      onDoubleClick={() => openFullScreen(index)}
                      className={`overflow-hidden rounded-lg border-2 transition-colors cursor-pointer ${
                        selectedImageIndex === index ? 'border-charcoal' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={src}
                        alt={`Thumbnail ${index + 1}`}
                        className="aspect-square w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Product Details - Responsive */}
          <div className="md:col-span-6 space-y-6 sm:space-y-8">
            {/* Title with Wishlist Heart Icon */}
            <div className="flex items-start justify-between gap-3 sm:gap-4">
              <h1 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal flex-1">
                {product.title}
              </h1>
              <button
                type="button"
                onClick={handleWishlist}
                className="flex-shrink-0 cursor-pointer transition-transform hover:scale-110"
                aria-label="Add to wishlist"
              >
                {isWishlisted ? (
                  <svg
                    className="h-8 w-8 text-[#FF4D4D]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                ) : (
                  <svg
                    className="h-8 w-8 text-[#FF4D4D]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* Price - Responsive */}
            <div className="flex items-baseline gap-2 sm:gap-3">
              <span className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[#FF4D4D]">
                {formatPrice(product.price)}
              </span>
              {product.oldPrice && (
                <span className="text-sm sm:text-base md:text-lg text-gray-400 line-through">
                  {formatPrice(product.oldPrice)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-base leading-relaxed text-gray-700">{product.description}</p>

            {/* Color Selector - Image Boxes */}
            <div>
              <p className="mb-3 text-sm font-semibold text-gray-900">
                Color: <span className="font-normal text-gray-600">{selectedColor?.name || selectedColor}</span>
              </p>
              <div className="flex flex-wrap gap-3">
                {product.colors?.map((color, index) => {
                  const colorObj = typeof color === 'string' 
                    ? { name: color, image: product.images[index] || product.images[0] }
                    : color;
                  const isSelected = typeof selectedColor === 'string' 
                    ? selectedColor === colorObj.name
                    : selectedColor?.name === colorObj.name;
                  
                  return (
                    <button
                      key={colorObj.name}
                      type="button"
                      onClick={() => {
                        setSelectedColor(colorObj);
                        setColorClicked(true); // Mark that user clicked a color
                      }}
                      className={`relative overflow-hidden rounded-lg border-2 transition-colors ${
                        isSelected ? 'border-charcoal' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <img
                        src={colorObj.image}
                        alt={colorObj.name}
                        className="h-14 w-14 sm:h-16 sm:w-16 object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                        <p className="text-xs font-medium text-white text-center">{colorObj.name}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size Selector */}
            <div>
              <p className="mb-3 text-sm font-semibold text-gray-900">
                Size: <span className="font-normal text-gray-600">{selectedSize}</span>
              </p>
              <div className="flex flex-wrap gap-3">
                {product.sizes?.map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-colors ${
                      selectedSize === size
                        ? 'border-charcoal bg-charcoal text-white'
                        : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">Quantity</p>
                {product?.stock !== undefined && (
                  <p className={`text-sm font-medium ${
                    product.stock === 0 
                      ? 'text-red-600' 
                      : product.stock < 10 
                        ? 'text-amber-600' 
                        : 'text-green-600'
                  }`}>
                    {product.stock === 0 
                      ? 'Out of Stock' 
                      : `${product.stock} available`
                    }
                  </p>
                )}
              </div>
              <div className="inline-flex items-center rounded-lg border-2 border-gray-300">
                <button
                  type="button"
                  onClick={() => adjustQuantity(-1)}
                  disabled={quantity <= 1}
                  className="px-4 py-2 text-lg font-semibold text-gray-600 hover:text-charcoal transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  –
                </button>
                <span className="px-6 py-2 text-base font-semibold text-gray-900">{quantity}</span>
                <button
                  type="button"
                  onClick={() => adjustQuantity(1)}
                  disabled={product?.stock !== undefined && quantity >= product.stock}
                  className="px-4 py-2 text-lg font-semibold text-gray-600 hover:text-charcoal transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons - Side by Side - Responsive */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={addingToCart || (product?.stock !== undefined && product.stock === 0)}
                className="flex-1 rounded-lg bg-black px-4 py-3 sm:px-6 sm:py-4 text-xs sm:text-sm font-semibold uppercase tracking-wide text-white hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingToCart ? 'Adding...' : product?.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={product?.stock !== undefined && product.stock === 0}
                className="flex-1 rounded-lg bg-black px-4 py-3 sm:px-6 sm:py-4 text-xs sm:text-sm font-semibold uppercase tracking-wide text-white hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {product?.stock === 0 ? 'Out of Stock' : 'Buy Now'}
              </button>
            </div>

            {/* Specifications */}
            <section>
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Specifications</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>
                  <span className="font-semibold text-gray-900">Materials:</span>{' '}
                  {product.materials?.join(', ')}
                </li>
                <li>
                  <span className="font-semibold text-gray-900">Dimensions:</span> {product.dimensions}
                </li>
                <li>
                  <span className="font-semibold text-gray-900">Weight:</span> {product.weight}
                </li>
              </ul>
            </section>

            {/* Customer Reviews */}
            <section>
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Customer Reviews</h3>
              <div className="space-y-4">
                <p className="text-sm text-gray-500">No reviews yet. Be the first to review this product!</p>
              </div>
            </section>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="mt-20">
            <h2 className="mb-8 text-center font-display text-3xl font-bold text-charcoal">
              Related Products
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map(item => (
              <article
                key={item._id}
                className="flex flex-col rounded-lg border border-gray-200 bg-white overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Product Image - Large, square-ish */}
                <Link
                  to={`/products/${item._id}`}
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="block aspect-square overflow-hidden bg-gray-100"
                >
                  <img
                    src={item.images?.[0] || item.image}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    loading="lazy"
                  />
                </Link>

                {/* Product Info */}
                <div className="flex flex-col flex-1 p-6 space-y-4 text-center">
                  {/* Product Name - Serif font */}
                  <Link 
                    to={`/products/${item._id}`}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  >
                    <h3 className="font-display text-xl font-semibold text-charcoal hover:text-gray-600 transition-colors">
                      {item.title}
                    </h3>
                  </Link>

                  {/* Price - Red/Orange accent */}
                  <p className="text-2xl font-semibold text-[#FF4D4D]">
                    {formatPrice(item.price)}
                  </p>

                  {/* View Details Button - Full width, outlined */}
                  <Link
                    to={`/products/${item._id}`}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="mt-auto w-full rounded-lg border-2 border-charcoal px-6 py-3 text-center text-sm font-semibold uppercase tracking-wide text-charcoal hover:bg-charcoal hover:text-white transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </article>
              ))}
            </div>
          </section>
        )}

        {loading && (
          <div className="mt-6 text-center text-xs uppercase tracking-[0.4em] text-gray-400">
            Loading latest data…
          </div>
        )}
      </div>

      {/* Full Screen Image Viewer */}
      {isFullScreen && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeFullScreen}
        >
          {/* Close Button */}
          <button
            onClick={closeFullScreen}
            className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors p-2"
            aria-label="Close"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Previous Button */}
          {thumbnails.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors p-3 bg-black/50 rounded-full"
              aria-label="Previous image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Next Button */}
          {thumbnails.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors p-3 bg-black/50 rounded-full"
              aria-label="Next image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Main Image */}
          <div 
            className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {thumbnails[selectedImageIndex] && (
            <img
              src={thumbnails[selectedImageIndex]}
                alt={`${product?.title || 'Product'} - ${selectedColor?.name || ''} - View ${selectedImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  console.error('Image failed to load:', thumbnails[selectedImageIndex]);
                  e.target.style.display = 'none';
                }}
            />
            )}
          </div>

          {/* Image Counter - Moved to top */}
          {thumbnails.length > 1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 text-white bg-black/50 px-4 py-2 rounded-full text-sm">
              {selectedImageIndex + 1} / {thumbnails.length}
            </div>
          )}

          {/* Color Selector in Full Screen */}
          {product.colors && product.colors.length > 0 && (
            <div 
              className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-3 flex-wrap justify-center max-w-4xl px-4 mb-16"
              onClick={(e) => e.stopPropagation()}
            >
              {product.colors.map((color, index) => {
                const colorObj = typeof color === 'string' 
                  ? { name: color, image: product.images[index] || product.images[0] }
                  : color;
                const isSelected = typeof selectedColor === 'string' 
                  ? selectedColor === colorObj.name
                  : selectedColor?.name === colorObj.name;
                
                // Get color images for this color
                const colorImages = colorObj.images && colorObj.images.length > 0 
                  ? colorObj.images.filter(img => img && img.trim())
                  : (colorObj.image ? [colorObj.image] : []);
                
                return (
                  <button
                    key={`${colorObj.name}-${index}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedColor(colorObj);
                      setColorClicked(true);
                      setSelectedImageIndex(0);
                    }}
                    className={`relative overflow-hidden rounded-lg border-2 transition-all ${
                      isSelected ? 'border-white scale-110 shadow-lg' : 'border-white/50 hover:border-white/80'
                    }`}
                    title={`View ${colorObj.name} images (${colorImages.length} available)`}
                  >
                    <img
                      src={colorObj.image || product.images[0]}
                      alt={colorObj.name}
                      className="h-16 w-16 object-cover"
                      onError={(e) => {
                        e.target.src = product.images[0] || '';
                      }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1">
                      <p className="text-xs font-medium text-white text-center">{colorObj.name}</p>
                    </div>
                    {colorImages.length > 1 && (
                      <div className="absolute top-1 right-1 bg-white/90 rounded-full px-1.5 py-0.5">
                        <span className="text-xs font-semibold text-black">{colorImages.length}</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* Success/Error Alert */}
      <SuccessAlert
        message={alertMessage}
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        type={alertType}
      />
    </div>
  );
}
