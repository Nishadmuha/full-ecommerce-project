import api from './api';
import { getGuestId } from '../utils/guestId';

// Get user's cart (authenticated or guest)
export const getCart = () => {
  const guestId = getGuestId();
  return api.get('/cart', {
    headers: {
      'x-guest-id': guestId
    }
  });
};

// Add item to cart (authenticated or guest)
export const addToCart = (productId, quantity = 1) => {
  const guestId = getGuestId();
  return api.post('/cart', { productId, quantity, guestId });
};

// Update item quantity (authenticated or guest)
export const updateQuantity = (itemId, quantity) => {
  const guestId = getGuestId();
  return api.put(`/cart/${itemId}`, { quantity, guestId });
};

// Remove item from cart (authenticated or guest)
export const removeFromCart = (itemId) => {
  const guestId = getGuestId();
  return api.delete(`/cart/${itemId}`, { data: { guestId } });
};

// Clear entire cart (authenticated or guest)
export const clearCart = () => {
  const guestId = getGuestId();
  return api.delete('/cart', { data: { guestId } });
};












