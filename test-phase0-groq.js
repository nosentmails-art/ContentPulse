#!/usr/bin/env node

/**
 * Phase 0 Groq Verification Test
 * 
 * 1. Starts dev server with environment check
 * 2. Runs all 5 LLM agents
 * 3. Captures and verifies "[llm-helper] Success: groq / ..." logs
 * 4. Reports results
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Configuration
const testTenantSlug = 'devinsights';
const agentTypes = [
  'AUDIENCE_INTELLIGENCE',
  'CHANNEL_CONTENT_INTELLIGENCE',
  'SENTIMENT_ANALYSIS',
  'COMPETITOR_ANALYSIS',
  'OPPORTUNITY_IDENTIFICATION',
];

const logFile = path.resolve('./phase0-test-logs.txt');
let serverProcess = null;
let serverOutput = '';
let serverStarted = false;

// Cleanup on exit
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

function cleanup() {
  console.log('\n🛑 Shutting down...\n');
  if (serverProcess) {
    serverProcess.kill();
  }
  process.exit(0);
}

// Append to log file
function logToFile(text) {
  fs.appendFileSync(logFile, text + '\n');
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function makeRequest(url, method = 'POST', body = null, maxRetries = 30) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const options = { method };
      if (body) options.body = JSON.stringify(body);
      
      const response = await fetch(url, options);
      const data = await response.json();
      return { ok: response.ok, status: response.status, data };
    } catch (error) {
      if (attempt < maxRetries) {
        const waitTime = 2000;
        if (attempt % 3 === 1) {
          process.stdout.write(`  ⏳ Waiting for dev server... (${attempt}/${maxRetries})\r`);
        }
        await delay(waitTime);
      } else {
        throw error;
      }
    }
  }
}

async function runTests() {
  try {
    console.log('\n🔧 PHASE 0: GROQ VERIFICATION TEST\n');
    
    // Check for GROQ_API_KEY in environment
    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      console.log('❌ ERROR: GROQ_API_KEY not set in environment');
      console.log('   Please add to .env.local:');
      console.log('   GROQ_API_KEY=your-key-here');
      console.log('   GROQ_MODEL=llama-3.3-70b-versatile\n');
      process.exit(1);
    }
    
    console.log(`✅ GROQ_API_KEY detected (${groqKey.substring(0, 10)}...)`);
    console.log(`✅ GROQ_MODEL: ${process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'}\n`);
    
    // Clear log file
    fs.writeFileSync(logFile, '=== PHASE 0 GROQ VERIFICATION TEST ===\n');
    logToFile(`Started: ${new Date().toISOString()}\n`);
    logToFile(`GROQ_API_KEY: ${groqKey.substring(0, 10)}...\n`);
    logToFile(`GROQ_MODEL: ${process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'}\n\n`);
    
    // Start dev server
    console.log('🚀 Starting dev server...');
    await startDevServer();
    
    console.log('📡 Dev server started\n');
    
    // Wait for server to be ready
    console.log('⏳ Waiting for server to be ready...');
    await makeRequest(`http://localhost:3000/api/${testTenantSlug}/agents`);
    console.log('✅ Server ready\n');
    
    // Run each agent
    console.log('🤖 Running agents...\n');
    
    const results = [];
    
    for (const agentType of agentTypes) {
      console.log(`  Testing: ${agentType}`);
      const url = `http://localhost:3000/api/${testTenantSlug}/agents/${agentType.toLowerCase()}/run`;
      
      try {
        const result = await makeRequest(url, 'POST', {});
        
        if (result.ok) {
          console.log(`    ✅ Agent ran successfully`);
          results.push({ agent: agentType, success: true });
        } else {
          console.log(`    ⚠️  Agent returned status ${result.status}`);
          if (result.data.error) {
            console.log(`    Error: ${result.data.error}`);
          }
          results.push({ agent: agentType, success: false, error: result.data.error });
        }
      } catch (error) {
        console.log(`    ❌ Error: ${error.message}`);
        results.push({ agent: agentType, success: false, error: error.message });
      }
      
      // Wait between requests
      await delay(1000);
    }
    
    console.log('');
    
    // Extract success logs from server output
    const successLogs = serverOutput.match(/\[llm-helper\] Success: groq \/ [^\n]+/g) || [];
    const errorLogs = serverOutput.match(/\[llm-helper\].*[Ee]rror[^\n]+/g) || [];
    
    console.log('📋 PHASE 0 RESULTS\n');
    console.log('='.repeat(60));
    
    console.log('\n✅ Groq Success Logs (captured from server):');
    if (successLogs.length > 0) {
      successLogs.forEach((log, i) => {
        console.log(`   ${i + 1}. ${log}`);
      });
    } else {
      console.log('   ⚠️  No success logs found');
    }
    
    if (errorLogs.length > 0) {
      console.log('\n❌ Error Logs:');
      errorLogs.forEach((log, i) => {
        console.log(`   ${i + 1}. ${log}`);
      });
    }
    
    console.log('\n📊 Agent Run Results:');
    let passCount = 0;
    results.forEach(r => {
      if (r.success) {
        console.log(`   ✅ ${r.agent}`);
        passCount++;
      } else {
        console.log(`   ❌ ${r.agent}: ${r.error}`);
      }
    });
    
    console.log('\n='.repeat(60));
    
    if (successLogs.length === 5 && passCount === 5) {
      console.log('\n🎉 PHASE 0 VERIFICATION PASSED!');
      console.log(`   All 5 LLM agents ran with Groq successfully\n`);
      
      logToFile('\n=== PHASE 0 PASSED ===');
      logToFile(`Success logs found: ${successLogs.length}`);
      logToFile(`Agents passed: ${passCount}`);
      
      console.log('📝 Full server output saved to: phase0-test-logs.txt\n');
      cleanup();
    } else {
      console.log(`\n⚠️  PHASE 0 VERIFICATION INCOMPLETE`);
      console.log(`   Success logs: ${successLogs.length}/5`);
      console.log(`   Agents passed: ${passCount}/5\n`);
      
      console.log('📝 Full server output saved to: phase0-test-logs.txt');
      console.log('   Check logs for errors\n');
      
      logToFile('\n=== PHASE 0 INCOMPLETE ===');
      logToFile(`Success logs found: ${successLogs.length}`);
      logToFile(`Agents passed: ${passCount}`);
      
      cleanup();
    }
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    logToFile(`\nFatal error: ${error.message}`);
    cleanup();
  }
}

function startDevServer() {
  return new Promise((resolve, reject) => {
    console.log('   Running: npm run dev');
    
    serverProcess = spawn('npm', ['run', 'dev'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        NODE_ENV: 'development',
      },
    });
    
    let readyDetected = false;
    
    const onData = (data) => {
      const text = data.toString();
      serverOutput += text;
      logToFile(text);
      
      // Detect server ready (look for "listening on" or "started on" messages)
      if (!readyDetected && (
        text.includes('listening on') ||
        text.includes('Local:') ||
        text.includes('> ready') ||
        text.includes('compiled') ||
        text.includes('compiled client')
      )) {
        readyDetected = true;
        serverStarted = true;
        resolve();
      }
      
      // Also resolve after 8 seconds as fallback
      setTimeout(() => {
        if (!readyDetected) {
          readyDetected = true;
          serverStarted = true;
          resolve();
        }
      }, 8000);
    };
    
    serverProcess.stdout.on('data', onData);
    serverProcess.stderr.on('data', onData);
    
    serverProcess.on('error', reject);
    serverProcess.on('close', (code) => {
      console.log(`\n⚠️  Dev server exited with code ${code}`);
    });
  });
}

// Start tests
runTests().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});
