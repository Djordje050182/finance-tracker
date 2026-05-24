import React from 'react';
import { Calendar, TrendingUp } from 'lucide-react';
import { todayISO } from '../utils/dates';

const PRESETS = [
  {
    label: 'This Month',
    range: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: start.toISOString().split('T')[0], end: todayISO() };
    },
  },
  {
    label: 'Last Month',
    range: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
    },
  },
  {
    label: 'Last 3 Months',
    range: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      return { start: start.toISOString().split('T')[0], end: todayISO() };
    },
  },
  {
    label: 'Last 6 Months',
    range: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
      return { start: start.toISOString().split('T')[0], end: todayISO() };
    },
  },
  {
    label: 'Last Year',
    range: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 12, now.getDate());
      return { start: start.toISOString().split('T')[0], end: todayISO() };
    },
  },
  {
    label: 'Year to Date',
    range: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 1);
      return { start: start.toISOString().split('T')[0], end: todayISO() };
    },
  },
];

export function DateRangeAndTrends({
  dateRange,
  setDateRange,
  filteredCount,
  totalCount,
  comparison,
}) {
  return (
    <div className="bg-slate-800 rounded-xl p-6 mb-6 shadow-xl">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Calendar size={20} />
            Filter by Date Range
          </h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => setDateRange(p.range())}
                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors"
              >
                {p.label}
              </button>
            ))}
            <button
              onClick={() => setDateRange({ start: '', end: '' })}
              className="px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white text-sm rounded-lg transition-colors"
            >
              All Time
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="flex-1 bg-slate-700 text-white px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="flex-1 bg-slate-700 text-white px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          {(dateRange.start || dateRange.end) && (
            <p className="text-slate-400 text-sm mt-2">
              Showing {filteredCount} of {totalCount} expenses
            </p>
          )}
        </div>

        <div>
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <TrendingUp size={20} />
            This Month vs Last Month
          </h3>
          <div className="bg-slate-700 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <div className="text-slate-400 text-sm">This Month</div>
                <div className="text-white text-xl font-bold">${comparison.thisMonth.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-slate-400 text-sm">Last Month</div>
                <div className="text-white text-xl font-bold">${comparison.lastMonth.toFixed(2)}</div>
              </div>
            </div>
            <div className={`flex items-center gap-2 ${comparison.isIncrease ? 'text-red-400' : 'text-emerald-400'}`}>
              {comparison.isIncrease ? '▲' : '▼'}
              <span className="font-semibold">
                {comparison.isIncrease ? '+' : ''}{comparison.change.toFixed(1)}%
              </span>
              <span className="text-slate-300 text-sm">
                {comparison.isIncrease ? 'increase' : 'decrease'} in spending
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
