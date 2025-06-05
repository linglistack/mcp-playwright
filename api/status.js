import { spawn } from 'child_process';

// Global state to track Playwright server
let playwrightServerProcess = null;
let serverStarting = false;

// Start Playwright server if not already running
async function ensurePlaywrightServer() {
    if (playwrightServerProcess || serverStarting) {
        return true;
    }

    serverStarting = true;
    
    try {
        // In production, we might want to use a different approach
        // For now, we'll rely on external Playwright server
        if (process.env.NODE_ENV === 'production') {
            serverStarting = false;
            return !!process.env.PLAYWRIGHT_SERVER_URL;
        }

        // Local development - start Playwright server
        playwrightServerProcess = spawn('npx', ['@playwright/mcp', '--port', '8931'], {
            stdio: 'pipe',
            detached: false
        });

        playwrightServerProcess.on('error', (error) => {
            console.error('Playwright server error:', error);
            playwrightServerProcess = null;
            serverStarting = false;
        });

        playwrightServerProcess.on('exit', (code) => {
            console.log('Playwright server exited with code:', code);
            playwrightServerProcess = null;
            serverStarting = false;
        });

        // Give it a moment to start
        await new Promise(resolve => setTimeout(resolve, 3001));
        serverStarting = false;
        return true;

    } catch (error) {
        console.error('Failed to start Playwright server:', error);
        serverStarting = false;
        return false;
    }
}

export default async function handler(req, res) {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Ensure Playwright server is running
        const playwrightRunning = await ensurePlaywrightServer();
        
        return res.status(200).json({
            mcpConnected: playwrightRunning,
            openaiConfigured: !!process.env.OPENAI_API_KEY,
            playwrightServerUrl: process.env.PLAYWRIGHT_SERVER_URL || 'http://localhost:8931/sse',
            environment: process.env.NODE_ENV || 'development'
        });

    } catch (error) {
        console.error('Status check error:', error);
        return res.status(500).json({ 
            error: error.message,
            mcpConnected: false,
            openaiConfigured: !!process.env.OPENAI_API_KEY
        });
    }
} 