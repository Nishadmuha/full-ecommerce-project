# Complete Project Testing Checklist

## Pre-Testing Setup

### Backend Setup
- [ ] MongoDB connection configured
- [ ] Environment variables set (.env file)
- [ ] Razorpay keys configured (if using payment)
- [ ] Backend server starts without errors
- [ ] Port 5000 is available

### Frontend Setup
- [ ] All dependencies installed
- [ ] Frontend server starts without errors
- [ ] Port 5173 is available
- [ ] API URL configured correctly

---

## 1. Guest User Functionality (No Login Required)

### Product Browsing
- [ ] Can view product list page
- [ ] Can view product details page
- [ ] Product images load correctly
- [ ] Stock quantity displays correctly
- [ ] Price displays correctly

### Add to Cart (Guest)
- [ ] Can add product to cart without login
- [ ] No login warning/redirect appears
- [ ] Success alert shows after adding to cart
- [ ] Stock validation works (can't add more than available)
- [ ] Quantity selector respects stock limits

### Cart Page (Guest)
- [ ] Can access cart page without login
- [ ] Cart icon in header works without login
- [ ] Cart items display correctly
- [ ] Stock availability shows for each item
- [ ] Can increase/decrease quantity (within stock limits)
- [ ] Can remove items from cart
- [ ] Total price calculates correctly
- [ ] "Proceed to Checkout" button works

### Buy Now Button (Guest)
- [ ] "Buy Now" button works without login
- [ ] Adds product to cart
- [ ] Navigates to cart page (not checkout)
- [ ] Shows success message

### Checkout (Guest)
- [ ] Can access checkout page without login
- [ ] Email field appears for guest users
- [ ] Can fill shipping address form
- [ ] Can select payment method (Razorpay/COD)
- [ ] Can place order as guest
- [ ] Order creates successfully
- [ ] Stock decreases after order placement

---

## 2. Stock Management

### Stock Display
- [ ] Product details show available stock
- [ ] Cart shows available stock for each item
- [ ] Stock colors: Green (>10), Amber (<10), Red (0)

### Stock Validation
- [ ] Can't add more items than available stock
- [ ] Quantity selector maxes out at available stock
- [ ] Error message shows when stock insufficient
- [ ] Stock updates in real-time across users

### Stock Deduction
- [ ] Stock decreases when item added to cart (optional - can be on order)
- [ ] Stock decreases when order is placed
- [ ] Multiple users see correct available stock
- [ ] Example: Admin sets 30, User A buys 10, User B sees 20

---

## 3. Authenticated User Functionality

### Login/Register
- [ ] Can register new account
- [ ] Can login with email/password
- [ ] Can login with Google OAuth
- [ ] Login modal works correctly
- [ ] Success alerts show on login/register

### Cart (Logged In)
- [ ] Can add to cart when logged in
- [ ] Cart persists after login
- [ ] Can merge guest cart with user cart (if implemented)

### Checkout (Logged In)
- [ ] Email field pre-filled from user account
- [ ] Name field pre-filled from user account
- [ ] Can place order
- [ ] Order appears in order history

### Wishlist
- [ ] Can add to wishlist (requires login)
- [ ] Can remove from wishlist
- [ ] Wishlist page shows items correctly

---

## 4. Custom Alert Notifications

### Success Alerts
- [ ] Success alerts appear centered
- [ ] Smooth animations work
- [ ] Auto-close after 3 seconds
- [ ] "Got it" button works

### Error Alerts
- [ ] Error alerts appear with red styling
- [ ] Error messages are clear
- [ ] Auto-close after 3 seconds

### Confirmation Dialogs
- [ ] Delete confirmation appears for cart items
- [ ] Delete confirmation appears for wishlist items
- [ ] Cancel and Confirm buttons work
- [ ] Smooth animations

---

## 5. Payment Integration

### Razorpay
- [ ] Razorpay order creates successfully
- [ ] Payment modal opens
- [ ] Payment verification works
- [ ] Order updates after successful payment
- [ ] Cart clears after payment

### COD (Cash on Delivery)
- [ ] COD option available
- [ ] Order creates with COD payment method
- [ ] Payment status set correctly

---

## 6. Admin Functionality

### Product Management
- [ ] Can add new product
- [ ] Can upload product images
- [ ] Can set stock quantity
- [ ] Can edit product
- [ ] Can delete product
- [ ] Stock field works correctly

### Order Management
- [ ] Can view all orders
- [ ] Can update order status
- [ ] Can view order details

---

## 7. UI/UX Testing

### Responsive Design
- [ ] Mobile view works
- [ ] Tablet view works
- [ ] Desktop view works
- [ ] Navigation menu responsive

### Animations
- [ ] Page transitions smooth
- [ ] Hero banner animations work
- [ ] Product card hover effects
- [ ] Alert animations smooth

### Performance
- [ ] Pages load quickly
- [ ] Images optimize correctly
- [ ] No console errors
- [ ] No CORS errors

---

## 8. Edge Cases

### Stock Edge Cases
- [ ] Product with 0 stock shows "Out of Stock"
- [ ] Can't add out of stock items
- [ ] Stock updates correctly when multiple users purchase
- [ ] Race condition handling (if two users buy last item)

### Cart Edge Cases
- [ ] Empty cart shows correct message
- [ ] Cart persists across page refreshes (for logged in)
- [ ] Guest cart works with localStorage
- [ ] Can't add more than available stock

### Error Handling
- [ ] Network errors handled gracefully
- [ ] API errors show user-friendly messages
- [ ] Invalid product IDs handled
- [ ] Invalid cart operations handled

---

## 9. Browser Compatibility

- [ ] Chrome
- [ ] Firefox
- [ ] Edge
- [ ] Safari (if available)

---

## 10. Security Testing

- [ ] CORS configured correctly
- [ ] Guest ID header allowed
- [ ] Authentication tokens work
- [ ] Admin routes protected
- [ ] User can only see own orders

---

## Quick Test Scenarios

### Scenario 1: Guest Purchase Flow
1. Open website (not logged in)
2. Browse products
3. Click on a product
4. Add to cart
5. Click cart icon
6. Review cart
7. Click "Proceed to Checkout"
8. Fill shipping address (including email)
9. Select payment method
10. Place order
11. Verify order created

### Scenario 2: Stock Management
1. Admin sets product stock to 30
2. User A adds 10 to cart
3. User B views same product (should see 20 available)
4. User A purchases 10
5. User B should see 20 available
6. User B can purchase up to 20

### Scenario 3: Buy Now Flow
1. Guest user clicks "Buy Now"
2. Product added to cart
3. Navigates to cart page (not checkout)
4. Can proceed to checkout from cart

---

## Notes
- Test with browser console open to catch errors
- Test with network throttling to check performance
- Test with different screen sizes
- Clear browser cache if issues occur

