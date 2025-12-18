/**
 * Comprehensive Test Script for MERN E-commerce Project
 * Tests all backend routes, controllers, and frontend API calls
 */

const axios = require('axios');

// Simple color functions (no external dependency)
const colors = {
  blue: (msg) => `\x1b[34m${msg}\x1b[0m`,
  green: (msg) => `\x1b[32m${msg}\x1b[0m`,
  red: (msg) => `\x1b[31m${msg}\x1b[0m`,
  yellow: (msg) => `\x1b[33m${msg}\x1b[0m`,
  cyan: (msg) => `\x1b[36m${msg}\x1b[0m`,
  bold: {
    cyan: (msg) => `\x1b[1m\x1b[36m${msg}\x1b[0m`,
    green: (msg) => `\x1b[1m\x1b[32m${msg}\x1b[0m`,
    red: (msg) => `\x1b[1m\x1b[31m${msg}\x1b[0m`
  }
};

// Configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:5000/api';
let authToken = '';
let userId = '';
let productId = '';
let cartItemId = '';
let orderId = '';

// Test results
const results = {
  passed: 0,
  failed: 0,
  errors: []
};

// Helper functions
const log = {
  info: (msg) => console.log(colors.blue('ℹ'), msg),
  success: (msg) => console.log(colors.green('✓'), msg),
  error: (msg) => console.log(colors.red('✗'), msg),
  warning: (msg) => console.log(colors.yellow('⚠'), msg),
  test: (msg) => console.log(colors.cyan('\n▶'), colors.bold(msg))
};

