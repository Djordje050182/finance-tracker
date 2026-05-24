import React, { useCallback, useMemo, useState } from 'react';
import { Header } from './components/Header';
import { DateRangeAndTrends } from './components/DateRangeAndTrends';
import { SearchBar } from './components/SearchBar';
import { Navigation } from './components/Navigation';
import { AddExpenseView } from './components/AddExpenseView';
import { ImportView } from './components/ImportView';
import { IncomeView } from './components/IncomeView';
import { OverviewView } from './components/OverviewView';
import { AnalyticsView } from './components/AnalyticsView';
import { BudgetsView } from './components/BudgetsView';
import { ChatView } from './components/ChatView';
import { AdvisorView } from './components/AdvisorView';
import { CategoryDetailModal } from './components/CategoryDetailModal';
import { BulkUpdateModal } from './components/BulkUpdateModal';
import { Toast, useToast } from './components/Toast';
import { EXPENSE_CATEGORIES } from './constants/categories';
import { useFinanceData } from './hooks/useFinanceData';
import { parseCSV, readFileAsText } from './utils/csv';
import { categorizeBatch } from './utils/categorizeBatch';
import { smartCategorize } from './utils/smartCategorize';

const findSimilarExpenses = (expenses, description) => {
  const cleanDesc = description.toLowerCase().trim();
  return expenses.filter((e) => {
    const expenseDesc = e.description.toLowerCase().trim();
    if (expenseDesc === cleanDesc) return true;
    const merchant = cleanDesc.split(/[(\-]/)[0].trim();
    const expMerchant = expenseDesc.split(/[(\-]/)[0].trim();
    if (merchant.length > 3 && expMerchant.includes(merchant)) return true;
    if (expMerchant.length > 3 && merchant.includes(expMerchant)) return true;
    return false;
  });
};

const filterByDateRange = (expenses, dateRange) => {
  if (!dateRange.start && !dateRange.end) return expenses;
  return expenses.filter((e) => {
    const d = new Date(e.date);
    if (dateRange.start && d < new Date(dateRange.start)) return false;
    if (dateRange.end && d > new Date(dateRange.end)) return false;
    return true;
  });
};

const sortExpenses = (list, sort) => {
  const sorted = [...list];
  switch (sort) {
    case 'date-desc': return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
    case 'date-asc': return sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
    case 'amount-desc': return sorted.sort((a, b) => b.amount - a.amount);
    case 'amount-asc': return sorted.sort((a, b) => a.amount - b.amount);
    case 'name-asc': return sorted.sort((a, b) => a.description.localeCompare(b.description));
    case 'name-desc': return sorted.sort((a, b) => b.description.localeCompare(a.description));
    default: return sorted;
  }
};

export default function App() {
  const data = useFinanceData();
  const {
    expenses, setExpenses,
    budgets, setBudgets,
    userPreferences,
    income, setIncome,
    undoStack, pushUndo, undo,
    learnCategory,
  } = data;

  const [activeView, setActiveView] = useState('tracker');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [bulkUpdateModal, setBulkUpdateModal] = useState(null);
  const [modalFilter, setModalFilter] = useState('');
  const [modalSort, setModalSort] = useState('amount-desc');

  const [csvStatus, setCsvStatus] = useState('');
  const [pendingExpenses, setPendingExpenses] = useState([]);
  const [pendingIncome, setPendingIncome] = useState([]);
  const [toast, setToast] = useToast();

  const filteredExpenses = useMemo(
    () => filterByDateRange(expenses, dateRange),
    [expenses, dateRange],
  );

  const totalExpenses = useMemo(
    () => filteredExpenses.reduce((sum, e) => sum + e.amount, 0),
    [filteredExpenses],
  );

  const totalIncome = useMemo(
    () => income.reduce((sum, i) => sum + i.amount, 0),
    [income],
  );

  const getCategoryTotal = useCallback(
    (category) => filteredExpenses.filter((e) => e.category === category).reduce((s, e) => s + e.amount, 0),
    [filteredExpenses],
  );

  const pieData = useMemo(
    () => EXPENSE_CATEGORIES.map((cat) => ({ name: cat, value: getCategoryTotal(cat) })).filter((d) => d.value > 0),
    [getCategoryTotal],
  );

  const monthlyData = useMemo(() => {
    const totals = {};
    filteredExpenses.forEach((e) => {
      const month = e.date.substring(0, 7);
      totals[month] = (totals[month] || 0) + e.amount;
    });
    return Object.entries(totals).sort().slice(-6).map(([month, amount]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      amount,
    }));
  }, [filteredExpenses]);

  const comparison = useMemo(() => {
    const now = new Date();
    const thisStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const thisMonth = expenses.filter((e) => new Date(e.date) >= thisStart).reduce((s, e) => s + e.amount, 0);
    const lastMonth = expenses
      .filter((e) => {
        const d = new Date(e.date);
        return d >= lastStart && d <= lastEnd;
      })
      .reduce((s, e) => s + e.amount, 0);
    const change = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;
    return { thisMonth, lastMonth, change, isIncrease: thisMonth > lastMonth };
  }, [expenses]);

  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    return expenses.filter((e) => e.description.toLowerCase().includes(q));
  }, [expenses, searchQuery]);

  // ---------- Mutations ----------
  const addExpense = (expense) => {
    const dup = expenses.some(
      (existing) =>
        existing.description === expense.description &&
        existing.amount === expense.amount &&
        existing.date === expense.date,
    );
    if (dup) {
      setToast('Duplicate expense — already exists');
      return false;
    }
    pushUndo('expense', expenses);
    setExpenses([...expenses, expense]);
    setToast('Expense saved');
    return true;
  };

  const deleteExpense = (id) => {
    pushUndo('expense', expenses);
    setExpenses(expenses.filter((e) => e.id !== id));
    setToast('Expense deleted');
  };

  const handleUndo = () => {
    const type = undo();
    if (type) setToast(`Undone: ${type} change`);
    else setToast('Nothing to undo');
  };

  const updateBudget = (category, amount) => {
    setBudgets({ ...budgets, [category]: parseFloat(amount) || 0 });
    setToast('Budget saved');
  };

  const updateExpenseCategory = (id, newCategory) => {
    const expense = expenses.find((e) => e.id === id);
    if (!expense) return;
    pushUndo('expense', expenses);
    const similar = findSimilarExpenses(expenses, expense.description);
    const ids = similar.map((e) => e.id);
    setExpenses(expenses.map((e) => (ids.includes(e.id) ? { ...e, category: newCategory } : e)));
    learnCategory(expense.description, newCategory);
    setEditingExpenseId(null);
    setToast(ids.length > 1 ? `Updated ${ids.length} similar expenses` : 'Category changed');
  };

  const addIncome = (entry) => {
    pushUndo('income', income);
    setIncome([...income, entry]);
    setToast('Income added');
  };

  const deleteIncome = (id) => {
    pushUndo('income', income);
    setIncome(income.filter((i) => i.id !== id));
    setToast('Income deleted');
  };

  const bulkChangeSearchResults = (newCategory) => {
    if (searchResults.length === 0) return;
    pushUndo('expense', expenses);
    const ids = searchResults.map((e) => e.id);
    setExpenses(expenses.map((e) => (ids.includes(e.id) ? { ...e, category: newCategory } : e)));
    learnCategory(searchResults[0].description, newCategory);
    setToast(`Updated ${ids.length} expenses to ${newCategory}`);
    setSearchQuery('');
  };

  const recategorizeAll = () => {
    let changed = 0;
    const next = expenses.map((e) => {
      if (e.category === 'Eating Out' || e.category === 'Drinking Out') {
        changed++;
        return { ...e, category: 'Eating & Drinking Out' };
      }
      const smart = smartCategorize(e.description, userPreferences);
      if (smart && smart.category !== e.category) {
        changed++;
        return { ...e, category: smart.category };
      }
      return e;
    });
    if (changed > 0) {
      pushUndo('expense', expenses);
      setExpenses(next);
      setToast(`Re-categorized ${changed} expenses with latest rules`);
    } else {
      setToast('All expenses already correctly categorized');
    }
  };

  // ---------- CSV Import ----------
  const handleCSVUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setCsvStatus('Reading file…');

    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'pdf' || ext === 'xlsx' || ext === 'xls') {
      setCsvStatus('⚠️ Only CSV/TXT supported. Export as CSV from your bank.');
      event.target.value = '';
      return;
    }
    if (ext !== 'csv' && ext !== 'txt') {
      setCsvStatus('⚠️ Unsupported file type.');
      event.target.value = '';
      return;
    }

    try {
      const text = await readFileAsText(file);
      const transactions = parseCSV(text);
      if (transactions.length === 0) {
        setCsvStatus('No valid transactions found in file');
        event.target.value = '';
        return;
      }
      setCsvStatus(`Found ${transactions.length} transactions. Analyzing…`);

      const incomeEntries = [];
      const expenseEntries = [];
      transactions.forEach((t) => {
        if (t.amount > 0) {
          incomeEntries.push({
            id: Date.now() + Math.random(),
            source: t.description,
            amount: t.amount,
            date: t.date,
            category: 'Salary (Net)',
          });
        } else if (t.amount < 0) {
          expenseEntries.push({ ...t, amount: Math.abs(t.amount) });
        }
      });

      const isExpenseDup = (t) =>
        expenses.some((e) => e.description === t.description && e.amount === t.amount && e.date === t.date);
      const uniqueExpenses = expenseEntries.filter((t) => !isExpenseDup(t));
      const dupCount = expenseEntries.length - uniqueExpenses.length;

      const categorized =
        uniqueExpenses.length > 0
          ? await categorizeBatch(uniqueExpenses, { userPreferences, onStatus: setCsvStatus })
          : [];

      setPendingExpenses(categorized);
      setPendingIncome(incomeEntries);

      const parts = [];
      if (categorized.length > 0) {
        parts.push(`${categorized.length} expense${categorized.length !== 1 ? 's' : ''}`);
        if (dupCount > 0) parts.push(`(${dupCount} duplicate${dupCount !== 1 ? 's' : ''} skipped)`);
      }
      if (incomeEntries.length > 0) {
        parts.push(`${incomeEntries.length} income entr${incomeEntries.length !== 1 ? 'ies' : 'y'}`);
      }
      setCsvStatus(`✅ Ready to import: ${parts.join(', ')}. Review below.`);
    } catch (err) {
      setCsvStatus(`Error: ${err.message}`);
    }
    event.target.value = '';
  };

  const confirmImport = () => {
    const messages = [];
    if (pendingExpenses.length > 0) {
      pushUndo('expense', expenses);
      setExpenses([...expenses, ...pendingExpenses]);
      messages.push(`${pendingExpenses.length} expense${pendingExpenses.length !== 1 ? 's' : ''}`);
      setPendingExpenses([]);
    }
    if (pendingIncome.length > 0) {
      pushUndo('income', income);
      setIncome([...income, ...pendingIncome]);
      messages.push(`${pendingIncome.length} income entr${pendingIncome.length !== 1 ? 'ies' : 'y'}`);
      setPendingIncome([]);
    }
    const successMessage = messages.length > 0 ? `✅ Import Complete! Added ${messages.join(' and ')}` : '✅ Import Complete!';
    setCsvStatus(successMessage);
    setToast(successMessage);
    setTimeout(() => setCsvStatus(''), 5000);
  };

  // ---------- Bulk update modal flow (unused but kept for similar-expense flow if reintroduced) ----------
  // (updateExpenseCategory now applies to all similar without confirmation, matching original "auto-apply" behavior.)

  // ---------- Modal data ----------
  const modalExpenses = useMemo(() => {
    if (!selectedCategory) return [];
    let list = expenses.filter((e) => e.category === selectedCategory);
    if (modalFilter) {
      const f = modalFilter.toLowerCase();
      list = list.filter((e) => e.description.toLowerCase().includes(f));
    }
    return sortExpenses(list, modalSort);
  }, [expenses, selectedCategory, modalFilter, modalSort]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 md:p-8">
      <Toast message={toast} />

      <div className="max-w-7xl mx-auto">
        <Header
          totalExpenses={totalExpenses}
          totalIncome={totalIncome}
          undoCount={undoStack.length}
          onUndo={handleUndo}
        />

        <DateRangeAndTrends
          dateRange={dateRange}
          setDateRange={setDateRange}
          filteredCount={filteredExpenses.length}
          totalCount={expenses.length}
          comparison={comparison}
        />

        <SearchBar
          query={searchQuery}
          onQueryChange={setSearchQuery}
          results={searchResults}
          onClear={() => setSearchQuery('')}
          onBulkChange={bulkChangeSearchResults}
          onRecategorizeAll={recategorizeAll}
          hasExpenses={expenses.length > 0}
        />

        <Navigation active={activeView} onChange={setActiveView} />

        {activeView === 'tracker' && (
          <AddExpenseView
            expenses={expenses}
            userPreferences={userPreferences}
            onAdd={addExpense}
            onDelete={deleteExpense}
          />
        )}

        {activeView === 'import' && (
          <ImportView
            status={csvStatus}
            onUpload={handleCSVUpload}
            pendingExpenses={pendingExpenses}
            pendingIncome={pendingIncome}
            onUpdatePendingExpense={(id, category) =>
              setPendingExpenses((prev) => prev.map((t) => (t.id === id ? { ...t, category } : t)))
            }
            onUpdatePendingIncome={(id, category) =>
              setPendingIncome((prev) => prev.map((i) => (i.id === id ? { ...i, category } : i)))
            }
            onConfirm={confirmImport}
            onCancel={() => {
              setPendingExpenses([]);
              setPendingIncome([]);
              setCsvStatus('');
            }}
          />
        )}

        {activeView === 'income' && (
          <IncomeView
            income={income}
            totalIncome={totalIncome}
            totalExpenses={totalExpenses}
            onAdd={addIncome}
            onDelete={deleteIncome}
          />
        )}

        {activeView === 'overview' && (
          <OverviewView
            pieData={pieData}
            monthlyData={monthlyData}
            totalExpenses={totalExpenses}
            expenses={filteredExpenses}
            getCategoryTotal={getCategoryTotal}
            onSelectCategory={setSelectedCategory}
          />
        )}

        {activeView === 'analytics' && (
          <AnalyticsView
            filteredExpenses={filteredExpenses}
            totalExpenses={totalExpenses}
            getCategoryTotal={getCategoryTotal}
          />
        )}

        {activeView === 'budgets' && (
          <BudgetsView budgets={budgets} getCategoryTotal={getCategoryTotal} onUpdate={updateBudget} />
        )}

        {activeView === 'ai-chat' && (
          <ChatView
            expenses={expenses}
            income={income}
            budgets={budgets}
            totalExpenses={totalExpenses}
            getCategoryTotal={getCategoryTotal}
          />
        )}

        {activeView === 'advisor' && (
          <AdvisorView
            expenses={expenses}
            budgets={budgets}
            totalExpenses={totalExpenses}
            getCategoryTotal={getCategoryTotal}
          />
        )}

        <CategoryDetailModal
          category={selectedCategory}
          expenses={modalExpenses}
          total={selectedCategory ? getCategoryTotal(selectedCategory) : 0}
          filter={modalFilter}
          setFilter={setModalFilter}
          sort={modalSort}
          setSort={setModalSort}
          editingId={editingExpenseId}
          setEditingId={setEditingExpenseId}
          onUpdateCategory={updateExpenseCategory}
          onClose={() => {
            setSelectedCategory(null);
            setModalFilter('');
            setModalSort('amount-desc');
          }}
        />

        <BulkUpdateModal
          modal={bulkUpdateModal}
          onConfirmAll={() => {
            if (!bulkUpdateModal) return;
            pushUndo('expense', expenses);
            const ids = bulkUpdateModal.allIds;
            setExpenses(expenses.map((e) => (ids.includes(e.id) ? { ...e, category: bulkUpdateModal.newCategory } : e)));
            learnCategory(bulkUpdateModal.expense.description, bulkUpdateModal.newCategory);
            setBulkUpdateModal(null);
            setToast(`Updated ${ids.length} expenses`);
          }}
          onConfirmSingle={() => {
            if (!bulkUpdateModal) return;
            pushUndo('expense', expenses);
            setExpenses(
              expenses.map((e) =>
                e.id === bulkUpdateModal.expense.id ? { ...e, category: bulkUpdateModal.newCategory } : e,
              ),
            );
            learnCategory(bulkUpdateModal.expense.description, bulkUpdateModal.newCategory);
            setBulkUpdateModal(null);
            setToast('Category changed');
          }}
          onCancel={() => setBulkUpdateModal(null)}
        />
      </div>
    </div>
  );
}
