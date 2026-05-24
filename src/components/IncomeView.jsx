import React, { useState } from 'react';
import { Coins, Plus, Trash2, Upload } from 'lucide-react';
import { INCOME_CATEGORIES, getIncomeCategoryColor } from '../constants/categories';
import { todayISO } from '../utils/dates';

export function IncomeView({ income, totalIncome, totalExpenses, onAdd, onDelete }) {
  const [draft, setDraft] = useState({
    source: '',
    category: 'Salary (Net)',
    amount: '',
    date: todayISO(),
  });

  const submit = () => {
    if (!draft.source || !draft.amount) return;
    onAdd({
      id: Date.now(),
      source: draft.source,
      category: draft.category,
      amount: parseFloat(draft.amount),
      date: draft.date,
    });
    setDraft({ source: '', category: 'Salary (Net)', amount: '', date: todayISO() });
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-xl p-6 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Coins size={24} /> Add Income
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-slate-300 block mb-2">Source</label>
              <input
                type="text"
                value={draft.source}
                onChange={(e) => setDraft({ ...draft, source: e.target.value })}
                placeholder="e.g., Monthly Salary, Client Payment"
                className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="text-slate-300 block mb-2">Category</label>
              <select
                value={draft.category}
                onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                {INCOME_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="text-slate-300 block mb-2">Amount ($)</label>
              <input
                type="number"
                step="0.01"
                value={draft.amount}
                onChange={(e) => setDraft({ ...draft, amount: e.target.value })}
                placeholder="0.00"
                className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
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
              <Plus size={20} /> Add Income
            </button>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Upload size={24} /> Import Income from CSV
          </h2>
          <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-4">
            <p className="text-blue-200 mb-3">
              <strong>Use the "Import CSV" tab</strong> to upload your bank statements.
            </p>
            <p className="text-blue-200 text-sm mb-2">The smart importer will automatically:</p>
            <ul className="text-blue-200 text-sm space-y-1 ml-4 list-disc">
              <li>Detect positive amounts as income</li>
              <li>Detect negative amounts as expenses</li>
              <li>Let you categorize both before importing</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-4">Income History</h2>

        <div className="mb-4 bg-slate-700 rounded-lg p-4">
          <div className="text-slate-300 text-sm">Total Income</div>
          <div className="text-emerald-400 text-3xl font-bold">${totalIncome.toFixed(2)}</div>
          <div className="text-slate-400 text-sm mt-2">
            Net: ${(totalIncome - totalExpenses).toFixed(2)}
            {totalIncome > 0 && (
              <span className="ml-2">({((1 - totalExpenses / totalIncome) * 100).toFixed(1)}% saved)</span>
            )}
          </div>
        </div>

        {income.length > 0 && (
          <div className="mb-4 space-y-2">
            {INCOME_CATEGORIES.map((cat) => {
              const items = income.filter((i) => i.category === cat);
              if (items.length === 0) return null;
              const total = items.reduce((sum, i) => sum + i.amount, 0);
              return (
                <div key={cat} className="bg-slate-600 rounded-lg p-3 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: getIncomeCategoryColor(cat) }} />
                    <span className="text-white font-medium">{cat}</span>
                    <span className="text-slate-400 text-sm">({items.length})</span>
                  </div>
                  <span className="text-emerald-400 font-bold">${total.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        )}

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {income.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No income entries yet</p>
          ) : (
            income.slice().reverse().map((item) => (
              <div key={item.id} className="bg-slate-700 rounded-lg p-4 flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-semibold text-white">{item.source}</div>
                  <div className="text-sm text-slate-400 flex items-center gap-2">
                    {new Date(item.date).toLocaleDateString()}
                    <span
                      className="px-2 py-0.5 rounded text-xs"
                      style={{
                        backgroundColor: getIncomeCategoryColor(item.category) + '40',
                        color: getIncomeCategoryColor(item.category),
                      }}
                    >
                      {item.category}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-emerald-400">${item.amount.toFixed(2)}</span>
                  <button onClick={() => onDelete(item.id)} className="text-red-400 hover:text-red-300 transition-colors">
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
