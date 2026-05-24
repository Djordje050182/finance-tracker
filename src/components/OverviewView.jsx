import React from 'react';
import { BarChart, Bar, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_COLORS } from '../constants/categories';

export function OverviewView({
  pieData,
  monthlyData,
  totalExpenses,
  expenses,
  getCategoryTotal,
  onSelectCategory,
}) {
  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-xl p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-6">Spending by Category</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={idx} fill={EXPENSE_CATEGORY_COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `$${v.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-400">No expense data yet</p>
            )}
          </div>

          <div className="space-y-3">
            {EXPENSE_CATEGORIES.map((cat) => {
              const total = getCategoryTotal(cat);
              if (total === 0) return null;
              const count = expenses.filter((e) => e.category === cat).length;
              return (
                <div key={cat} className="bg-slate-700 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-white">{cat}</span>
                    <span className="text-emerald-400 font-bold">${total.toFixed(2)}</span>
                  </div>
                  <div className="h-2 bg-slate-600 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${totalExpenses > 0 ? (total / totalExpenses) * 100 : 0}%`,
                        backgroundColor: EXPENSE_CATEGORY_COLORS[cat],
                      }}
                    />
                  </div>
                  <button
                    onClick={() => onSelectCategory(cat)}
                    className="text-sm text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    View {count} transactions →
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-6">Monthly Spending Trend</h2>
        {monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                formatter={(v) => `$${v.toFixed(2)}`}
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
              />
              <Legend />
              <Bar dataKey="amount" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-slate-400 text-center">No monthly data yet</p>
        )}
      </div>
    </div>
  );
}
