try {
    const middleware = require('./middleware/authMiddleware');
    console.log('Middleware loaded:', middleware);
    console.log('Protect is function:', typeof middleware.protect === 'function');
    console.log('Admin is function:', typeof middleware.admin === 'function');
} catch (e) {
    console.error('Error loading middleware:', e);
}
