const http = require('http');

const data = JSON.stringify({
  title: "Test Career",
  slug: "test-career",
  deadline: "Đến khi đủ số lượng",
  status: "open",
  publish_date: "2026-07-10",
  draft: false,
  lang: "vi",
  content: "<p>Test Content</p>"
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/posts/careers?lang=vi',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
    'Accept-Language': 'vi'
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Response Body:', body);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(data);
req.end();
