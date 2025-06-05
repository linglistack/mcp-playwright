import OpenAI from 'openai';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Global MCP client (will be reused across function calls)
let mcpClient = null;
let mcpConnected = false;

// Initialize MCP client
async function initializeMCP() {
    if (mcpConnected && mcpClient) return mcpClient;
    
    try {
        mcpClient = new Client({
            name: 'playwright-client',
            version: '1.0.0'
        });

        // Note: You'll need to replace this with your hosted Playwright server URL
        const transport = new SSEClientTransport(new URL(process.env.PLAYWRIGHT_SERVER_URL || 'http://localhost:8931/sse'));
        await mcpClient.connect(transport);
        mcpConnected = true;
        console.log('MCP client connected successfully');
        
        return mcpClient;
    } catch (error) {
        console.error('Failed to initialize MCP client:', error);
        mcpConnected = false;
        throw error;
    }
}

// Function to call MCP tools
async function callMCPTool(toolName, params) {
    if (!mcpConnected || !mcpClient) {
        throw new Error('MCP client not connected');
    }
    
    try {
        const result = await mcpClient.callTool({
            name: toolName,
            arguments: params
        });
        return result;
    } catch (error) {
        throw new Error(`Failed to call tool ${toolName}: ${error.message}`);
    }
}

// Create function definitions for OpenAI
function createToolDefinitions(mcpTools) {
    return mcpTools.map(tool => ({
        type: "function",
        function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.inputSchema
        }
    }));
}

export default async function handler(req, res) {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Initialize MCP client
        await initializeMCP();

        // Get available tools
        const mcpTools = await mcpClient.listTools();
        const toolDefinitions = createToolDefinitions(mcpTools.tools);

        // Create system message
        const systemMessage = {
            role: "system",
            content: `You are an AI assistant that can control a web browser using Playwright tools. The browser runs on a server, and users can see the results through screenshots and snapshots.

Available tools include browser automation capabilities like:
- browser_navigate: Navigate to URLs
- browser_click: Click on elements  
- browser_type: Type text into inputs
- browser_take_screenshot: Take screenshots
- browser_snapshot: Get accessibility snapshots
- browser_wait_for: Wait for elements or conditions

Always complete the full task step by step and provide screenshots to show progress.`
        };

        // Initialize conversation messages
        let messages = [
            systemMessage,
            { role: "user", content: message }
        ];

        let allToolResults = [];
        let finalResponse = '';
        let maxIterations = 8; // Reduced for serverless function limits
        let iteration = 0;

        // Continue conversation until no more tool calls are needed
        while (iteration < maxIterations) {
            iteration++;
            
            const completion = await openai.chat.completions.create({
                model: "gpt-4",
                messages: messages,
                tools: toolDefinitions,
                tool_choice: "auto"
            });

            const assistantMessage = completion.choices[0].message;
            messages.push(assistantMessage);

            if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
                finalResponse = assistantMessage.content || '';
                break;
            }

            // Execute tool calls
            const toolResults = [];
            for (const toolCall of assistantMessage.tool_calls) {
                try {
                    const result = await callMCPTool(
                        toolCall.function.name,
                        JSON.parse(toolCall.function.arguments)
                    );
                    
                    const toolResult = {
                        toolName: toolCall.function.name,
                        arguments: JSON.parse(toolCall.function.arguments),
                        result: result
                    };
                    
                    toolResults.push(toolResult);
                    allToolResults.push(toolResult);

                    messages.push({
                        role: "tool",
                        tool_call_id: toolCall.id,
                        content: JSON.stringify(toolResult)
                    });

                } catch (error) {
                    const toolResult = {
                        toolName: toolCall.function.name,
                        arguments: JSON.parse(toolCall.function.arguments),
                        error: error.message
                    };
                    
                    toolResults.push(toolResult);
                    allToolResults.push(toolResult);

                    messages.push({
                        role: "tool",
                        tool_call_id: toolCall.id,
                        content: JSON.stringify(toolResult)
                    });
                }
            }
        }

        // Get final response if needed
        if (iteration >= maxIterations && !finalResponse) {
            const finalCompletion = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [...messages, { 
                    role: "user", 
                    content: "Please provide a summary of what was accomplished." 
                }]
            });
            finalResponse = finalCompletion.choices[0].message.content || 'Task completed.';
        }

        return res.status(200).json({
            response: finalResponse,
            toolResults: allToolResults
        });

    } catch (error) {
        console.error('Chat error:', error);
        return res.status(500).json({ error: error.message });
    }
} 