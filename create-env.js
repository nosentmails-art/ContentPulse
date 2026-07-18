const fs = require('fs');
const path = require('path');

const envContent = 'DATABASE_URL="file:./prisma/data.db"\n';
const envPath = path.join(__dirname, '.env.local');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✓ .env.local created successfully');
} catch (error) {
  console.error('Error creating .env.local:', error.message);
  process.exit(1);
}
