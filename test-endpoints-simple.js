// Test Gate 0 endpoints
const http = require('http');

const endpoints = [
  'http://localhost:3000/api/devinsights/agents',
  'http://localhost:3000/api/devinsights/report',
  'http://localhost:3000/api/devinsights/connect/status'
];

async function testEndpoint(url) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const time = Date.now() - startTime;
        try {
          const json = JSON.parse(data);
          resolve({
            url,
            status: res.statusCode,
            time,
            success: res.statusCode === 200,
            dataKeys: Object.keys(json),
            hasData: JSON.stringify(json).length > 50
          });
        } catch (e) {
          resolve({
            url,
            status: res.statusCode,
            time,
            success: false,
            error: 'Failed to parse JSON',
            raw: data.substring(0, 100)
          });
        }
      });
    }).on('error', (e) => {
      resolve({
        url,
        error: e.message,
        success: false
      });
    });
  });
}

async function runTests() {
  console.log('Testing Gate 0 endpoints...\n');
  for (const endpoint of endpoints) {
    console.log(`Testing: ${endpoint}`);
    const result = await testEndpoint(endpoint);
    console.log(JSON.stringify(result, null, 2));
    console.log('---\n');
  }
}

// Wait 5 seconds for server to potentially start
setTimeout(runTests, 5000);
