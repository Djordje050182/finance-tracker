import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_COLORS, getCategoryColor } from '../constants/categories';

export function SearchBar({
  query,
  onQueryChange,
  results,
  onClear,
  onBulkChange,
  onRecategorizeAll,
  hasExpenses,
}) {
  return (
    <div className="bg-slate-800 rounded-xl p-4 mb-6 shadow-xl">
      <div className="flex gap-3 mb-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search expenses by provider…"
            className="w-full bg-slate-700 text-white pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>
        {results.length > 0 && (
          <button
            onClick={onClear}
            className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {hasExpenses && (
        <button
          onClick={onRecategorizeAll}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <SlidersHorizontal size={18} />
          Re-categorize All Expenses (Apply Latest Rules)
        </button>
      )}

      {results.length > 0 && (
        <div className="mt-4 bg-slate-700 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <div className="text-white font-semibold">
              Found {results.length} expense{results.length !== 1 ? 's' : ''}
              <span className="text-slate-400 text-sm ml-2">
                (Total: ${results.reduce((sum, e) => sum + e.amount, 0).toFixed(2)})
              </span>
            </div>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto mb-3">
            {results.map((expense) => (
              <div key={expense.id} className="bg-slate-600 rounded p-3 flex justify-between items-center">
                <div className="flex-1">
                  <div className="text-white text-sm font-medium">{expense.description}</div>
                  <div className="text-slate-400 text-xs flex gap-3">
                    <span>{new Date(expense.date).toLocaleDateString()}</span>
                    <span
                      className="px-2 py-0.5 rounded text-xs"
                      style={{
                        backgroundColor: getCategoryColor(expense.category) + '40',
                        color: getCategoryColor(expense.category),
                      }}
                    >
                      {expense.category}
                    </span>
                  </div>
                </div>
                <div className="text-emerald-400 font-bold ml-3">${expense.amount.toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div>
            <div className="text-slate-300 text-sm mb-2">Change all to:</div>
            <div className="flex gap-2 flex-wrap">
              {EXPENSE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => onBulkChange(cat)}
                  className="px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105"
                  style={{ backgroundColor: EXPENSE_CATEGORY_COLORS[cat], color: 'white' }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
