#!/bin/bash
# ContentPulse Setup Script

echo "🚀 ContentPulse Setup Starting..."

# Create .env if doesn't exist
if [ ! -f .env.local ]; then
  echo 'DATABASE_URL="file:./prisma/data.db"' > .env.local
  echo "✓ Created .env.local"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Push schema to database
echo "📊 Pushing database schema..."
npx prisma db push --skip-generate

# Seed demo data
echo "🌱 Seeding demo data..."
npm run seed

echo "✅ Setup complete! Run 'npm run dev' to start"
