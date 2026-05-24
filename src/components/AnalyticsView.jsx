import React, { useMemo } from 'react';
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_COLORS, getCategoryColor } from '../constants/categories';
import { daysBetween } from '../utils/dates';

export function AnalyticsView({ filteredExpenses, totalExpenses, getCategoryTotal }) {
  const stats = useMemo(() => {
    if (filteredExpenses.length === 0) {
      return { perDay: 0, perWeek: 0, days: 0, weeks: 0, oldest: null, newest: null };
    }
    const dates = filteredExpenses.map((e) => new Date(e.date).getTime());
    const oldest = Math.min(...dates);
    const newest = Math.max(...dates);
    const days = daysBetween(oldest, newest);
    const weeks = Math.max(1, Math.ceil((newest - oldest) / (1000 * 60 * 60 * 24 * 7)));
    return {
      perDay: totalExpenses / days,
      perWeek: totalExpenses / weeks,
      days,
      weeks,
      oldest: new Date(oldest),
      newest: new Date(newest),
    };
  }, [filteredExpenses, totalExpenses]);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        <StatCard label="Avg per Day" value={`$${stats.perDay.toFixed(2)}`} sub={stats.days ? `Over ${stats.days} days` : ''} />
        <StatCard label="Avg per Week" value={`$${stats.perWeek.toFixed(2)}`} sub={stats.weeks ? `Over ${stats.weeks} weeks` : ''} />
        <StatCard
          label="Total Transactions"
          value={String(filteredExpenses.length)}
          sub={
            stats.oldest && stats.newest
              ? `${stats.oldest.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${stats.newest.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
              : ''
          }
        />
        <StatCard
          label="Avg Transaction"
          value={`$${filteredExpenses.length > 0 ? (totalExpenses / filteredExpenses.length).toFixed(2) : '0.00'}`}
          sub="Per purchase"
        />
      </div>

      <div className="bg-slate-800 rounded-xl p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-6">Top Suppliers by Category</h2>
        <div className="space-y-6">
          {EXPENSE_CATEGORIES.map((category) => {
            const categoryExpenses = filteredExpenses.filter((e) => e.category === category);
            if (categoryExpenses.length === 0) return null;

            const supplierTotals = {};
            categoryExpenses.forEach((e) => {
              supplierTotals[e.description] = (supplierTotals[e.description] || 0) + e.amount;
            });
            const topSuppliers = Object.entries(supplierTotals).sort((a, b) => b[1] - a[1]).slice(0, 5);
            const categoryTotal = getCategoryTotal(category);

            return (
              <div key={category} className="bg-slate-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: getCategoryColor(category) }} />
                    {category}
                  </h3>
                  <span className="text-slate-400 text-sm">${categoryTotal.toFixed(2)} total</span>
                </div>
                <div className="space-y-2">
                  {topSuppliers.map(([supplier, amount]) => {
                    const pct = (amount / categoryTotal) * 100;
                    const count = categoryExpenses.filter((e) => e.description === supplier).length;
                    return (
                      <div key={supplier} className="bg-slate-600 rounded p-3">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex-1">
                            <div className="text-white text-sm font-medium">{supplier}</div>
                            <div className="text-slate-400 text-xs">
                              {count} transaction{count !== 1 ? 's' : ''} • Avg ${(amount / count).toFixed(2)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-emerald-400 font-bold">${amount.toFixed(2)}</div>
                            <div className="text-slate-400 text-xs">{pct.toFixed(1)}%</div>
                          </div>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, backgroundColor: EXPENSE_CATEGORY_COLORS[category] }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-slate-800 rounded-xl p-4 shadow-xl">
      <div className="text-slate-400 text-sm">{label}</div>
      <div className="text-white text-2xl font-bold">{value}</div>
      {sub && <div className="text-slate-400 text-xs mt-1">{sub}</div>}
    </div>
  );
}
