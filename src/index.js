import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
    try {
        // Create a new client
        const client = new Client({
            name: 'playwright-client',
            version: '1.0.0'
        });

        // Create a transport for the Playwright server using SSE
        const transport = new SSEClientTransport(new URL('http://localhost:8931/sse'));

        // Connect to the server
        console.log('Connecting to Playwright MCP server...');
        await client.connect(transport);
        console.log('Connected successfully!');

        // List available tools
        try {
            const tools = await client.listTools();
            console.log('Available tools:', tools);
        } catch (error) {
            console.log('No tools available or error listing tools:', error.message);
        }

        // List available resources
        try {
            const resources = await client.listResources();
            console.log('Available resources:', resources);
        } catch (error) {
            console.log('No resources available or error listing resources:', error.message);
        }

        // List available prompts
        try {
            const prompts = await client.listPrompts();
            console.log('Available prompts:', prompts);
        } catch (error) {
            console.log('No prompts available or error listing prompts:', error.message);
        }

        // Handle process termination
        process.on('SIGINT', async () => {
            console.log('\nShutting down client...');
            await client.close();
            process.exit(0);
        });

        // Keep the process running
        console.log('Client is running and ready. Press Ctrl+C to exit.');

    } catch (error) {
        console.error('Failed to start client:', error);
        process.exit(1);
    }
}

main(); 