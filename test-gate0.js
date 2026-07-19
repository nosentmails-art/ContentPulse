#!/usr/bin/env node

/**
 * Gate 0 Direct Database + Endpoint Test
 * 
 * 1. Verifies database file location
 * 2. Tests HTTP endpoints with known tenant slugs
 */

const fs = require('fs');
const path = require('path');

// SET DATABASE_URL BEFORE ANY REQUIRES
// NOTE: Database is at ./prisma/prisma/dev.db (due to path mismatch)
const correctDbPath = './prisma/prisma/dev.db';
process.env.DATABASE_URL = `file:${correctDbPath}`;
process.env.NODE_ENV = 'development';

console.log('\n🔧 GATE 0 ENDPOINT TEST\n');
console.log(`📍 DATABASE_URL: ${process.env.DATABASE_URL}\n`);

// Test 1: Verify database file exists and has size
console.log('📂 Checking database file...');
const dbPath = path.resolve(correctDbPath);
try {
  const stat = fs.statSync(dbPath);
  console.log(`  ✅ File exists: ${dbPath}`);
  console.log(`  📦 Size: ${(stat.size / 1024).toFixed(1)}KB\n`);
  
  if (stat.size === 0) {
    console.log('  ❌ ERROR: Database file is empty!\n');
    process.exit(1);
  }
} catch (error) {
  console.log(`  ❌ ERROR: ${error.message}\n`);
  process.exit(1);
}

// Test 2: HTTP endpoint testing
async function makeRequest(url, method = 'GET', maxRetries = 30) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, { method });
      const data = await response.json();
      return { ok: response.ok, status: response.status, data };
    } catch (error) {
      if (attempt < maxRetries) {
        const waitTime = 2000;
        // Silence most retries, show every 3rd one
        if (attempt % 3 === 1) {
          process.stdout.write(`  ⏳ Waiting for dev server... (${attempt}/${maxRetries})\r`);
        }
        await new Promise(r => setTimeout(r, waitTime));
      } else {
        throw error;
      }
    }
  }
}

async function main() {
  try {
    console.log('🌐 Testing API endpoints...\n');
    
    // Known tenant slugs from seed.ts
    // The seed creates: 'devinsights' and 'growthstack'
    const testTenantSlug = 'devinsights';
    
    const endpoints = [
      {
        name: 'Agents',
        url: `http://localhost:3000/api/${testTenantSlug}/agents`,
      },
      {
        name: 'Report',
        url: `http://localhost:3000/api/${testTenantSlug}/report`,
      },
      {
        name: 'Connect Status',
        url: `http://localhost:3000/api/${testTenantSlug}/connect/status`,
      },
    ];

    const results = [];

    for (const endpoint of endpoints) {
      console.log(`📍 ${endpoint.name}`);
      console.log(`   GET ${endpoint.url}`);
      
      try {
        const result = await makeRequest(endpoint.url);
        
        if (result.ok && result.status === 200) {
          console.log(`   ✅ Status: ${result.status}`);
          
          // Display data summary
          if (result.data.agents) {
            console.log(`   🤖 Agents: ${result.data.agents.length}`);
            if (result.data.agents.length > 0) {
              console.log(`      First: "${result.data.agents[0].name || 'N/A'}"`);
            }
          }
          if (result.data.channels) {
            console.log(`   📡 Channels: ${result.data.channels.length}`);
            if (result.data.channels.length > 0) {
              console.log(`      First: ${result.data.channels[0].channel}`);
            }
          }
          if (result.data.synthesis) {
            console.log(`   📊 Synthesis: Present`);
          }
          if (result.data.error) {
            console.log(`   ⚠️  Note: ${result.data.error}`);
          }
          
          results.push({ name: endpoint.name, pass: true, data: result.data });
        } else {
          console.log(`   ❌ Status: ${result.status}`);
          if (result.data.error) {
            console.log(`   Error: ${result.data.error}`);
          }
          results.push({ name: endpoint.name, pass: false, error: result.data.error });
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        results.push({ name: endpoint.name, pass: false, error: error.message });
      }
      
      console.log('');
    }

    // Summary
    const passCount = results.filter(r => r.pass).length;
    console.log('='.repeat(60));
    console.log(`📊 Results: ${passCount}/${results.length} endpoints working\n`);

    for (const r of results) {
      console.log(`${r.pass ? '✅' : '❌'} ${r.name}`);
    }

    console.log('='.repeat(60));

    if (passCount === results.length) {
      console.log('\n🎉 GATE 0 PASSED - All endpoints operational!\n');
      
      // Print sample data
      console.log('📋 SAMPLE DATA FROM FIRST ENDPOINT:');
      const agentsResult = results.find(r => r.name === 'Agents');
      if (agentsResult && agentsResult.data && agentsResult.data.agents) {
        console.log(JSON.stringify(agentsResult.data.agents.slice(0, 1), null, 2));
      }
      console.log('');
      
      process.exit(0);
    } else if (passCount > 0) {
      console.log('\n⚠️  GATE 0 PARTIAL - Some endpoints failed\n');
      process.exit(1);
    } else {
      console.log('\n❌ GATE 0 FAILED - No endpoints responded\n');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

main();
