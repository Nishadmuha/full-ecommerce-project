import api from './api';
import { getGuestId } from '../utils/guestId';

// Create Razorpay order
export const createRazorpayOrder = (address) => {
  const guestId = getGuestId();
  return api.post('/payment/create-order', { address, guestId });
};

// Verify payment
export const verifyPayment = (paymentData) => {
  return api.post('/payment/verify', paymentData);
};

// Get payment status
export const getPaymentStatus = (orderId) => {
  return api.get(`/payment/status/${orderId}`);
};


