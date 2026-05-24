import React, { useState } from 'react';
import { Calendar, HelpCircle, Plus, Trash2 } from 'lucide-react';
import { EXPENSE_CATEGORIES, getCategoryColor } from '../constants/categories';
import { todayISO } from '../utils/dates';
import { smartCategorize } from '../utils/smartCategorize';
import { categorizeOne, isAIEnabled } from '../services/ai';

const blankExpense = () => ({
  description: '',
  amount: '',
  category: 'Eating & Drinking Out',
  date: todayISO(),
  suggestedCategory: null,
  confidence: null,
});

export function AddExpenseView({ expenses, userPreferences, onAdd, onDelete }) {
  const [draft, setDraft] = useState(blankExpense);
  const [isCategorizing, setIsCategorizing] = useState(false);

  const handleBlur = async () => {
    if (!draft.description || draft.description.length < 3 || draft.suggestedCategory) return;

    const local = smartCategorize(draft.description, userPreferences);
    if (local) {
      setDraft((prev) => ({
        ...prev,
        suggestedCategory: local.category,
        confidence: local.confidence,
        category: local.category,
      }));
      return;
    }

    if (!isAIEnabled()) return;
    setIsCategorizing(true);
    try {
      const result = await categorizeOne(draft.description);
      setDraft((prev) => ({
        ...prev,
        suggestedCategory: result.category,
        confidence: result.confidence,
        category: result.category,
      }));
    } catch (err) {
      console.error('Categorization failed:', err);
      setDraft((prev) => ({ ...prev, suggestedCategory: 'Other', confidence: 'low', category: 'Other' }));
    } finally {
      setIsCategorizing(false);
    }
  };

  const submit = () => {
    if (!draft.description || !draft.amount) return;
    const ok = onAdd({
      id: Date.now(),
      description: draft.description,
      amount: parseFloat(draft.amount),
      category: draft.category,
      date: draft.date,
    });
    if (ok) setDraft(blankExpense());
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-slate-800 rounded-xl p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Plus size={24} /> Add New Expense
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-slate-300 block mb-2">Description</label>
            <input
              type="text"
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value, suggestedCategory: null })}
              onBlur={handleBlur}
              className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="e.g., Woolworths, Shell, Netflix…"
            />
            {isCategorizing && <p className="text-sm text-slate-400 mt-1">Analyzing description…</p>}
          </div>

          <div>
            <label className="text-slate-300 block mb-2">Amount ($)</label>
            <input
              type="number"
              step="0.01"
              value={draft.amount}
              onChange={(e) => setDraft({ ...draft, amount: e.target.value })}
              className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="text-slate-300 mb-2 flex items-center gap-2">
              Category
              {draft.suggestedCategory && (
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    draft.confidence === 'high' ? 'bg-emerald-600 text-white'
                      : draft.confidence === 'medium' ? 'bg-yellow-600 text-white'
                      : 'bg-orange-600 text-white'
                  }`}
                >
                  Suggested ({draft.confidence})
                </span>
              )}
            </label>
            <select
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value })}
              className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              {EXPENSE_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            {draft.confidence === 'low' && (
              <p className="text-xs text-orange-400 mt-1 flex items-center gap-1">
                <HelpCircle size={12} /> Low confidence — please verify
              </p>
            )}
          </div>

          <div>
            <label className="text-slate-300 block mb-2">Date</label>
            <input
              type="date"
              value={draft.date}
              onChange={(e) => setDraft({ ...draft, date: e.target.value })}
              className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <button
            onClick={submit}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={20} /> Add Expense
          </button>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Calendar size={24} /> Recent Expenses
        </h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {expenses.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No expenses yet. Add your first one!</p>
          ) : (
            expenses.slice().reverse().map((expense) => (
              <div key={expense.id} className="bg-slate-700 rounded-lg p-4 flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-semibold text-white">{expense.description}</div>
                  <div className="text-sm text-slate-400 flex items-center gap-2 mt-1">
                    <span
                      className="px-2 py-1 rounded"
                      style={{
                        backgroundColor: getCategoryColor(expense.category) + '40',
                        color: getCategoryColor(expense.category),
                      }}
                    >
                      {expense.category}
                    </span>
                    <span>{new Date(expense.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-emerald-400">${expense.amount.toFixed(2)}</span>
                  <button onClick={() => onDelete(expense.id)} className="text-red-400 hover:text-red-300 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
