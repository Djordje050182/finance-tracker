import { useCallback, useState } from 'react';
import { storageKeys } from '../utils/storage';
import { usePersistedState } from './usePersistedState';

const migrateIncome = (loaded) =>
  Array.isArray(loaded)
    ? loaded.map((i) => ({ ...i, category: i.category || 'Salary (Net)' }))
    : [];

export function useFinanceData() {
  const [expenses, setExpenses] = usePersistedState(storageKeys.expenses, []);
  const [budgets, setBudgets] = usePersistedState(storageKeys.budgets, {});
  const [userPreferences, setUserPreferences] = usePersistedState(storageKeys.preferences, {});
  const [income, setIncome] = usePersistedState(storageKeys.income, [], { migrate: migrateIncome });

  const [undoStack, setUndoStack] = useState([]);

  const pushUndo = useCallback((type, previousState) => {
    setUndoStack((s) => [...s.slice(-9), { type, previousState }]);
  }, []);

  const undo = useCallback(() => {
    if (undoStack.length === 0) return null;
    const last = undoStack[undoStack.length - 1];
    if (last.type === 'expense') setExpenses(last.previousState);
    else if (last.type === 'income') setIncome(last.previousState);
    setUndoStack((s) => s.slice(0, -1));
    return last.type;
  }, [undoStack, setExpenses, setIncome]);

  const learnCategory = useCallback((description, category) => {
    const key = description.toLowerCase().trim();
    setUserPreferences((prev) => ({ ...prev, [key]: category }));
  }, [setUserPreferences]);

  return {
    expenses, setExpenses,
    budgets, setBudgets,
    userPreferences, setUserPreferences,
    income, setIncome,
    undoStack, pushUndo, undo,
    learnCategory,
  };
}
