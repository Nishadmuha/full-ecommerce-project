import api from './api';
import { getGuestId } from '../utils/guestId';

// Get user's orders
export const getUserOrders = () => api.get('/orders');

// Get order by ID
export const getOrderById = (orderId) => api.get(`/orders/${orderId}`);

// Create order from cart (authenticated or guest)
export const createOrder = (address, paymentMethod = 'cod') => {
  const guestId = getGuestId();
  const orderData = {
    address,
    paymentMethod,
    guestId
  };
  
  // For guest orders, include email and name
  if (!address.email && address.fullName) {
    orderData.guestEmail = address.email || '';
    orderData.guestName = address.fullName;
  }
  
  return api.post('/orders', orderData);
};












