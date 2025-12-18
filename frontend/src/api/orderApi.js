import api from './api';

// Get user's orders
export const getUserOrders = () => api.get('/orders');

// Get order by ID
export const getOrderById = (orderId) => api.get(`/orders/${orderId}`);

// Create order from cart
export const createOrder = (address) => api.post('/orders', { address });












