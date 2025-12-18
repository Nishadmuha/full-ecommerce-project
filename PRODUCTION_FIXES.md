# Production Fixes Required

## Issues Found

1. **401 Unauthorized on Cart API** - Backend needs to be redeployed with latest code
2. **Image URLs pointing to localhost** - Fixed with imageUrl utility
3. **CORS configuration** - Needs to include production frontend URL

## Fixes Applied

### 1. Image URL Utility (`frontend/src/utils/imageUrl.js`)
- Created utility to handle image URLs in both dev and production
- Automatically replaces localhost URLs with production backend URL
- Handles both relative and absolute URLs

### 2. Updated Files
- `frontend/src/pages/Account.jsx` - Uses imageUrl utility
- `frontend/src/pages/admin/Products.jsx` - Uses imageUrl utility

## Required Actions

### 1. Backend Deployment (CRITICAL)
The backend on Render needs to be redeployed with the latest code that includes:
- `optionalAuth` middleware for cart routes
- Updated CORS configuration with `x-guest-id` header
- Guest cart support

**Steps:**
1. Push latest backend code to GitHub
2. Redeploy backend on Render
3. Verify backend is using `optionalAuth` for cart routes

### 2. Environment Variables
Make sure your production frontend has:
```env
VITE_API_URL=https://full-ecommerce-project-u69s.onrender.com/api
```

### 3. Backend CORS Update
Update `backend/server.js` CORS to include production frontend:
```javascript
origin: [
  "http://localhost:5173",
  "https://full-ecommerce-project-kappa.vercel.app"
],
allowedHeaders: "Content-Type,Authorization,x-guest-id",
```

### 4. Image URL Fix
All image URLs stored in database with localhost need to be updated, OR use the imageUrl utility when displaying.

## Testing After Fixes

1. Clear browser cache
2. Test guest cart functionality
3. Verify images load from production backend
4. Check no 401 errors in console

