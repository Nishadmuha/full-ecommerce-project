# Razorpay Payment Integration Setup Guide

## Prerequisites
1. Razorpay account (Sign up at https://razorpay.com/)
2. Access to Razorpay Dashboard

## Setup Steps

### 1. Get Razorpay API Keys

1. Log in to your Razorpay Dashboard: https://dashboard.razorpay.com/
2. Go to **Settings** → **API Keys**
3. Generate **Test Keys** for development (or **Live Keys** for production)
4. Copy your **Key ID** and **Key Secret**

### 2. Configure Environment Variables

Add the following to your `backend/.env` file:

```env
RAZORPAY_KEY_ID=your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here
```

**Example:**
```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key_here
```

### 3. Restart Backend Server

After adding the environment variables, restart your backend server:

```bash
cd backend
npm start
# or
npm run dev
```

### 4. Test Payment Flow

1. Add items to cart
2. Go to checkout
3. Fill in shipping address
4. Select "Razorpay" as payment method
5. Click "Place Order"
6. Razorpay payment popup will open
7. Use Razorpay test cards for testing:
   - **Card Number:** 4111 1111 1111 1111
   - **Expiry:** Any future date (e.g., 12/25)
   - **CVV:** Any 3 digits (e.g., 123)
   - **Name:** Any name

### 5. Test Cards for Development

Razorpay provides test cards for different scenarios:

**Success:**
- Card: 4111 1111 1111 1111
- CVV: Any 3 digits
- Expiry: Any future date

**Failure:**
- Card: 4000 0000 0000 0002
- CVV: Any 3 digits
- Expiry: Any future date

**3D Secure:**
- Card: 5267 3181 8797 5449
- CVV: Any 3 digits
- Expiry: Any future date

### 6. Production Setup

When ready for production:

1. Switch to **Live Mode** in Razorpay Dashboard
2. Generate **Live API Keys**
3. Update your `.env` file with live keys
4. Update the Razorpay key in frontend if needed (currently fetched from backend)

## Payment Flow

1. **User clicks "Place Order"**
   - Frontend calls `/api/payment/create-order`
   - Backend creates order in database and Razorpay order
   - Returns Razorpay order details to frontend

2. **Razorpay Checkout Opens**
   - User enters payment details
   - Razorpay processes payment

3. **Payment Success**
   - Razorpay returns payment details
   - Frontend calls `/api/payment/verify`
   - Backend verifies payment signature
   - Order is confirmed and cart is cleared

4. **Payment Failure**
   - User can retry payment
   - Order remains in pending state

## Features

- ✅ Secure payment processing via Razorpay
- ✅ Payment signature verification
- ✅ Support for multiple payment methods (Cards, UPI, Net Banking, Wallets)
- ✅ Cash on Delivery (COD) option
- ✅ Order tracking with payment status
- ✅ Automatic cart clearing after successful payment

## Troubleshooting

### Payment not working?
1. Check if Razorpay keys are correctly set in `.env`
2. Verify backend server is running
3. Check browser console for errors
4. Ensure Razorpay script is loading (check Network tab)

### Payment verification failing?
1. Check Razorpay webhook logs in dashboard
2. Verify signature generation matches Razorpay's algorithm
3. Check order ID matches between frontend and backend

### Need help?
- Razorpay Documentation: https://razorpay.com/docs/
- Razorpay Support: support@razorpay.com


