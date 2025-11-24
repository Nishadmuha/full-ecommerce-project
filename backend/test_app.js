try {
    console.log('Dependencies OK');

    console.log('Loading auth route...');
    require('./routes/auth');
    console.log('Auth OK');

    console.log('Loading products route...');
    require('./routes/products');
    console.log('Products OK');

    console.log('Loading cart route...');
    require('./routes/cart');
    console.log('Cart OK');

    console.log('Loading wishlist route...');
    require('./routes/wishlist');
    console.log('Wishlist OK');

    console.log('Loading orders route...');
    require('./routes/orders');
    console.log('Orders OK');

    console.log('Loading users route...');
    require('./routes/users');
    console.log('Users OK');

    console.log('Loading home route...');
    require('./routes/home');
    console.log('Home OK');

    console.log('Loading app...');
    require('./app');
    console.log('App OK');
} catch (err) {
    console.log('FAIL');
    console.log(err.message);
    console.log(err.code);
}
