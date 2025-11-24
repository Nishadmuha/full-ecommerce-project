try {
    require('./routes/auth');
    console.log('Auth route OK');
} catch (e) {
    console.log('Auth route FAIL');
    console.log(e.code);
    console.log(e.message);
}
