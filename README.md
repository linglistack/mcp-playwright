# MCP Custom Client with React Frontend

This is a comprehensive application that provides a React frontend interface to interact with MCP (Model Context Protocol) servers through OpenAI's GPT models. It includes an integrated Playwright MCP server for browser automation.

## Features

- **React Frontend**: Modern chat interface for natural language browser automation
- **OpenAI Integration**: Uses GPT-4 to process commands and call appropriate tools
- **Integrated Playwright Server**: Built-in Playwright MCP server (no separate setup needed!)
- **Real-time Status**: Shows connection status for both MCP and OpenAI
- **Tool Results Display**: Visual feedback for executed actions including screenshots
- **Multi-round Execution**: Completes full tasks with multiple steps automatically

## Architecture

```
User Input → Frontend (React) → Backend (Express + OpenAI) → MCP Client → Playwright Server → Browser Automation
```

## Quick Start

### Option 1: Automated Setup (Recommended)
```bash
chmod +x setup.sh
./setup.sh
```

### Option 2: Manual Setup

1. **Install dependencies:**
```bash
npm install
npm install -D @playwright/mcp
npx playwright install
cd frontend && npm install && cd ..
```

2. **Create .env file:**
```bash
OPENAI_API_KEY=your_openai_api_key_here
PORT=3001
PLAYWRIGHT_SERVER_URL=http://localhost:8931/sse
```

3. **Start all services:**
```bash
npm run dev
```

This starts:
- Playwright MCP server on port 8931
- Backend API on port 3001  
- React frontend on port 3001

## Usage Examples

### Basic Commands
- **🔍 "Search for 4.0+ rating restaurants near me on Google"**
- **📸 "Navigate to github.com and take a screenshot"**
- **🛒 "Go to amazon.com and search for wireless headphones"**

### Advanced Automation
- **📊 "Go to example.com, extract all the text, and take a screenshot"**
- **🖱️ "Navigate to Google, search for 'AI news', and click on the first result"**
- **📝 "Fill out a contact form on example.com with test data"**

## Deployment Options

### Option 1: Docker (Recommended for Production)
```bash
# Build Docker image
docker build -t mcp-playwright .

# Run container
docker run -p 3001:3001 -p 8931:8931 \
  -e OPENAI_API_KEY=your_key_here \
  mcp-playwright
```

### Option 2: Railway/Render
1. Connect your GitHub repository
2. Set environment variables:
   - `OPENAI_API_KEY=your_key_here`
   - `PORT=3001`
3. Deploy using the included Dockerfile

### Option 3: Vercel (Frontend) + Separate Backend
- Deploy frontend to Vercel
- Deploy backend to Railway/Render with Docker
- Update frontend `REACT_APP_API_BASE` environment variable

## Environment Variables

```bash
# Required
OPENAI_API_KEY=your_openai_api_key_here

# Optional
PORT=3001
PLAYWRIGHT_SERVER_URL=http://localhost:8931/sse
NODE_ENV=development
```

## How It Works

1. **User Input**: User types natural language command in React frontend
2. **AI Processing**: OpenAI GPT-4 interprets the command and determines required actions
3. **Tool Execution**: Backend executes Playwright tools through MCP protocol
4. **Multi-round Execution**: System continues until task is fully complete
5. **Visual Feedback**: Screenshots and results are displayed in the frontend

## Available Browser Tools

The system has access to all Playwright automation capabilities:

- **Navigation**: Navigate to URLs, go back/forward
- **Interaction**: Click elements, type text, hover, drag & drop
- **Information**: Take screenshots, get page snapshots, extract text
- **File Operations**: Upload files, save PDFs
- **Tab Management**: Open/close/switch tabs
- **Waiting**: Wait for elements, conditions, or timeouts
- **Testing**: Generate Playwright test code

## Security Considerations

⚠️ **Important Notes:**
- Browser runs on your server, not user's computer
- All users share the same browser session
- Avoid sensitive sites (banking, personal accounts)
- Consider implementing user session isolation for production
- Screenshots are temporarily stored and transmitted

## API Endpoints

### `GET /api/status`
Returns system status including MCP and OpenAI connection status.

### `POST /api/chat`
Processes natural language commands and executes browser automation.

**Request:**
```json
{
  "message": "Navigate to google.com and search for cats"
}
```

**Response:**
```json
{
  "response": "I've navigated to Google and searched for cats...",
  "toolResults": [...]
}
```

## Project Structure

```
mcp/
├── src/
│   ├── index.js          # Original MCP client
│   └── server.js         # Express server with OpenAI integration
├── api/                  # Vercel serverless functions
│   ├── chat.js
│   └── status.js
├── frontend/             # React application
│   ├── src/
│   │   ├── App.tsx       # Main React component
│   │   └── App.css       # Styles
│   └── package.json
├── Dockerfile            # Docker configuration
├── start-services.sh     # Service startup script
├── setup.sh             # Automated setup script
└── README.md
```

## Troubleshooting

### Common Issues

1. **Playwright Installation Failed**
   ```bash
   npx playwright install --force
   ```

2. **MCP Connection Issues**
   - Ensure port 8931 is not in use
   - Check if Playwright server started successfully
   - Verify `@playwright/mcp` is installed

3. **OpenAI API Errors**
   - Verify `OPENAI_API_KEY` is correct
   - Check API usage limits
   - Ensure sufficient credits

4. **Frontend Can't Connect**
   - Verify backend is running on port 3001
   - Check CORS configuration
   - Update `REACT_APP_API_BASE` if needed

### Development Tips

- Use `npm run dev` to start all services at once
- Check browser console for frontend errors
- Monitor backend logs for API issues
- Use `npm run playwright-server` to test Playwright server independently

## Contributing

1. Fork the repository
2. Create a feature branch
3. Test thoroughly with both local and Docker deployment
4. Submit a pull request

## License

This project is licensed under the MIT License. 