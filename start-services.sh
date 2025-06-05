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

# Give Playwright server time to start
echo "⏳ Waiting for Playwright server to initialize..."
sleep 10

# Start the main application server
echo "🖥️  Starting application server on port 3001..."
node src/server.js &
APP_PID=$!

# Give app server time to start
echo "⏳ Waiting for application server to initialize..."
sleep 5

echo "🎉 All services started!"
echo "📊 Application: http://localhost:3001"
echo "🎭 Playwright: http://localhost:8931"

# Keep the script running and wait for processes
wait $APP_PID 