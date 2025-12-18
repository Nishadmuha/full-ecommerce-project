# Quick Test Guide

## Prerequisites
1. Ensure MongoDB is running and accessible
2. Set environment variables in `.env`:
   - `MONGO_URI` - MongoDB connection string
   - `JWT_SECRET` - Secret for JWT tokens
   - `GOOGLE_CLIENT_ID` - (Optional) Google OAuth client ID
   - `PORT` - (Optional) Server port (default: 5000)

## Running the Tests

### Backend Tests
```bash
cd backend
npm install
npm start  # Start the server
```

In another terminal:
```bash
# Install axios if needed
npm install axios

# Run comprehensive test suite
node test-project.js
```

### Manual Testing Checklist

#### Authentication
- [ ] Register new user
- [ ] Login with credentials
- [ ] Login with invalid credentials (should fail)
- [ ] Google OAuth (if configured)

#### Products
- [ ] Get all products
- [ ] Get product categories
- [ ] Search products
- [ ] Filter by category
- [ ] Sort products
- [ ] Get single product

#### Cart
- [ ] Get cart (should create empty cart if none)
- [ ] Add item to cart
- [ ] Update item quantity
- [ ] Remove item from cart
- [ ] Clear cart

#### Wishlist
- [ ] Get wishlist
- [ ] Add product to wishlist
- [ ] Remove product from wishlist

#### Orders
- [ ] Create order from cart
- [ ] Get user orders
- [ ] Get order by ID

#### User Profile
- [ ] Get profile
- [ ] Update profile
- [ ] Update password
- [ ] Delete account

#### Home & Collections
- [ ] Get home data (banners, collections, bestsellers, new arrivals)
- [ ] Get all collections
- [ ] Get collection by ID
- [ ] Get collection by slug

#### Admin (requires admin token)
- [ ] Get dashboard stats
- [ ] Manage users
- [ ] Manage orders
- [ ] Manage products
- [ ] Manage coupons
- [ ] Manage complaints
- [ ] Manage categories
- [ ] Manage banners

## Frontend Testing

### Start Frontend
```bash
cd frontend
npm install
npm run dev
```

### Test Frontend Features
1. **Navigation**
   - [ ] All routes accessible
   - [ ] Header/Footer visible on public pages
   - [ ] Admin layout on admin pages

2. **Authentication**
   - [ ] Login page works
   - [ ] Register page works
   - [ ] Login modal appears when needed
   - [ ] Logout works

3. **Products**
   - [ ] Product list displays
   - [ ] Product details page works
   - [ ] Search and filters work
   - [ ] Add to cart from product page

4. **Cart**
   - [ ] Cart page displays items
   - [ ] Update quantities
   - [ ] Remove items
   - [ ] Proceed to checkout

5. **Checkout**
   - [ ] Address form works
   - [ ] Order creation works
   - [ ] Cart clears after order

6. **Orders**
   - [ ] Order list displays
   - [ ] Order details page works

7. **Account**
   - [ ] Profile displays
   - [ ] Profile update works
   - [ ] Password change works

8. **Wishlist**
   - [ ] Wishlist displays
   - [ ] Add/remove from wishlist works

## Common Issues & Solutions

### Backend won't start
- Check MongoDB connection
- Verify MONGO_URI in .env
- Check if port 5000 is available

### Authentication fails
- Verify JWT_SECRET is set
- Check token in localStorage
- Verify token format in Authorization header

### CORS errors
- Verify CORS origin matches frontend URL
- Check credentials setting

### Database errors
- Verify MongoDB is running
- Check connection string format
- Verify network access to MongoDB

## Test Results

After running all tests, you should see:
- ✅ All authentication tests passing
- ✅ All product tests passing
- ✅ All cart tests passing
- ✅ All wishlist tests passing
- ✅ All order tests passing
- ✅ All user profile tests passing
- ✅ All home/collections tests passing

If any tests fail, check the error messages in the test output for details.




