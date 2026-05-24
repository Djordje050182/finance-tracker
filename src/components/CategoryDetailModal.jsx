import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { EXPENSE_CATEGORIES, getCategoryColor } from '../constants/categories';

export function CategoryDetailModal({
  category,
  expenses,
  total,
  filter,
  setFilter,
  sort,
  setSort,
  editingId,
  setEditingId,
  onUpdateCategory,
  onClose,
}) {
  if (!category) return null;
  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-start justify-center z-50 overflow-y-auto p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 rounded-xl max-w-2xl w-full my-8 flex flex-col max-h-[calc(100vh-4rem)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-700 flex-shrink-0">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="w-4 h-4 rounded-full" style={{ backgroundColor: getCategoryColor(category) }} />
              {category} Expenses
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">×</button>
          </div>
          <p className="text-slate-400 mb-4">Total: ${total.toFixed(2)}</p>

          <div className="flex gap-3 flex-col sm:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter by name…"
                className="w-full bg-slate-700 text-white text-sm pl-9 pr-3 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div className="relative">
              <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-slate-700 text-white text-sm pl-9 pr-8 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none appearance-none cursor-pointer"
              >
                <option value="date-desc">Date (Newest)</option>
                <option value="date-asc">Date (Oldest)</option>
                <option value="amount-desc">Amount (High-Low)</option>
                <option value="amount-asc">Amount (Low-High)</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1 min-h-0">
          <div className="space-y-3">
            {expenses.length === 0 ? (
              <p className="text-slate-400 text-center py-8">
                {filter ? 'No expenses match your filter' : 'No expenses in this category'}
              </p>
            ) : (
              expenses.map((expense) => (
                <div key={expense.id} className="bg-slate-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="font-semibold text-white">{expense.description}</div>
                      <div className="text-sm text-slate-400">{new Date(expense.date).toLocaleDateString()}</div>
                    </div>
                    <div className="text-lg font-bold text-emerald-400">${expense.amount.toFixed(2)}</div>
                  </div>

                  {editingId === expense.id ? (
                    <div className="mt-3">
                      <div className="text-xs text-slate-400 mb-2">Select new category:</div>
                      <select
                        value={expense.category}
                        onChange={(e) => {
                          const next = e.target.value;
                          if (next !== expense.category) onUpdateCategory(expense.id, next);
                        }}
                        onBlur={() => setEditingId(null)}
                        className="w-full bg-slate-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                        autoFocus
                      >
                        {EXPENSE_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                      <button onClick={() => setEditingId(null)} className="text-xs text-slate-400 hover:text-slate-300 mt-2">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingId(expense.id)}
                      className="text-sm text-slate-400 hover:text-emerald-400 transition-colors mt-2"
                    >
                      Change category
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
