const http = require('http');

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data,
          contentType: res.headers['content-type']
        });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function testEndpoints() {
  const endpoints = [
    '/api/devinsights/agents',
    '/api/devinsights/report',
    '/api/devinsights/connect/status'
  ];

  console.log('🧪 Testing API endpoints...\n');

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint}...`);
      const result = await makeRequest(endpoint);
      
      if (result.status === 200) {
        console.log(`  ✅ Status: ${result.status}`);
        try {
          const json = JSON.parse(result.data);
          console.log(`  📊 Response keys:`, Object.keys(json));
          if (json.agents) console.log(`  📝 Agents count: ${json.agents.length}`);
          if (json.synthesis) console.log(`  📝 Has synthesis data: true`);
          if (json.channels) console.log(`  📝 Channels: ${json.channels.length}`);
        } catch {
          console.log(`  📄 Response preview: ${result.data.substring(0, 100)}...`);
        }
      } else {
        console.log(`  ❌ Status: ${result.status}`);
        console.log(`  📄 Response: ${result.data.substring(0, 100)}...`);
      }
      console.log();
    } catch (e) {
      console.log(`  ❌ Error: ${e.message}`);
      console.log();
    }
  }
}

testEndpoints().catch(console.error);
