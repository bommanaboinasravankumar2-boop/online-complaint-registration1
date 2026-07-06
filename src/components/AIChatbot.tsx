import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, MessageSquare, X, Send, Bot, User, RefreshCw, AlertCircle, HelpCircle } from 'lucide-react';
import { User as SystemUser } from '../types';
import { TranslationSet } from '../lib/translations';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface AIChatbotProps {
  currentUser: SystemUser | null;
  t: TranslationSet;
}

export default function AIChatbot({ currentUser, t }: AIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      role: 'assistant',
      text: `Hello! I am CIVIC_BOT, your intelligent Municipal Core Operations Concierge. How can I help you navigate civic services today?`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || sending) return;

    if (!textToSend) setInputText('');

    const newUserMsg: Message = {
      id: 'msg-' + Math.random().toString(36).substr(2, 9),
      role: 'user',
      text: text.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newUserMsg]);
    setSending(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, newUserMsg].map(m => ({ role: m.role, text: m.text })),
          userContext: currentUser
        })
      });

      if (!response.ok) throw new Error('Failed to reach AI Core');
      const data = await response.json();

      setMessages(prev => [...prev, {
        id: 'msg-' + Math.random().toString(36).substr(2, 9),
        role: 'assistant',
        text: data.text,
        timestamp: new Date().toISOString()
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: 'msg-err',
        role: 'assistant',
        text: "I am experiencing temporary connection problems communicating with the central civic mainframe. Please try checking back in a moment.",
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setSending(false);
    }
  };

  const QUICK_PROMPTS = [
    { label: 'Check Status', query: 'Check my complaint ticket status' },
    { label: 'Explain Departments', query: 'What municipal departments are available?' },
    { label: 'How to file', query: 'Help me understand how to file a municipal complaint like a pro' }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans" id="ai-chatbot-root-container">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-80 md:w-96 h-[500px] bg-white rounded-2xl border border-slate-100 shadow-2xl flex flex-col mb-4 overflow-hidden"
            id="ai-chatbot-window"
          >
            {/* Window Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-bold font-display tracking-tight text-white">{t.ai_companion}</h3>
                  <span className="text-[9px] uppercase font-bold text-cyan-400 font-mono tracking-wider">CIVIC_BOT Core v2.4</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Message Pane */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#fafbfc]" id="ai-chat-messages-container">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-md bg-slate-100 border border-slate-200/50 flex items-center justify-center flex-shrink-0 text-slate-600">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-slate-900 text-white rounded-tr-none'
                        : 'bg-white border border-slate-200/40 text-slate-800 shadow-2xs rounded-tl-none'
                    }`}
                  >
                    {m.text.split('\n').map((line, idx) => (
                      <p key={idx} className={idx > 0 ? 'mt-1' : ''}>
                        {line}
                      </p>
                    ))}
                    <span className={`text-[8px] font-medium block mt-1 text-right ${m.role === 'user' ? 'text-slate-400' : 'text-slate-400'}`}>
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {m.role === 'user' && (
                    <div className="w-6 h-6 rounded-md bg-cyan-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-[10px] uppercase">
                      {currentUser ? currentUser.name.substring(0, 2) : 'G'}
                    </div>
                  )}
                </div>
              ))}
              {sending && (
                <div className="flex gap-2.5 justify-start">
                  <div className="w-6 h-6 rounded-md bg-slate-100 border border-slate-200/50 flex items-center justify-center flex-shrink-0 text-slate-600">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="bg-white border border-slate-200/40 text-slate-400 rounded-xl rounded-tl-none px-3 py-2 text-xs flex items-center gap-1.5">
                    <RefreshCw className="w-3 h-3 animate-spin text-slate-400" />
                    <span>Analyzing civic mainframe...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Prompts Panel */}
            <div className="p-3 bg-white border-t border-slate-100 flex flex-wrap gap-1.5" id="ai-chat-quick-prompts">
              {QUICK_PROMPTS.map((qp, idx) => (
                <button
                  key={idx}
                  disabled={sending}
                  onClick={() => handleSendMessage(qp.query)}
                  className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-[10px] font-semibold text-slate-600 hover:text-slate-900 border border-slate-200/60 rounded-full transition-colors cursor-pointer disabled:opacity-50"
                >
                  {qp.label}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <div className="p-3 bg-slate-50 border-t border-slate-100">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={t.chat_placeholder}
                  className="flex-1 bg-white border border-slate-200 focus:outline-none focus:border-slate-800 rounded-xl px-3 py-2 text-xs placeholder-slate-400 font-medium"
                  disabled={sending}
                  id="chat-input-field"
                />
                <button
                  type="submit"
                  disabled={sending || !inputText.trim()}
                  className="p-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all cursor-pointer disabled:bg-slate-200 disabled:text-slate-400"
                  id="btn-chat-send"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="h-12 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl shadow-xl flex items-center gap-2 cursor-pointer z-50 border border-slate-800"
        id="btn-ai-chat-toggle"
      >
        <Sparkles className="w-4.5 h-4.5 text-cyan-400 animate-pulse" />
        <span className="text-xs font-bold tracking-tight">{t.ai_companion}</span>
      </motion.button>
    </div>
  );
}
