#!/bin/bash

set -e  # Exit on any error

echo "🚀 Starting MCP Playwright Application..."

# Function to handle shutdown
cleanup() {
    echo "🛑 Shutting down services..."
    if [ ! -z "$PLAYWRIGHT_PID" ]; then
        kill $PLAYWRIGHT_PID 2>/dev/null || true
    fi
    if [ ! -z "$APP_PID" ]; then
        kill $APP_PID 2>/dev/null || true
    fi
    exit 0
}

# Set up signal handlers
trap cleanup SIGTERM SIGINT

# Start Playwright MCP server in background
echo "🎭 Starting Playwright MCP server on port 8931..."
npx @playwright/mcp --port 8931 &
PLAYWRIGHT_PID=$!

# Wait for Playwright server to be ready
echo "⏳ Waiting for Playwright server to start..."
for i in {1..30}; do
    if curl -f http://localhost:8931/sse 2>/dev/null; then
        echo "✅ Playwright server is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Playwright server failed to start"
        exit 1
    fi
    sleep 2
done

# Start the main application server
echo "🖥️  Starting application server on port 3001..."
node src/server.js &
APP_PID=$!

# Wait for app server to be ready
echo "⏳ Waiting for application server to start..."
for i in {1..15}; do
    if curl -f http://localhost:3001/api/status 2>/dev/null; then
        echo "✅ Application server is ready!"
        break
    fi
    if [ $i -eq 15 ]; then
        echo "❌ Application server failed to start"
        exit 1
    fi
    sleep 2
done

echo "🎉 All services are running!"
echo "📊 Application: http://localhost:3001"
echo "🎭 Playwright: http://localhost:8931"

# Keep the script running and wait for processes
wait $APP_PID 