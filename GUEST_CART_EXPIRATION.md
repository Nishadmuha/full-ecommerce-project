# Guest Cart Auto-Expiration Feature

## Overview
Guest cart data automatically expires and is deleted after 5 minutes of inactivity to prevent database bloat from abandoned carts.

## How It Works

### 1. Last Activity Tracking
- Every guest cart has a `lastActivity` timestamp field
- This timestamp is updated whenever:
  - Cart is retrieved (GET /api/cart)
  - Item is added to cart (POST /api/cart)
  - Item quantity is updated (PUT /api/cart/:itemId)
  - Item is removed from cart (DELETE /api/cart/:itemId)
  - Cart is cleared (DELETE /api/cart)

### 2. Automatic Cleanup
- A background job runs every 2 minutes
- It checks for guest carts with `lastActivity` older than 5 minutes
- These expired carts are automatically deleted
- Only guest carts are affected (user carts are preserved)

### 3. Implementation Details

**Cart Model:**
- Added `lastActivity: Date` field (defaults to current time)

**Cleanup Job:**
- Location: `backend/utils/cartCleanup.js`
- Runs every 2 minutes
- Deletes guest carts inactive for 5+ minutes
- Logs cleanup activity

**Cart Controller:**
- All cart operations update `lastActivity` for guest carts
- Helper function `updateGuestCartActivity()` ensures consistency

## Configuration

### Expiration Time
Currently set to **5 minutes** of inactivity.

To change, modify in `backend/utils/cartCleanup.js`:
```javascript
const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
// Change 5 to desired minutes
```

### Cleanup Frequency
Currently runs **every 2 minutes**.

To change, modify in `backend/utils/cartCleanup.js`:
```javascript
setInterval(() => {
  cleanupExpiredGuestCarts();
}, 2 * 60 * 1000); // Change 2 to desired minutes
```

## Benefits

1. **Database Cleanup**: Prevents accumulation of abandoned guest carts
2. **Performance**: Keeps database size manageable
3. **Automatic**: No manual intervention required
4. **Safe**: Only affects guest carts, user carts are preserved

## Testing

### Test Expiration
1. Add items to cart as guest user
2. Wait 5+ minutes without any cart activity
3. Check database - cart should be deleted
4. Check server logs - should show cleanup message

### Test Activity Reset
1. Add items to cart as guest user
2. Wait 4 minutes
3. Add another item (resets timer)
4. Wait 4 more minutes
5. Cart should still exist (timer was reset)

## Logs

The cleanup job logs:
- Number of carts deleted: `🧹 Cleaned up X expired guest cart(s)`
- Errors: `❌ Error cleaning up expired guest carts: [error]`
- Startup: `✅ Guest cart cleanup job started (runs every 2 minutes)`

## Notes

- User carts (authenticated users) are never deleted
- Only guest carts with `guestId` are subject to expiration
- The cleanup job starts automatically when the server starts
- No impact on active shopping sessions

