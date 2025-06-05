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
PORT=3000
EOL
    echo "⚠️  Please edit .env file and add your OpenAI API key"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file and add your OpenAI API key"
echo "2. Make sure your Playwright MCP server is running on http://localhost:8931/sse"
echo "3. Run 'npm run dev' to start both frontend and backend"
echo ""
echo "Frontend will be available at: http://localhost:3000"
echo "Backend API will be available at: http://localhost:3000" 