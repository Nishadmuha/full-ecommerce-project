try {
    require('mongoose');
    console.log('Mongoose OK');
} catch (e) {
    console.log('Mongoose FAIL');
    console.log(e.code);
    console.log(e.message);
}
