import React from 'react';
import { Wallet } from 'lucide-react';

export function Header({ totalExpenses, totalIncome, undoCount, onUndo }) {
  return (
    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 mb-6 shadow-xl">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-3">
          <Wallet className="text-white" size={32} />
          <h1 className="text-3xl font-bold text-white">Finance Tracker</h1>
        </div>
        {undoCount > 0 && (
          <button
            onClick={onUndo}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            ↩ Undo
          </button>
        )}
      </div>
      <div className="text-white text-lg">
        Total Expenses: <span className="font-bold text-2xl">${totalExpenses.toFixed(2)}</span>
        {totalIncome > 0 && (
          <span className="ml-4">
            Income: <span className="font-bold text-2xl">${totalIncome.toFixed(2)}</span>
            <span className="ml-2 text-sm">
              (Net: ${(totalIncome - totalExpenses).toFixed(2)})
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
