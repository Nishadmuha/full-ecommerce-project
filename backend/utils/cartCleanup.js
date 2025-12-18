// Utility to clean up expired guest carts
const Cart = require('../models/Cart');

/**
 * Delete guest carts that haven't been updated in the last 5 minutes
 * This prevents database bloat from abandoned guest carts
 */
const cleanupExpiredGuestCarts = async () => {
  try {
    // Check if mongoose is connected
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      // Database not connected yet, skip cleanup
      return 0;
    }
    
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    // Delete guest carts with no activity in the last 5 minutes
    // Also handle carts without lastActivity (old carts) - set them to expire after 5 min from now
    const result = await Cart.deleteMany({
      guestId: { $exists: true, $ne: null },
      $or: [
        { lastActivity: { $lt: fiveMinutesAgo } },
        { lastActivity: { $exists: false } } // Old carts without lastActivity field
      ]
    });
    
    if (result.deletedCount > 0) {
      console.log(`🧹 Cleaned up ${result.deletedCount} expired guest cart(s)`);
    }
    
    return result.deletedCount;
  } catch (error) {
    console.error('❌ Error cleaning up expired guest carts:', error);
    return 0;
  }
};

/**
 * Start periodic cleanup job
 * Runs every 2 minutes to check for expired carts
 */
const startCartCleanupJob = () => {
  // Run cleanup immediately on start
  cleanupExpiredGuestCarts();
  
  // Then run every 2 minutes
  setInterval(() => {
    cleanupExpiredGuestCarts();
  }, 2 * 60 * 1000); // 2 minutes in milliseconds
  
  console.log('✅ Guest cart cleanup job started (runs every 2 minutes)');
};

module.exports = {
  cleanupExpiredGuestCarts,
  startCartCleanupJob
};

