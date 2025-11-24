// frontend/src/pages/WishlistPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getWishlist, removeFromWishlist } from '../api/wishlistApi';

const formatPrice = value => `₹${Number(value).toLocaleString('en-IN')}`;

export default function WishlistPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchWishlist();
  }, [user, navigate]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await getWishlist();
      setWishlistItems(response.data.products || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setError('Failed to load wishlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Remove item from wishlist
  const removeItem = async (productId) => {
    if (!confirm('Are you sure you want to remove this item from your wishlist?')) {
      return;
    }

    try {
      await removeFromWishlist(productId);
      // Refresh wishlist after removal
      fetchWishlist();
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      alert('Failed to remove item. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">Loading wishlist...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        {/* Page Header */}
        <header className="my-12 text-center">
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal">
            Your Wishlist
          </h1>
        </header>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Empty State */}
        {wishlistItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="mb-6 text-lg text-gray-600">Your wishlist is empty</p>
            <Link
              to="/products"
              className="rounded-lg bg-charcoal px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white hover:bg-gray-800 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          /* Grid Layout: Responsive 3 columns desktop, 2 tablet, 1 mobile */
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
            {wishlistItems.map(product => (
              <article
                key={product._id}
                className="flex flex-col rounded-lg border border-gray-200 bg-white overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Image: Large, rectangular/square aspect ratio */}
                <Link to={`/products/${product._id}`} className="relative w-full aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={product.image || 'https://via.placeholder.com/400'}
                    alt={product.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </Link>

                {/* Content: Below Image */}
                <div className="flex flex-col flex-1 p-4 sm:p-6">
                  {/* Product Name: Serif font, dark color */}
                  <Link to={`/products/${product._id}`}>
                    <h3 className="mb-2 font-display text-lg font-semibold text-gray-900 hover:text-charcoal transition-colors">
                      {product.title}
                    </h3>
                  </Link>

                  {/* Price: Red color */}
                  <p className="mb-4 text-lg font-semibold text-[#FF4D4D]">
                    {formatPrice(product.price || 0)}
                  </p>

                  {/* Remove Button: Below price, left-aligned */}
                  <button
                    type="button"
                    onClick={() => removeItem(product._id)}
                    className="mt-auto flex items-center gap-2 self-start text-sm text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    <span>Remove</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
