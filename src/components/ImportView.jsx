import React from 'react';
import { FileText, Upload } from 'lucide-react';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants/categories';

export function ImportView({
  status,
  onUpload,
  pendingExpenses,
  pendingIncome,
  onUpdatePendingExpense,
  onUpdatePendingIncome,
  onConfirm,
  onCancel,
}) {
  const isError = status.includes('Error') || status.includes('⚠️');
  const isSuccess = status.includes('✅') || status.includes('Ready') || status.includes('Review');
  const isLoading = status.includes('Categorizing') || status.includes('Analyzing') || status.includes('Reading');

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-xl p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Upload size={24} /> Smart Import — Income & Expenses
        </h2>

        <div className="bg-slate-700 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
            <FileText size={18} /> Universal Import Features:
          </h3>
          <ul className="text-slate-300 space-y-2 ml-4 list-disc">
            <li><strong>Auto-separates:</strong> Positive amounts → Income, Negative → Expenses</li>
            <li><strong>Smart categorization:</strong> Local rules + optional AI</li>
            <li><strong>Duplicate detection:</strong> Won't import the same transaction twice</li>
            <li><strong>Review before import:</strong> Adjust categories as needed</li>
            <li><strong>Works with any bank:</strong> Requires Date, Description, Amount columns</li>
          </ul>
        </div>

        <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
          <input type="file" accept=".csv,.txt" onChange={onUpload} className="hidden" id="csv-upload" />
          <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center gap-3">
            <Upload size={48} className="text-slate-400" />
            <div>
              <p className="text-white font-semibold mb-1">Click to upload bank statement (CSV)</p>
              <p className="text-slate-400 text-sm">Automatically handles income and expenses</p>
            </div>
          </label>
        </div>

        {status && (
          <div
            className={`mt-4 p-4 rounded-lg border ${
              isError ? 'bg-red-900/30 text-red-300 border-red-500'
                : isSuccess ? 'bg-emerald-900/30 text-emerald-300 border-emerald-500'
                : 'bg-blue-900/30 text-blue-300 border-blue-500'
            }`}
          >
            <div className="flex items-center gap-2">
              {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-300 border-t-transparent" />}
              <span>{status}</span>
            </div>
          </div>
        )}
      </div>

      {(pendingExpenses.length > 0 || pendingIncome.length > 0) && (
        <>
          {pendingExpenses.length > 0 && (
            <div className="bg-slate-800 rounded-xl p-6 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-4">Review Expenses ({pendingExpenses.length})</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto mb-4">
                {pendingExpenses.map((t) => (
                  <div key={t.id} className="bg-slate-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="font-semibold text-white">{t.description}</div>
                        <div className="text-sm text-slate-400">{new Date(t.date).toLocaleDateString()}</div>
                      </div>
                      <div className="text-lg font-bold text-red-400">-${t.amount.toFixed(2)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={t.category}
                        onChange={(e) => onUpdatePendingExpense(t.id, e.target.value)}
                        className="flex-1 bg-slate-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                      >
                        {EXPENSE_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          t.confidence === 'high' ? 'bg-emerald-600 text-white'
                            : t.confidence === 'medium' ? 'bg-yellow-600 text-white'
                            : 'bg-orange-600 text-white'
                        }`}
                      >
                        {t.confidence}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pendingIncome.length > 0 && (
            <div className="bg-slate-800 rounded-xl p-6 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-4">Review Income ({pendingIncome.length})</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto mb-4">
                {pendingIncome.map((item) => (
                  <div key={item.id} className="bg-slate-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="font-semibold text-white">{item.source}</div>
                        <div className="text-sm text-slate-400">{new Date(item.date).toLocaleDateString()}</div>
                      </div>
                      <div className="text-lg font-bold text-emerald-400">+${item.amount.toFixed(2)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-slate-400 text-sm">Category:</label>
                      <select
                        value={item.category}
                        onChange={(e) => onUpdatePendingIncome(item.id, e.target.value)}
                        className="flex-1 bg-slate-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                      >
                        {INCOME_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-slate-800 rounded-xl p-6 shadow-xl">
            <div className="flex gap-3">
              <button
                onClick={onConfirm}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-lg transition-colors"
              >
                Import All ({pendingExpenses.length} expenses{pendingIncome.length > 0 && `, ${pendingIncome.length} income`})
              </button>
              <button
                onClick={onCancel}
                className="px-6 bg-slate-600 hover:bg-slate-500 text-white font-bold py-3 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
