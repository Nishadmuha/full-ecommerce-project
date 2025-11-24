const http = require('http');

const data = JSON.stringify({
    name: "Leather Backpack",
    price: 1200,
    stock: 50,
    description: "Premium leather bag",
    category: "Backpacks",
    images: ["https://sampleimage.com/img1.jpg"]
});

const options = {
    hostname: 'localhost',
    port: 5005,
    path: '/api/products',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
