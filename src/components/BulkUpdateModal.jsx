import React from 'react';
import { EXPENSE_CATEGORY_COLORS } from '../constants/categories';

export function BulkUpdateModal({ modal, onConfirmAll, onConfirmSingle, onCancel }) {
  if (!modal) return null;
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
      <div className="bg-slate-800 rounded-xl max-w-lg w-full p-6 border-2 border-emerald-500">
        <h3 className="text-xl font-bold text-white mb-4">Update Multiple Expenses?</h3>
        <p className="text-slate-300 mb-4">
          Found <span className="font-bold text-emerald-400">{modal.similarExpenses.length} other expense(s)</span> from the same or similar merchant:
        </p>

        <div className="bg-slate-700 rounded-lg p-3 mb-4 max-h-48 overflow-y-auto">
          <div className="font-semibold text-white mb-2">"{modal.expense.description}"</div>
          <div className="space-y-1 text-sm">
            {modal.similarExpenses.slice(0, 5).map((e) => (
              <div key={e.id} className="text-slate-400 flex justify-between">
                <span>{e.description}</span>
                <span className="text-slate-500">${e.amount.toFixed(2)}</span>
              </div>
            ))}
            {modal.similarExpenses.length > 5 && (
              <div className="text-slate-500 italic">
                …and {modal.similarExpenses.length - 5} more
              </div>
            )}
          </div>
        </div>

        <p className="text-slate-300 mb-6">
          Change all to <span className="font-bold" style={{ color: EXPENSE_CATEGORY_COLORS[modal.newCategory] }}>{modal.newCategory}</span>?
        </p>

        <div className="flex gap-3">
          <button
            onClick={onConfirmAll}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-lg transition-colors"
          >
            Yes, Update All {modal.allIds.length}
          </button>
          <button
            onClick={onConfirmSingle}
            className="flex-1 bg-slate-600 hover:bg-slate-500 text-white font-bold py-3 rounded-lg transition-colors"
          >
            Just This One
          </button>
        </div>
        <button onClick={onCancel} className="w-full mt-3 text-slate-400 hover:text-white py-2 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}
