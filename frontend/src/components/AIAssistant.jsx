import React, { useState } from 'react';
import { Radio, Send, X, Bot, Sparkles, AlertOctagon, CheckCircle2, ShieldAlert } from 'lucide-react';
import { sendAIChatApi } from '../services/api';

export default function AIAssistant({ isOpen, onClose, simulationState }) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "DigiRescue Tactical AI Online. I am connected to the digital twin simulation matrix. How can I assist your command decisions?",
      actions: [
        "Monitor coastal surge elevation",
        "Verify bridge throughput status"
      ],
      priorityZones: ["Harbor Bay Coastal District"]
    }
  ]);
  const [loading, setLoading] = useState(false);

  const QUICK_PROMPTS = [
    "Identify top 3 at-risk zones",
    "Where should Harbor Bay residents evacuate?",
    "Calculate shelter pressure",
    "Which power substations are down?"
  ];

  const handleSend = async (textToSend) => {
    const promptText = textToSend || query;
    if (!promptText.trim()) return;

    const userMsg = { sender: 'user', text: promptText };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setQuery('');
    setLoading(true);

    try {
      const res = await sendAIChatApi(promptText, simulationState);
      const aiMsg = {
        sender: 'ai',
        text: res.reply,
        actions: res.suggested_actions || [],
        priorityZones: res.priority_zones || []
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: "Unable to reach tactical AI server. Please verify backend state." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[440px] z-50 bg-[#0b0f19]/95 backdrop-blur-xl border-l border-slate-800 shadow-2xl flex flex-col font-sans">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-sm font-mono flex items-center gap-2">
              Tactical AI Assistant
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </h3>
            <p className="text-[11px] text-slate-400">Digital Twin Real-Time Advisory Engine</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Prompts Bar */}
      <div className="p-3 border-b border-slate-800/80 bg-slate-950/50 space-y-1.5">
        <p className="text-[10px] uppercase font-mono font-semibold text-slate-400">Quick Command Prompts</p>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="text-[11px] px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-cyan-950 hover:text-cyan-300 text-slate-300 border border-slate-700 transition-all font-medium"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] p-3 rounded-xl text-xs space-y-2 ${
                msg.sender === 'user'
                  ? 'bg-cyan-600 text-white rounded-br-none shadow-lg shadow-cyan-600/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-lg'
              }`}
            >
              <p className="leading-relaxed">{msg.text}</p>

              {/* Structured AI Actions */}
              {msg.actions && msg.actions.length > 0 && (
                <div className="pt-2 border-t border-slate-800 space-y-1">
                  <p className="text-[10px] font-mono uppercase font-bold text-cyan-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-cyan-400" /> Recommended Action Items
                  </p>
                  <ul className="space-y-1 text-[11px] text-slate-300">
                    {msg.actions.map((act, aIdx) => (
                      <li key={aIdx} className="flex items-start gap-1.5">
                        <span className="text-cyan-400 font-bold">•</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Priority Zones */}
              {msg.priorityZones && msg.priorityZones.length > 0 && (
                <div className="pt-1 text-[10px] font-mono text-amber-300 flex items-center gap-1">
                  <AlertOctagon className="w-3 h-3 text-amber-400" /> Priority Focus: {msg.priorityZones.join(', ')}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono animate-pulse">
            <Bot className="w-4 h-4" /> Analyzing digital twin state & computing optimal response...
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/80">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask tactical question (e.g. 'What if rain reaches 150mm?')..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
          />
          <button
            type="submit"
            disabled={loading}
            className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/20 disabled:opacity-50 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
