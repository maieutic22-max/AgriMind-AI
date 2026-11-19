import React, { useState } from 'react';
import { Bot, Send, Mic, BookOpen } from 'lucide-react';
import { StatusBadge } from '../components/ui/StatusBadge';

export const AIAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: 'Good afternoon, Balram! I am your AgriMind AI Farm Manager. I can query your plot records, inspect input stock, simulate what-if scenarios, and retrieve verified ICAR agricultural practices. How can I assist you today?',
      citations: ['AgriMind Farming Memory', 'ICAR Kharif Manual (2024)'],
    },
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [
      ...prev,
      { sender: 'user', text: userMsg, citations: [] },
      {
        sender: 'assistant',
        text: `Executing tool dispatch for: "${userMsg}". In Phase 1 foundation, this interface connects with the backend router at POST /api/v1/assistant/chat once Gemini function calling is configured.`,
        citations: ['System Orchestrator'],
      },
    ]);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700">
            Module 4 · Member 4 Core Deliverable
          </span>
          <StatusBadge status="demo" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Agentic AI Farm Manager & RAG Knowledge Assistant
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Single-agent tool-calling loop connecting Gemini API with FastAPI domain endpoints, PostgreSQL vector search, and farm memory.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col h-[520px]">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-forest-800 text-white flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                Farm Manager Agent
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <div className="text-[10px] text-slate-500">Native Tool Calling & RAG Grounding</div>
            </div>
          </div>
          <div className="text-[11px] text-slate-400">Phase 1 Foundation</div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-forest-800 text-white rounded-br-xs'
                    : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-bl-xs'
                }`}
              >
                {m.text}
              </div>

              {m.citations && m.citations.length > 0 && (
                <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
                  <BookOpen className="w-3 h-3 text-emerald-600" />
                  <span>Grounding: {m.citations.join(' · ')}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 border-t border-slate-100 flex items-center gap-2">
          <button
            type="button"
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
            title="Vernacular Voice (Web Speech API)"
          >
            <Mic className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your crops, soil test, weather, or machinery rental..."
            className="flex-1 p-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />

          <button
            type="submit"
            className="p-2.5 bg-forest-800 hover:bg-forest-900 text-white rounded-xl transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
