#!/usr/bin/env node

/**
 * Gate 0 Endpoint Test Script
 * 
 * Sets DATABASE_URL to correct path BEFORE any modules are loaded,
 * then tests all three required API endpoints.
 */

// Step 1: Set DATABASE_URL BEFORE requiring any modules
const dbPath = './prisma/dev.db';
process.env.DATABASE_URL = `file:${dbPath}`;
process.env.NODE_ENV = 'development';

console.log('🔧 Gate 0 Endpoint Testing\n');
console.log(`📍 DATABASE_URL set to: ${process.env.DATABASE_URL}`);
console.log('⏳ Waiting for dev server to be ready on http://localhost:3000...\n');

// Helper to make HTTP requests
async function makeRequest(method, path, retries = 5) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(`http://localhost:3000${path}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      return { status: response.status, data };
    } catch (error) {
      if (i < retries - 1) {
        console.log(`  ⏳ Retry ${i + 1}/${retries - 1}... (dev server starting)`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        throw error;
      }
    }
  }
}

// Step 2: Test database connection and find a tenant
async function testDatabaseAndGetTenant() {
  try {
    console.log('📊 Testing database connection...\n');
    
    // Import Prisma AFTER setting DATABASE_URL
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    // Test connection by counting tenants
    const tenantCount = await prisma.tenant.count();
    console.log(`  ✓ Database connection successful`);
    console.log(`  📈 Total tenants: ${tenantCount}`);

    if (tenantCount === 0) {
      console.log('\n  ⚠️  WARNING: No tenants found in database');
      console.log('  The database may be empty. Seeding with default tenant...\n');
      
      // Create a default tenant
      const tenant = await prisma.tenant.create({
        data: {
          name: 'Test Tenant',
          slug: 'test-tenant',
          website: 'https://example.com',
          niche: 'Technology',
        },
      });
      
      console.log(`  ✓ Created default tenant: ${tenant.slug}`);
      console.log(`  📝 Tenant ID: ${tenant.id}\n`);
      
      await prisma.$disconnect();
      return tenant.slug;
    }

    // Get first tenant
    const tenant = await prisma.tenant.findFirst();
    if (tenant) {
      console.log(`  ✓ Found tenant: ${tenant.slug}`);
      console.log(`  📝 Tenant ID: ${tenant.id}`);
      
      const agentCount = await prisma.agent.count({ where: { tenantId: tenant.id } });
      console.log(`  🤖 Agents for this tenant: ${agentCount}`);
      
      const contentCount = await prisma.contentItem.count({ where: { tenantId: tenant.id } });
      console.log(`  📄 Content items: ${contentCount}\n`);
    }

    await prisma.$disconnect();
    return tenant.slug;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
}

// Step 3: Test all endpoints
async function testEndpoints(tenantSlug) {
  console.log(`🌐 Testing API endpoints for tenant: "${tenantSlug}"\n`);

  const endpoints = [
    {
      name: 'Agents',
      path: `/api/${tenantSlug}/agents`,
      description: 'GET all agents for tenant',
    },
    {
      name: 'Report',
      path: `/api/${tenantSlug}/report`,
      description: 'GET synthesized report',
    },
    {
      name: 'Connect Status',
      path: `/api/${tenantSlug}/connect/status`,
      description: 'GET channel connection status',
    },
  ];

  const results = [];

  for (const endpoint of endpoints) {
    try {
      console.log(`📍 Testing ${endpoint.name}`);
      console.log(`   ${endpoint.description}`);
      console.log(`   GET ${endpoint.path}`);

      const { status, data } = await makeRequest('GET', endpoint.path);

      if (status === 200) {
        console.log(`   ✅ Status: 200 OK`);
        console.log(`   📦 Response size: ${JSON.stringify(data).length} bytes`);
        
        // Show sample data
        if (data.agents) {
          console.log(`   🤖 Agents count: ${data.agents.length}`);
          if (data.agents.length > 0) {
            console.log(`      Sample: "${data.agents[0].name}"`);
          }
        }
        if (data.channels) {
          console.log(`   📡 Channels count: ${data.channels.length}`);
        }
        if (data.synthesis) {
          console.log(`   📊 Synthesis generated: true`);
        }

        results.push({ endpoint: endpoint.name, status: 'PASS', data });
      } else {
        console.log(`   ❌ Status: ${status}`);
        console.log(`   Error: ${data.error || 'Unknown error'}`);
        results.push({ endpoint: endpoint.name, status: 'FAIL', data });
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      results.push({ endpoint: endpoint.name, status: 'ERROR', error: error.message });
    }

    console.log('');
  }

  return results;
}

// Step 4: Print summary
function printSummary(results) {
  console.log('\n' + '='.repeat(60));
  console.log('🎯 GATE 0 TEST SUMMARY');
  console.log('='.repeat(60) + '\n');

  const passCount = results.filter(r => r.status === 'PASS').length;
  const failCount = results.filter(r => r.status !== 'PASS').length;

  console.log(`✅ Passed: ${passCount}/${results.length}`);
  console.log(`❌ Failed: ${failCount}/${results.length}\n`);

  for (const result of results) {
    const icon = result.status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} ${result.endpoint}: ${result.status}`);
  }

  console.log('\n' + '='.repeat(60));

  if (passCount === results.length) {
    console.log('🎉 GATE 0 COMPLETE - All endpoints operational!');
    console.log('✨ Ready to proceed to Phase 1');
  } else {
    console.log('⚠️  GATE 0 INCOMPLETE - Some endpoints failed');
    console.log('🔍 Check error details above');
  }

  console.log('='.repeat(60) + '\n');

  return passCount === results.length;
}

// Main execution
async function main() {
  try {
    // Test database
    const tenantSlug = await testDatabaseAndGetTenant();

    // Small delay to ensure dev server is starting
    console.log('⏳ Waiting 3 seconds for dev server startup...\n');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Test endpoints
    const results = await testEndpoints(tenantSlug);

    // Print summary
    const gatePassed = printSummary(results);

    // Exit with appropriate code
    process.exit(gatePassed ? 0 : 1);
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run
main();
