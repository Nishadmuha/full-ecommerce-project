# Quick Test Guide

## Starting the Project

### Step 1: Start Backend Server
```bash
cd backend
npm start
# or for development with auto-reload:
npm run dev
```

**Expected Output:**
- Server should start on port 5000
- MongoDB connection successful
- No errors in console

### Step 2: Start Frontend Server
Open a new terminal:
```bash
cd frontend
npm run dev
```

**Expected Output:**
- Server should start on port 5173
- Open http://localhost:5173 in browser
- No CORS errors in console

---

## Quick Test Steps

### Test 1: Guest User - Add to Cart (No Login)
1. Open http://localhost:5173
2. Click on "Products" or browse homepage
3. Click on any product
4. Click "Add to Cart" button
5. ✅ Should see success alert (no login required)
6. Click cart icon in header
7. ✅ Should see product in cart

### Test 2: Guest User - Buy Now
1. Go to any product page
2. Click "Buy Now" button
3. ✅ Should navigate to cart page (not checkout)
4. ✅ Should see success message

### Test 3: Stock Management
1. Login as admin
2. Go to Admin > Products
3. Edit a product and set stock to 30
4. Save product
5. Open product in new incognito window (as guest)
6. ✅ Should see "30 available" in stock
7. Add 10 items to cart
8. Open same product in another incognito window
9. ✅ Should see "20 available" (if stock deducts on cart) or still 30 (if stock deducts on order)

### Test 4: Guest Checkout
1. As guest user, add items to cart
2. Click "Proceed to Checkout"
3. ✅ Should see checkout page (no login required)
4. Fill in shipping address (including email for guest)
5. Select payment method
6. Place order
7. ✅ Order should be created successfully

### Test 5: Stock Validation
1. Set product stock to 5
2. Try to add 10 items to cart
3. ✅ Should show error: "Only 5 items available"
4. Quantity should auto-adjust to 5

### Test 6: Custom Alerts
1. Add item to cart
2. ✅ Should see centered success alert with animation
3. Alert should auto-close after 3 seconds
4. Try to remove item from cart
5. ✅ Should see confirmation dialog
6. Click "Remove"
7. ✅ Should see success alert

---

## Common Issues & Solutions

### Issue: CORS Error
**Solution:** 
- Check backend/server.js has `x-guest-id` in allowedHeaders
- Restart backend server

### Issue: Cart Not Loading
**Solution:**
- Check browser console for errors
- Verify backend is running on port 5000
- Check API URL in frontend/.env

### Issue: Stock Not Updating
**Solution:**
- Verify product has stock field set
- Check backend cart controller stock validation
- Clear browser cache

### Issue: Guest ID Not Working
**Solution:**
- Check localStorage for 'guestId'
- Verify CORS allows 'x-guest-id' header
- Check browser console for errors

---

## Browser Console Checks

Open browser DevTools (F12) and check:

### Console Tab
- ✅ No red errors
- ✅ API Configuration shows correct base URL
- ✅ No CORS errors

### Network Tab
- ✅ Cart requests include 'x-guest-id' header
- ✅ API requests return 200 status
- ✅ No failed requests

---

## Test Checklist Summary

✅ Guest can browse products
✅ Guest can add to cart (no login)
✅ Guest can view cart (no login)
✅ Guest can checkout (no login)
✅ Buy Now navigates to cart for guests
✅ Stock displays correctly
✅ Stock validation works
✅ Stock decreases on purchase
✅ Custom alerts work
✅ Confirmation dialogs work
✅ No login warnings for cart/checkout

---

## Performance Check

1. Page load time < 3 seconds
2. API responses < 500ms
3. Smooth animations
4. No lag when adding to cart
5. Images load quickly

---

## Final Verification

Run through the complete flow:
1. Guest user adds product to cart
2. Views cart
3. Proceeds to checkout
4. Fills address
5. Places order
6. Verifies order created
7. Checks stock decreased

If all steps work, the project is ready! 🎉

