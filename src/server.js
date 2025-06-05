import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Global MCP client
let mcpClient = null;
let mcpConnected = false;

// Initialize MCP client
async function initializeMCP() {
    try {
        mcpClient = new Client({
            name: 'playwright-client',
            version: '1.0.0'
        });

        const transport = new SSEClientTransport(new URL('http://localhost:8931/sse'));
        await mcpClient.connect(transport);
        mcpConnected = true;
        console.log('MCP client connected successfully');
        
        // Get available tools
        const tools = await mcpClient.listTools();
        console.log(`Available tools: ${tools.tools.length}`);
        
        return tools;
    } catch (error) {
        console.error('Failed to initialize MCP client:', error);
        mcpConnected = false;
        return null;
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

// Routes
app.get('/api/status', async (req, res) => {
    res.json({ 
        mcpConnected,
        openaiConfigured: !!process.env.OPENAI_API_KEY
    });
});

app.get('/api/tools', async (req, res) => {
    try {
        if (!mcpConnected) {
            await initializeMCP();
        }
        
        const tools = await mcpClient.listTools();
        res.json(tools);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Ensure MCP is connected
        if (!mcpConnected) {
            await initializeMCP();
        }

        // Get available tools
        const mcpTools = await mcpClient.listTools();
        const toolDefinitions = createToolDefinitions(mcpTools.tools);

        // Create system message
        const systemMessage = {
            role: "system",
            content: `You are an AI assistant that can control a web browser using Playwright tools. You have access to various browser automation tools that can help you navigate websites, take screenshots, click elements, type text, and more.

Available tools include:
- browser_navigate: Navigate to URLs
- browser_click: Click on elements
- browser_type: Type text into inputs
- browser_take_screenshot: Take screenshots
- browser_snapshot: Get accessibility snapshots
- browser_wait_for: Wait for elements or conditions
- And many more browser automation tools

When a user asks you to do something with a website, use the appropriate tools to accomplish the task step by step. For example:
1. First navigate to the appropriate website
2. Take a screenshot or snapshot to see what's on the page
3. Perform the required actions (click, type, etc.)
4. Take another screenshot to show the results
5. Continue until the task is fully completed

Always complete the full task the user requests - don't stop after just one action.`
        };

        // Initialize conversation messages
        let messages = [
            systemMessage,
            { role: "user", content: message }
        ];

        let allToolResults = [];
        let finalResponse = '';
        let maxIterations = 10; // Prevent infinite loops
        let iteration = 0;

        // Continue conversation until no more tool calls are needed
        while (iteration < maxIterations) {
            iteration++;
            
            // Call OpenAI with function calling
            const completion = await openai.chat.completions.create({
                model: "gpt-4",
                messages: messages,
                tools: toolDefinitions,
                tool_choice: "auto"
            });

            const assistantMessage = completion.choices[0].message;
            messages.push(assistantMessage);

            // If no tool calls, we're done
            if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
                finalResponse = assistantMessage.content || '';
                break;
            }

            // Execute all tool calls in this round
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

                    // Add tool result to conversation
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

                    // Add error result to conversation
                    messages.push({
                        role: "tool",
                        tool_call_id: toolCall.id,
                        content: JSON.stringify(toolResult)
                    });
                }
            }

            console.log(`Iteration ${iteration}: Executed ${toolResults.length} tools`);
        }

        // If we hit max iterations, get a final response
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

        res.json({
            response: finalResponse,
            toolResults: allToolResults
        });

    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Initialize MCP on startup
initializeMCP();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 