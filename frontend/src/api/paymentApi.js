import api from './api';

// Create Razorpay order
export const createRazorpayOrder = (address) => {
  return api.post('/payment/create-order', { address });
};

// Verify payment
export const verifyPayment = (paymentData) => {
  return api.post('/payment/verify', paymentData);
};

// Get payment status
export const getPaymentStatus = (orderId) => {
  return api.get(`/payment/status/${orderId}`);
};


