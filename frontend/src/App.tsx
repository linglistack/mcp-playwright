import React, { useState, useEffect, useRef } from 'react';
import './App.css';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  toolResults?: any[];
  timestamp: Date;
}

interface StatusResponse {
  mcpConnected: boolean;
  openaiConfigured: boolean;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use relative URLs by default (works with proxy in dev and same domain in production)
  const API_BASE = process.env.REACT_APP_API_BASE || '';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Check server status on load
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/status`);
      const statusData = await response.json();
      setStatus(statusData);
    } catch (error) {
      console.error('Failed to check status:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.response,
        toolResults: data.toolResults,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString();
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Playwright MCP Client</h1>
        <div className="status-indicator">
          <span className={`status-dot ${status?.mcpConnected ? 'connected' : 'disconnected'}`}></span>
          MCP: {status?.mcpConnected ? 'Connected' : 'Disconnected'}
          <span className={`status-dot ${status?.openaiConfigured ? 'connected' : 'disconnected'}`}></span>
          OpenAI: {status?.openaiConfigured ? 'Configured' : 'Not Configured'}
        </div>
        <div className="info-banner">
          ⚡ Browser automation runs on our server - you'll see screenshots of the results!
        </div>
      </header>

      <main className="chat-container">
        <div className="messages">
          {messages.length === 0 && (
            <div className="welcome-message">
              <h3>Welcome to Playwright MCP Client!</h3>
              <p>🌐 Control a remote browser with natural language commands:</p>
              <ul>
                <li>🔍 "Search for restaurants near me on Google"</li>
                <li>📸 "Navigate to github.com and take a screenshot"</li>
                <li>🖱️ "Click on the search button and type hello world"</li>
                <li>📊 "Go to example.com and extract all the text"</li>
                <li>🛒 "Navigate to an online store and add an item to cart"</li>
              </ul>
              <p>💡 The browser runs on our server, so you'll see live screenshots of the automation!</p>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`message ${message.type}`}>
              <div className="message-header">
                <span className="sender">{message.type === 'user' ? 'You' : 'Assistant'}</span>
                <span className="timestamp">{formatTimestamp(message.timestamp)}</span>
              </div>
              <div className="message-content">
                {message.content}
              </div>
              {message.toolResults && message.toolResults.length > 0 && (
                <div className="tool-results">
                  <h4>🛠️ Automation Results:</h4>
                  {message.toolResults.map((result, index) => (
                    <div key={index} className="tool-result">
                      <strong>🔧 {result.toolName}</strong>
                      {result.error ? (
                        <div className="error">❌ Error: {result.error}</div>
                      ) : (
                        <div className="success">✅ Executed successfully</div>
                      )}
                      {result.result && result.result.content && (
                        <div className="result-content">
                          {result.result.content.map((item: any, idx: number) => (
                            <div key={idx}>
                              {item.type === 'image' && (
                                <div className="screenshot-container">
                                  <h5>📸 Screenshot:</h5>
                                  <img
                                    src={`data:image/png;base64,${item.data}`}
                                    alt="Browser Screenshot"
                                    style={{ maxWidth: '100%', height: 'auto', border: '1px solid #ddd', borderRadius: '4px' }}
                                  />
                                </div>
                              )}
                              {item.type === 'text' && (
                                <div className="text-result">
                                  <h5>📝 Text Output:</h5>
                                  <pre>{item.text}</pre>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="message assistant loading">
              <div className="message-header">
                <span className="sender">Assistant</span>
              </div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', opacity: '0.7' }}>
                  🤖 Processing your request and controlling the browser...
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="input-container">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your browser automation command here... (e.g., 'Navigate to google.com and search for cats')"
            disabled={loading}
            rows={3}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="send-button"
          >
            {loading ? '🔄 Automating...' : '🚀 Execute'}
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;
