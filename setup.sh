#!/bin/bash

echo "🚀 Setting up MCP Custom Client with React Frontend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'.' -f1 | sed 's/v//')
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version is too old. Please install Node.js v16 or higher."
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install

# Install Playwright MCP server
echo "🎭 Installing Playwright MCP server..."
npm install -D @playwright/mcp

# Install Playwright browsers
echo "🌐 Installing Playwright browsers..."
npx playwright install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Check for .env file
if [ ! -f ".env" ]; then
    echo "⚠️  Creating .env file..."
    cat > .env << EOL
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration
PORT=3001

# Playwright Server Configuration (for production)
PLAYWRIGHT_SERVER_URL=http://localhost:8931/sse
EOL
    echo "⚠️  Please edit .env file and add your OpenAI API key"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file and add your OpenAI API key"
echo "2. Run 'npm run dev' to start all services (Playwright server + Backend + Frontend)"
echo ""
echo "Services will be available at:"
echo "- Frontend: http://localhost:3001"
echo "- Backend API: http://localhost:3001"
echo "- Playwright MCP Server: http://localhost:8931"
echo ""
echo "🐳 For production deployment, you can use:"
echo "- Docker: 'docker build -t mcp-playwright .' then 'docker run -p 3001:3001 -p 8931:8931 mcp-playwright'"
echo "- Railway/Render: Deploy using the Dockerfile" 