try {
    console.log('Checking routes...');
    require('./routes/auth');
    console.log('Auth OK');
    require('./routes/products');
    console.log('Products OK');
    require('./routes/cart');
    console.log('Cart OK');
    require('./routes/wishlist');
    console.log('Wishlist OK');
    require('./routes/orders');
    console.log('Orders OK');
    require('./routes/users');
    console.log('Users OK');
    require('./routes/home');
    console.log('Home OK');
} catch (e) {
    console.error('Route FAIL:', e);
}
