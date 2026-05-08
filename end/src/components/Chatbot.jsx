import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Trash2, MessageSquare } from 'lucide-react';
import { HfInference } from '@huggingface/inference';

const hf = new HfInference(import.meta.env.VITE_AI_TOKEN);
const STORAGE_KEY = 'chatbot_messages';

const SYSTEM_PROMPT = (issData, newsData) => `
You are an AI assistant for the ISS & News Dashboard. Answer ONLY based on the data provided.
ISS Data: Lat ${issData?.lat}, Lon ${issData?.lon}, Speed ${issData?.speed} km/h.
News Data: ${newsData?.length} articles loaded.
Be concise.
`;

export default function Chatbot({ issData, newsData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30)));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await hf.chatCompletion({
        model: 'mistralai/Mistral-7B-Instruct-v0.2',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT(issData, newsData) },
          ...messages.slice(-4),
          { role: 'user', content: text },
        ],
        max_tokens: 200,
      });

      const reply = response.choices?.[0]?.message?.content || "No response.";
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error connecting to AI.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-red-400 text-white shadow-lg flex items-center justify-center hover:scale-110 transition-all z-50"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-6 w-80 h-[400px] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col z-50 overflow-hidden font-sans">
          <div className="px-4 py-3 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
            <span className="text-sm font-black text-gray-800 dark:text-gray-200">AI Assistant</span>
            <div className="flex gap-2">
              <button onClick={() => setMessages([])} className="text-[10px] font-bold px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md">Clear</button>
              <button onClick={() => setIsOpen(false)}><X className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs font-medium ${
                  msg.role === 'user' ? 'bg-red-100 text-red-900' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && <div className="text-[10px] text-gray-400 italic font-bold">Assistant is typing...</div>}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-gray-100 dark:border-gray-800">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Ask from dashboard data only"
                className="w-full pl-3 pr-10 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-[11px] focus:outline-none"
              />
              <button onClick={sendMessage} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 font-bold text-[10px]">Send</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
