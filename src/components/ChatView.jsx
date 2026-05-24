import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { EXPENSE_CATEGORIES } from '../constants/categories';
import { chat, isAIEnabled } from '../services/ai';

export function ChatView({ expenses, income, budgets, totalExpenses, getCategoryTotal }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async () => {
    const userMessage = input.trim();
    if (!userMessage || loading) return;

    if (!isAIEnabled()) {
      setMessages((m) => [...m, { role: 'user', content: userMessage }, { role: 'assistant', content: 'AI is disabled. Set VITE_AI_PROXY_URL in your .env to enable chat.' }]);
      setInput('');
      return;
    }

    const next = [...messages, { role: 'user', content: userMessage }];
    setMessages(next);
    setInput('');
    setLoading(true);

    const summary = {
      totalExpenses,
      totalIncome: income.reduce((sum, i) => sum + i.amount, 0),
      categories: EXPENSE_CATEGORIES.map((cat) => ({
        category: cat,
        spent: getCategoryTotal(cat),
        count: expenses.filter((e) => e.category === cat).length,
        budget: budgets[cat] || 0,
      })).filter((c) => c.spent > 0),
      recentExpenses: expenses.slice(-10).map((e) => ({
        description: e.description,
        amount: e.amount,
        category: e.category,
        date: e.date,
      })),
    };

    try {
      const reply = await chat({ summary, userMessage });
      setMessages([...next, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages([...next, { role: 'assistant', content: `Sorry, I couldn't analyze that: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
        <MessageSquare size={24} /> AI Chat — Ask About Your Spending
      </h2>
      <p className="text-slate-300 mb-6">
        Ask things like "Am I spending too much on coffee?", "What's my biggest expense category?", "How much did I spend last month?"
      </p>

      <div className="bg-slate-700 rounded-lg p-4 mb-4 h-96 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-slate-400 text-center py-8">
            <MessageSquare size={48} className="mx-auto mb-3 opacity-50" />
            <p>Start a conversation about your spending!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-slate-600 text-slate-100'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-600 rounded-lg p-3 flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-300 border-t-transparent" />
                  <span className="text-slate-300">Analyzing…</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Ask about your spending…"
          className="flex-1 bg-slate-700 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
          disabled={loading}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-colors"
        >
          Send
        </button>
      </div>

      {messages.length > 0 && (
        <button onClick={() => setMessages([])} className="text-slate-400 hover:text-slate-300 text-sm mt-3">
          Clear conversation
        </button>
      )}
    </div>
  );
}
