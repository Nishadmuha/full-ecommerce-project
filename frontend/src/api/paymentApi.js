import api from './api';
import { getGuestId } from '../utils/guestId';

// Create Razorpay order
export const createRazorpayOrder = (address) => {
  const guestId = getGuestId();
  const token = localStorage.getItem('token');
  
  // For guest users, extract email and name from address
  const requestData = {
    address,
    guestId
  };
  
  // If user is not logged in, add guest email and name from address
  if (!token) {
    requestData.guestEmail = address.email || '';
    requestData.guestName = address.fullName || '';
  }
  
  return api.post('/payment/create-order', requestData);
};

// Verify payment
export const verifyPayment = (paymentData) => {
  return api.post('/payment/verify', paymentData);
};

// Get payment status
export const getPaymentStatus = (orderId) => {
  return api.get(`/payment/status/${orderId}`);
};


