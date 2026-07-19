#!/bin/bash
# Gate 0 Test Runner
# Starts dev server with correct DATABASE_URL, then tests endpoints

echo "🚀 Starting Gate 0 Test Sequence"
echo ""

# Kill any existing dev server on port 3000
echo "🧹 Cleaning up existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
sleep 1

echo "📦 Starting Next.js dev server..."
echo "   Using DATABASE_URL=file:./prisma/prisma/dev.db"
echo ""

# Start dev server with correct DATABASE_URL
# Use a background job so we can test while it runs
DATABASE_URL="file:./prisma/prisma/dev.db" npm run dev &
DEV_PID=$!

echo "   PID: $DEV_PID"
echo "   Waiting for server to be ready..."
echo ""

# Run test script
sleep 3
node test-gate0.js
TEST_RESULT=$?

echo ""
echo "🛑 Shutting down dev server..."
kill $DEV_PID 2>/dev/null || true

exit $TEST_RESULT
