try {
    require('./routes/products');
    console.log('Products route loaded successfully');
} catch (e) {
    console.error('Error loading products route:', e);
}
