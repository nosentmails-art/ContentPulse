#!/usr/bin/env node

/**
 * Setup Phase 0 Environment
 * 
 * This script ensures .env.local has Groq credentials for Phase 0 testing.
 * If GROQ_API_KEY is not already set, it prompts the user or allows override.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const envPath = path.join(__dirname, '.env.local');
const requiredVars = {
  GROQ_API_KEY: 'Your Groq API key from https://console.groq.com',
  GROQ_MODEL: 'llama-3.3-70b-versatile',
  DATABASE_URL: 'file:./prisma/dev.db',
};

function readEnvFile() {
  if (!fs.existsSync(envPath)) {
    return {};
  }
  
  const content = fs.readFileSync(envPath, 'utf-8');
  const env = {};
  
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      let value = valueParts.join('=');
      
      // Remove quotes
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      env[key] = value;
    }
  });
  
  return env;
}

function writeEnvFile(env) {
  const lines = Object.entries(env)
    .map(([key, value]) => {
      // Quote if contains spaces or special chars
      if (value.includes(' ') || value.includes(',')) {
        return `${key}="${value}"`;
      }
      return `${key}=${value}`;
    });
  
  fs.writeFileSync(envPath, lines.join('\n') + '\n');
}

async function promptUser(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log('\n🔧 PHASE 0 ENVIRONMENT SETUP\n');
  
  const currentEnv = readEnvFile();
  const newEnv = { ...currentEnv };
  
  // Check for GROQ_API_KEY
  if (process.env.GROQ_API_KEY) {
    console.log('✅ GROQ_API_KEY detected in process environment');
    newEnv.GROQ_API_KEY = process.env.GROQ_API_KEY;
  } else if (currentEnv.GROQ_API_KEY) {
    console.log(`✅ GROQ_API_KEY already in .env.local: ${currentEnv.GROQ_API_KEY.substring(0, 10)}...`);
  } else {
    console.log('❌ GROQ_API_KEY not found in environment or .env.local');
    console.log('\n📝 To get a Groq API key:');
    console.log('   1. Visit https://console.groq.com');
    console.log('   2. Create an account or sign in');
    console.log('   3. Create an API key');
    console.log('   4. Copy the key below\n');
    
    const key = await promptUser('Enter your GROQ_API_KEY: ');
    if (key) {
      newEnv.GROQ_API_KEY = key;
      console.log(`✅ GROQ_API_KEY set\n`);
    } else {
      console.log('❌ GROQ_API_KEY is required for Phase 0 testing');
      process.exit(1);
    }
  }
  
  // Set model
  newEnv.GROQ_MODEL = process.env.GROQ_MODEL || currentEnv.GROQ_MODEL || 'llama-3.3-70b-versatile';
  console.log(`✅ GROQ_MODEL: ${newEnv.GROQ_MODEL}\n`);
  
  // Set database URL
  newEnv.DATABASE_URL = currentEnv.DATABASE_URL || 'file:./prisma/dev.db';
  console.log(`✅ DATABASE_URL: ${newEnv.DATABASE_URL}\n`);
  
  // Write env file
  writeEnvFile(newEnv);
  console.log('✅ .env.local updated\n');
  
  console.log('✅ Environment ready for Phase 0 testing');
  console.log('\nNext step: Run Phase 0 test with:');
  console.log('   node test-phase0-groq.js\n');
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
