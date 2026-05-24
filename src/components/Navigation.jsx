import React from 'react';
import { Plus, Upload, Coins, TrendingUp, BarChart3, Target, MessageSquare, MessageCircle } from 'lucide-react';

const ITEMS = [
  { id: 'tracker', label: 'Add Expense', icon: Plus },
  { id: 'import', label: 'Import CSV', icon: Upload },
  { id: 'income', label: 'Income', icon: Coins },
  { id: 'overview', label: 'Overview', icon: TrendingUp },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'budgets', label: 'Budgets', icon: Target },
  { id: 'ai-chat', label: 'AI Chat', icon: MessageSquare },
  { id: 'advisor', label: 'AI Advisor', icon: MessageCircle },
];

export function Navigation({ active, onChange }) {
  return (
    <div className="flex gap-2 mb-6 flex-wrap">
      {ITEMS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
            active === id ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <Icon size={20} />
          {label}
        </button>
      ))}
    </div>
  );
}
