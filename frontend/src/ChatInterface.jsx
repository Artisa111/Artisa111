import { useState, useRef } from 'react';
import axios from 'axios';

export function ChatInterface({ onActionReceived }) {
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I am your restaurant analytics assistant. Ask me about "best table" or "empty tables".' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('/api/chat', {
        message: userMsg
      });

      const data = response.data;
      setMessages(prev => [...prev, { role: 'ai', content: data.response }]);

      if (data.action) {
        onActionReceived(data.action);
      }

      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error connecting to the backend.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute top-4 right-4 w-80 h-96 bg-gray-800/90 backdrop-blur-md rounded-xl border border-gray-700 shadow-2xl flex flex-col z-20 overflow-hidden">
      <div className="p-3 bg-gray-900 border-b border-gray-700 font-semibold flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
        AI Assistant
      </div>

      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-lg text-sm ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-tr-none'
                : 'bg-gray-700 text-gray-200 rounded-tl-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 text-gray-400 p-3 rounded-lg rounded-tl-none text-sm animate-pulse">
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-3 border-t border-gray-700 bg-gray-900 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-white"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg px-4 py-2 font-medium transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}
