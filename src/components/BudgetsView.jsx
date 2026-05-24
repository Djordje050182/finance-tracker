import React from 'react';
import { DollarSign, Target } from 'lucide-react';
import { EXPENSE_CATEGORIES } from '../constants/categories';

export function BudgetsView({ budgets, getCategoryTotal, onUpdate }) {
  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Target size={24} /> Set Budget Goals
      </h2>
      <div className="space-y-4">
        {EXPENSE_CATEGORIES.map((cat) => {
          const spent = getCategoryTotal(cat);
          const budget = budgets[cat] || 0;
          const percentage = budget > 0 ? (spent / budget) * 100 : 0;
          const over = spent > budget && budget > 0;

          return (
            <div key={cat} className="bg-slate-700 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold text-white text-lg">{cat}</span>
                <span className={`font-bold ${over ? 'text-red-400' : 'text-emerald-400'}`}>
                  ${spent.toFixed(2)} / ${budget.toFixed(2)}
                </span>
              </div>
              <div className="flex gap-3 items-center mb-2">
                <input
                  type="number"
                  step="10"
                  value={budget || ''}
                  onChange={(e) => onUpdate(cat, e.target.value)}
                  className="flex-1 bg-slate-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Set budget…"
                />
                <DollarSign className="text-slate-400" size={20} />
              </div>
              {budget > 0 && (
                <div className="h-3 bg-slate-600 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${over ? 'bg-red-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              )}
              {over && <p className="text-red-400 text-sm mt-2">Over budget by ${(spent - budget).toFixed(2)}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
