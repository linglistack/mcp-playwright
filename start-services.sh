#!/bin/bash

# Start Playwright MCP server in background
echo "Starting Playwright MCP server..."
npx @playwright/mcp --port 8931 &
PLAYWRIGHT_PID=$!

# Wait a moment for Playwright server to start
sleep 5

# Start the main application server
echo "Starting application server..."
node src/server.js &
APP_PID=$!

# Function to handle shutdown
cleanup() {
    echo "Shutting down services..."
    kill $PLAYWRIGHT_PID 2>/dev/null
    kill $APP_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGTERM SIGINT

# Wait for either process to exit
wait $APP_PID 