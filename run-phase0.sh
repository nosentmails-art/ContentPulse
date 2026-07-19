#!/bin/bash

# Phase 0 Quick Start - Unix/Linux/Mac
# This script automates Phase 0 setup and testing

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  CONTENTPULSE PHASE 0: GROQ VERIFICATION"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Step 1: Check prerequisites
echo "📋 Step 1: Checking prerequisites..."
echo ""

if ! command -v node &> /dev/null; then
    echo "❌ ERROR: Node.js is not installed"
    echo "   Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ ERROR: npm is not installed"
    exit 1
fi

NODE_VERSION=$(node --version)
echo "✅ Node.js: $NODE_VERSION"
echo "✅ npm: $(npm --version)"
echo ""

# Step 2: Check GROQ_API_KEY
echo "📋 Step 2: Checking Groq API key..."
echo ""

if [ -z "$GROQ_API_KEY" ]; then
    if grep -q "GROQ_API_KEY" .env.local 2>/dev/null; then
        echo "✅ GROQ_API_KEY found in .env.local"
    else
        echo "❌ ERROR: GROQ_API_KEY not found"
        echo ""
        echo "   To setup Groq API key:"
        echo "   1. Visit https://console.groq.com"
        echo "   2. Create or sign into your account"
        echo "   3. Create an API key"
        echo "   4. Run: node setup-phase0-env.js"
        echo "   5. Or manually add to .env.local:"
        echo "      GROQ_API_KEY=your-key-here"
        echo "      GROQ_MODEL=llama-3.3-70b-versatile"
        echo "      DATABASE_URL=\"file:./prisma/dev.db\""
        exit 1
    fi
else
    echo "✅ GROQ_API_KEY detected in environment"
fi
echo ""

# Step 3: Check database
echo "📋 Step 3: Checking database..."
echo ""

if [ -f "prisma/dev.db" ]; then
    SIZE=$(du -h "prisma/dev.db" | cut -f1)
    echo "✅ Database found: $SIZE"
else
    echo "⚠️  Database not found at prisma/dev.db"
    echo "   The system will create it on first run"
fi
echo ""

# Step 4: Start dev server
echo "📋 Step 4: Starting dev server..."
echo ""
echo "   Command: npm run dev"
echo ""

npm run dev &
SERVER_PID=$!
echo "   Process ID: $SERVER_PID"
echo ""

# Wait for server to start
echo "   ⏳ Waiting for server to start (up to 30 seconds)..."
COUNTER=0
MAX_WAIT=30

while [ $COUNTER -lt $MAX_WAIT ]; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo "   ✅ Server is ready!"
        break
    fi
    COUNTER=$((COUNTER + 1))
    sleep 1
done

if [ $COUNTER -eq $MAX_WAIT ]; then
    echo "   ❌ Server did not start in time"
    kill $SERVER_PID
    exit 1
fi

echo ""

# Step 5: Run Phase 0 test
echo "📋 Step 5: Running Phase 0 test..."
echo ""
echo "   Command: node test-phase0-groq.js"
echo ""

node test-phase0-groq.js
TEST_EXIT=$?

# Cleanup
kill $SERVER_PID 2>/dev/null || true

echo ""
echo "═══════════════════════════════════════════════════════════════"
if [ $TEST_EXIT -eq 0 ]; then
    echo "  ✅ PHASE 0 COMPLETE"
else
    echo "  ❌ PHASE 0 INCOMPLETE - Check logs above"
fi
echo "═══════════════════════════════════════════════════════════════"
echo ""

exit $TEST_EXIT