const test = async (name, fn) => {
  try {
    log.test(name);
    await fn();
    results.passed++;
    log.success(`${name} - PASSED`);
  } catch (error) {
    results.failed++;
    results.errors.push({ test: name, error: error.message });
    log.error(`${name} - FAILED: ${error.message}`);
  }
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(config => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

// ==================== AUTHENTICATION TESTS ====================

async function testAuthentication() {
  await test('Register new user', async () => {
    const response = await api.post('/auth/register', {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123'
    });
    if (!response.data.token || !response.data.user) {
      throw new Error('Registration failed - missing token or user data');
    }
    authToken = response.data.token;
    userId = response.data.user.id;
    log.info(`Registered user: ${response.data.user.email}`);
  });

  await test('Login with credentials', async () => {
    const response = await api.post('/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    if (!response.data.token) {
      throw new Error('Login failed - missing token');
    }
    authToken = response.data.token;
    log.info('Login successful');
  });

  await test('Login with invalid credentials', async () => {
    try {
      await api.post('/auth/login', {
        email: 'invalid@example.com',
        password: 'wrongpassword'
      });
      throw new Error('Should have failed with invalid credentials');
    } catch (error) {
      if (error.response?.status !== 400) {
        throw new Error('Expected 400 status for invalid credentials');
      }
    }
  });
}

// ==================== PRODUCT TESTS ====================

async function testProducts() {
  await test('Get all products', async () => {
    const response = await api.get('/products');
    if (!Array.isArray(response.data)) {
      throw new Error('Products should be an array');
    }
    log.info(`Found ${response.data.length} products`);
  });

  await test('Get product categories', async () => {
    const response = await api.get('/products/categories');
    if (!Array.isArray(response.data)) {
      throw new Error('Categories should be an array');
    }
    log.info(`Found ${response.data.length} categories`);
  });

  await test('Search products', async () => {
    const response = await api.get('/products?search=test');
    if (!Array.isArray(response.data)) {
      throw new Error('Search results should be an array');
    }
  });

  await test('Filter products by category', async () => {
    const response = await api.get('/products?category=electronics');
    if (!Array.isArray(response.data)) {
      throw new Error('Filtered products should be an array');
    }
  });

  await test('Sort products by price', async () => {
    const response = await api.get('/products?sort=price-asc');
    if (!Array.isArray(response.data)) {
      throw new Error('Sorted products should be an array');
    }
  });

  // Note: Product creation/update/delete requires admin token
}

// ==================== CART TESTS ====================

async function testCart() {
  // First, get a product to add to cart
  await test('Get product for cart', async () => {
    const response = await api.get('/products');
    if (response.data.length > 0) {
      productId = response.data[0]._id;
      log.info(`Using product: ${productId}`);
    } else {
      throw new Error('No products available for cart testing');
    }
  });

  await test('Get user cart', async () => {
    const response = await api.get('/cart');
    if (!response.data || !response.data.items) {
      throw new Error('Cart should have items array');
    }
    log.info(`Cart has ${response.data.items.length} items`);
  });

  await test('Add item to cart', async () => {
    if (!productId) throw new Error('No product ID available');
    const response = await api.post('/cart', {
      productId,
      quantity: 2
    });
    if (!response.data || !response.data.items) {
      throw new Error('Cart should have items after adding');
    }
    cartItemId = response.data.items[response.data.items.length - 1]._id;
    log.info(`Added product to cart: ${cartItemId}`);
  });

  await test('Update cart item quantity', async () => {
    if (!cartItemId) throw new Error('No cart item ID available');
    const response = await api.put(`/cart/${cartItemId}`, {
      quantity: 3
    });
    if (!response.data) {
      throw new Error('Cart update failed');
    }
  });

  await test('Remove item from cart', async () => {
    if (!cartItemId) throw new Error('No cart item ID available');
    const response = await api.delete(`/cart/${cartItemId}`);
    if (!response.data) {
      throw new Error('Cart item removal failed');
    }
  });

  await test('Clear cart', async () => {
    // Add item first
    await api.post('/cart', { productId, quantity: 1 });
    const response = await api.delete('/cart');
    if (!response.data) {
      throw new Error('Cart clear failed');
    }
  });
}

// ==================== WISHLIST TESTS ====================

async function testWishlist() {
  await test('Get user wishlist', async () => {
    const response = await api.get('/wishlist');
    if (!response.data || !response.data.products) {
      throw new Error('Wishlist should have products array');
    }
  });

  await test('Add product to wishlist', async () => {
    if (!productId) throw new Error('No product ID available');
    const response = await api.post('/wishlist', { productId });
    if (!response.data) {
      throw new Error('Wishlist add failed');
    }
  });

  await test('Remove product from wishlist', async () => {
    if (!productId) throw new Error('No product ID available');
    const response = await api.delete(`/wishlist/${productId}`);
    if (!response.data) {
      throw new Error('Wishlist remove failed');
    }
  });
}

// ==================== ORDER TESTS ====================

async function testOrders() {
  // First, add items to cart
  await test('Prepare cart for order', async () => {
    if (!productId) throw new Error('No product ID available');
    await api.post('/cart', { productId, quantity: 1 });
  });

  await test('Create order', async () => {
    const response = await api.post('/orders', {
      address: {
        street: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        zip: '12345',
        country: 'Test Country'
      }
    });
    if (!response.data || !response.data._id) {
      throw new Error('Order creation failed');
    }
    orderId = response.data._id;
    log.info(`Created order: ${orderId}`);
  });

  await test('Get user orders', async () => {
    const response = await api.get('/orders');
    if (!Array.isArray(response.data)) {
      throw new Error('Orders should be an array');
    }
  });

  await test('Get order by ID', async () => {
    if (!orderId) throw new Error('No order ID available');
    const response = await api.get(`/orders/${orderId}`);
    if (!response.data || response.data._id !== orderId) {
      throw new Error('Order retrieval failed');
    }
  });
}

// ==================== USER PROFILE TESTS ====================

async function testUserProfile() {
  await test('Get user profile', async () => {
    const response = await api.get('/users/me');
    if (!response.data || !response.data.email) {
      throw new Error('Profile retrieval failed');
    }
  });

  await test('Update user profile', async () => {
    const response = await api.put('/users/me', {
      name: 'Updated Test User',
      phone: '1234567890'
    });
    if (!response.data) {
      throw new Error('Profile update failed');
    }
  });
}

// ==================== HOME API TESTS ====================

async function testHomeAPI() {
  await test('Get home data', async () => {
    const response = await api.get('/home');
    if (!response.data) {
      throw new Error('Home API failed');
    }
    if (!response.data.banners || !response.data.collections || 
        !response.data.bestsellers || !response.data.newArrivals) {
      throw new Error('Home API missing required fields');
    }
  });
}

// ==================== COLLECTIONS TESTS ====================

async function testCollections() {
  await test('Get all collections', async () => {
    const response = await api.get('/collections');
    if (!response.data || !response.data.collections) {
      throw new Error('Collections API failed');
    }
  });
}

// ==================== AUTHENTICATION MIDDLEWARE TESTS ====================

async function testAuthMiddleware() {
  await test('Protected route without token', async () => {
    try {
      await axios.get(`${API_BASE_URL}/cart`);
      throw new Error('Should have failed without token');
    } catch (error) {
      if (error.response?.status !== 401) {
        throw new Error('Expected 401 status for unauthorized request');
      }
    }
  });
}

// ==================== MAIN TEST RUNNER ====================

async function runAllTests() {
  console.log(colors.bold.cyan('\n========================================'));
  console.log(colors.bold.cyan('  MERN E-COMMERCE PROJECT TEST SUITE'));
  console.log(colors.bold.cyan('========================================\n'));

  log.info(`Testing API at: ${API_BASE_URL}\n`);

  try {
    // Run tests in sequence
    await testAuthentication();
    await testProducts();
    await testCart();
    await testWishlist();
    await testOrders();
    await testUserProfile();
    await testHomeAPI();
    await testCollections();
    await testAuthMiddleware();

    // Print summary
    console.log(colors.bold('\n========================================'));
    console.log(colors.bold('  TEST SUMMARY'));
    console.log(colors.bold('========================================\n'));
    
    log.info(`Total Tests: ${results.passed + results.failed}`);
    log.success(`Passed: ${results.passed}`);
    if (results.failed > 0) {
      log.error(`Failed: ${results.failed}`);
      console.log(colors.bold('\nFailed Tests:'));
      results.errors.forEach(err => {
        log.error(`  - ${err.test}: ${err.error}`);
      });
    } else {
      log.success('All tests passed! 🎉');
    }

    console.log('\n');
    process.exit(results.failed > 0 ? 1 : 0);
  } catch (error) {
    log.error(`Fatal error: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Run tests
if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests, test, api };

