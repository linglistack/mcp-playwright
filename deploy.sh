#!/bin/bash

set -e

echo "🚀 MCP Playwright Deployment Script"
echo "=================================="

# Function to deploy to Railway
deploy_railway() {
    echo "📦 Deploying to Railway..."
    
    if ! command -v railway &> /dev/null; then
        echo "Installing Railway CLI..."
        npm install -g @railway/cli
    fi
    
    echo "🔑 Please login to Railway..."
    railway login
    
    echo "🎯 Initializing Railway project..."
    railway init
    
    echo "🌍 Setting environment variables..."
    read -p "Enter your OpenAI API key: " -s openai_key
    echo
    railway add OPENAI_API_KEY=$openai_key
    railway add PORT=3001
    railway add NODE_ENV=production
    
    echo "🚀 Deploying..."
    railway up
    
    echo "✅ Deployment complete!"
    echo "🌐 Your app will be available at the URL shown above"
}

# Function to deploy to Render
deploy_render() {
    echo "📦 Deploying to Render..."
    echo "Please follow these steps:"
    echo "1. Go to https://render.com"
    echo "2. Click 'New +' → 'Web Service'"
    echo "3. Connect your GitHub repository"
    echo "4. Choose 'Docker' as runtime"
    echo "5. Set these environment variables:"
    echo "   - OPENAI_API_KEY=your_key"
    echo "   - PORT=3001"
    echo "   - NODE_ENV=production"
    echo "6. Click 'Deploy'"
    echo ""
    echo "🔗 Opening Render in your browser..."
    if command -v open &> /dev/null; then
        open "https://render.com"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "https://render.com"
    fi
}

# Function to test Docker build locally
test_docker() {
    echo "🐳 Testing Docker build locally..."
    
    read -p "Enter your OpenAI API key for testing: " -s openai_key
    echo
    
    echo "🔨 Building Docker image..."
    docker build -t mcp-playwright-test .
    
    echo "🚀 Running container..."
    echo "Container will be available at http://localhost:3001"
    echo "Press Ctrl+C to stop..."
    
    docker run -p 3001:3001 \
        -e OPENAI_API_KEY=$openai_key \
        -e NODE_ENV=production \
        mcp-playwright-test
}

# Main menu
echo "Choose deployment option:"
echo "1) Railway (Recommended - Easy setup)"
echo "2) Render (Free tier available)"  
echo "3) Test with Docker locally"
echo "4) Exit"
echo

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        deploy_railway
        ;;
    2)
        deploy_render
        ;;
    3)
        test_docker
        ;;
    4)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac 