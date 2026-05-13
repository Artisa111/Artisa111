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
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    const newMessages = [...messages, { role: 'user', content: userMsg }];

    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setTimeout(scrollToBottom, 50);

    try {
      // Send the entire history (excluding the very first greeting if desired, but we send all here)
      const response = await axios.post('/api/chat', {
        history: messages,
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
      setMessages(prev => [...prev, {
        role: 'ai',
        content: '⚠️ Network or Server Error. Please try again later.'
      }]);
      setTimeout(scrollToBottom, 100);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute top-6 right-6 w-80 h-[28rem] bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.4)] flex flex-col z-20 overflow-hidden transition-all">
      {/* Header */}
      <div className="p-4 bg-gray-800/50 border-b border-gray-700/50 font-medium flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </div>
          <span className="text-gray-100 tracking-wide text-sm font-semibold">AI Assistant</span>
        </div>
        <div className="text-xs text-gray-500 font-mono">MVP</div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-4 scroll-smooth scrollbar-thin scrollbar-thumb-gray-700">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
            <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-tr-sm'
                : 'bg-gray-800 text-gray-200 rounded-tl-sm border border-gray-700/50'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-fade-in-up">
            <div className="bg-gray-800 border border-gray-700/50 text-gray-400 p-3.5 rounded-2xl rounded-tl-sm text-sm flex gap-1.5 items-center">
              <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 bg-gray-800/30 border-t border-gray-700/50 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about revenue..."
          className="flex-1 bg-gray-900 border border-gray-600/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-gray-100 placeholder-gray-500 transition-all shadow-inner"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-xl px-4 py-2.5 font-medium transition-all shadow-md active:scale-95 flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
          </svg>
        </button>
      </form>
    </div>
  );
}
