import api from './api';

// Get user's cart
export const getCart = () => api.get('/cart');

// Add item to cart
export const addToCart = (productId, quantity = 1) => 
  api.post('/cart', { productId, quantity });

// Update item quantity
export const updateQuantity = (itemId, quantity) => 
  api.put(`/cart/${itemId}`, { quantity });

// Remove item from cart
export const removeFromCart = (itemId) => 
  api.delete(`/cart/${itemId}`);

// Clear entire cart
export const clearCart = () => 
  api.delete('/cart');












