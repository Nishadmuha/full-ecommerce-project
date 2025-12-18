import api from './api';

// Get user's wishlist
export const getWishlist = () => api.get('/wishlist');

// Add product to wishlist
export const addToWishlist = (productId) => 
  api.post('/wishlist', { productId });

// Remove product from wishlist
export const removeFromWishlist = (productId) => 
  api.delete(`/wishlist/${productId}`);












