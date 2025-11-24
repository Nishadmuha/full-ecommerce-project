try {
    require('express');
    console.log('express OK');
    require('bcryptjs');
    console.log('bcryptjs OK');
    require('jsonwebtoken');
    console.log('jsonwebtoken OK');
    require('cors');
    console.log('cors OK');
    require('morgan');
    console.log('morgan OK');
    require('cookie-parser');
    console.log('cookie-parser OK');
} catch (e) {
    console.log('Deps FAIL');
    console.log(e.code);
    console.log(e.message);
}
