# MCP Custom Client with React Frontend

This is a comprehensive application that provides a React frontend interface to interact with MCP (Model Context Protocol) servers through OpenAI's GPT models. It specifically connects to a Playwright MCP server for browser automation.

## Features

- **React Frontend**: Modern chat interface for natural language interaction
- **OpenAI Integration**: Uses GPT-4 to process commands and call appropriate tools
- **MCP Client**: Connects to Playwright MCP server for browser automation
- **Real-time Status**: Shows connection status for both MCP and OpenAI
- **Tool Results Display**: Visual feedback for executed actions including screenshots

## Architecture

```
Frontend (React) ↔ Backend (Express + OpenAI) ↔ MCP Client ↔ Playwright Server
```

## Setup Instructions

### 1. Prerequisites

- Node.js (v16 or higher)
- Playwright MCP server running on `http://localhost:8931/sse`
- OpenAI API key

### 2. Environment Configuration

Create a `.env` file in the root directory:

```bash
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration
PORT=3000
```

### 3. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 4. Running the Application

#### Option 1: Development Mode (Recommended)
Run both frontend and backend simultaneously:

```bash
npm run dev
```

#### Option 2: Run Separately

Terminal 1 (Backend):
```bash
npm run server
```

Terminal 2 (Frontend):
```bash
npm run client
```

### 5. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3000

## Usage Examples

Once the application is running, you can interact with it using natural language commands:

### Basic Navigation
- "Navigate to google.com and take a screenshot"
- "Go to github.com and show me what's on the page"

### Web Interaction
- "Click on the search button"
- "Type 'hello world' in the search box"
- "Fill out the form with my name as John Doe"

### Information Extraction
- "What text is visible on this page?"
- "Take a screenshot of the current page"
- "Get the accessibility snapshot of the page"

### Advanced Automation
- "Navigate to example.com, click the login button, and take a screenshot"
- "Search for 'playwright' on Google and take a screenshot of the results"

## Available Tools

The application has access to all Playwright MCP tools including:

- **Navigation**: `browser_navigate`, `browser_navigate_back`, `browser_navigate_forward`
- **Interaction**: `browser_click`, `browser_type`, `browser_hover`, `browser_drag`
- **Information**: `browser_take_screenshot`, `browser_snapshot`, `browser_console_messages`
- **File Operations**: `browser_file_upload`, `browser_pdf_save`
- **Tab Management**: `browser_tab_list`, `browser_tab_new`, `browser_tab_select`, `browser_tab_close`
- **Waiting**: `browser_wait_for`
- **Testing**: `browser_generate_playwright_test`

## Project Structure

```
mcp/
├── src/
│   ├── index.js          # Original MCP client
│   └── server.js         # Express server with OpenAI integration
├── frontend/
│   ├── src/
│   │   ├── App.tsx       # Main React component
│   │   └── App.css       # Styles
│   └── package.json      # Frontend dependencies
├── package.json          # Backend dependencies and scripts
└── README.md
```

## API Endpoints

### GET /api/status
Returns the connection status of MCP and OpenAI configuration.

**Response:**
```json
{
  "mcpConnected": true,
  "openaiConfigured": true
}
```

### GET /api/tools
Returns the list of available MCP tools.

### POST /api/chat
Sends a message to be processed by OpenAI and executes appropriate tools.

**Request:**
```json
{
  "message": "Navigate to google.com and take a screenshot"
}
```

**Response:**
```json
{
  "response": "I've navigated to google.com and taken a screenshot...",
  "toolResults": [...]
}
```

## Troubleshooting

### Common Issues

1. **MCP Connection Failed**
   - Ensure your Playwright MCP server is running on `http://localhost:8931/sse`
   - Check that the server supports SSE transport

2. **OpenAI Not Configured**
   - Verify your `.env` file contains a valid `OPENAI_API_KEY`
   - Ensure the API key has sufficient credits

3. **Frontend Can't Connect to Backend**
   - Verify the backend is running on port 3000
   - Check for CORS issues

### Debug Mode

To see detailed logs, run the backend with:
```bash
DEBUG=* npm run server
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. 