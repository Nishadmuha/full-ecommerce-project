try {
    require('./models/User');
    console.log('User model OK');
} catch (e) {
    console.log('User model FAIL');
    console.log(e.code);
    console.log(e.message);
}
