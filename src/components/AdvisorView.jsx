import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { EXPENSE_CATEGORIES } from '../constants/categories';
import { getAdvice, isAIEnabled } from '../services/ai';

export function AdvisorView({ expenses, budgets, totalExpenses, getCategoryTotal }) {
  const [tone, setTone] = useState('encouraging');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const ask = async () => {
    if (!isAIEnabled()) {
      setResponse('AI is disabled. Set VITE_AI_PROXY_URL in your .env to enable the advisor.');
      return;
    }
    setLoading(true);
    setResponse('');
    try {
      const summary = {
        totalExpenses,
        categoryBreakdown: EXPENSE_CATEGORIES.map((cat) => ({
          category: cat,
          spent: getCategoryTotal(cat),
          budget: budgets[cat] || 0,
        })).filter((c) => c.spent > 0),
        recentExpenses: expenses.slice(-5).map((e) => ({ description: e.description, amount: e.amount, category: e.category })),
      };
      const advice = await getAdvice({ summary, tone });
      setResponse(advice);
    } catch (err) {
      setResponse(`Couldn't reach the AI right now: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <MessageCircle size={24} /> AI Financial Advisor
      </h2>
      <p className="text-slate-300 mb-4">Get personalized advice based on your spending patterns and budgets.</p>

      <div className="mb-6 bg-slate-700 rounded-lg p-4">
        <label className="text-slate-300 font-semibold mb-3 block">Advisor Tone:</label>
        <div className="flex gap-3">
          <button
            onClick={() => setTone('encouraging')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              tone === 'encouraging' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
            }`}
          >
            Encouraging
            <div className="text-xs mt-1 opacity-80">Supportive & positive</div>
          </button>
          <button
            onClick={() => setTone('brutal')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              tone === 'brutal' ? 'bg-red-500 text-white shadow-lg' : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
            }`}
          >
            Brutal Honesty
            <div className="text-xs mt-1 opacity-80">No sugarcoating</div>
          </button>
        </div>
      </div>

      <button
        onClick={ask}
        disabled={loading || expenses.length === 0}
        className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors mb-6"
      >
        {loading ? 'Analyzing your finances…' : `Get ${tone === 'brutal' ? 'Brutal' : 'Friendly'} AI Advice`}
      </button>

      {expenses.length === 0 && (
        <p className="text-slate-400 text-center py-4">Add some expenses first to get personalized advice!</p>
      )}

      {response && (
        <div className={`rounded-lg p-6 ${tone === 'brutal' ? 'bg-red-900/20 border-2 border-red-500' : 'bg-slate-700'}`}>
          <div className="text-slate-200 whitespace-pre-wrap">{response}</div>
        </div>
      )}
    </div>
  );
}
