export const EXPENSE_CATEGORIES = [
  'Supermarket',
  'Eating & Drinking Out',
  'Coffee',
  'Alcohol',
  'Transport',
  'Entertainment',
  'Shopping',
  'Bills',
  'Subscriptions & Memberships',
  'Rent & Mortgage',
  'Health',
  'Kids',
  'Holiday',
  'Other',
];

export const EXPENSE_CATEGORY_COLORS = {
  'Supermarket': '#2ECC71',
  'Eating & Drinking Out': '#FF6B6B',
  'Coffee': '#8B4513',
  'Alcohol': '#9B59B6',
  'Transport': '#4ECDC4',
  'Entertainment': '#FFE66D',
  'Shopping': '#A8E6CF',
  'Bills': '#FF8B94',
  'Subscriptions & Memberships': '#3498DB',
  'Rent & Mortgage': '#E67E22',
  'Health': '#C7CEEA',
  'Kids': '#FF69B4',
  'Holiday': '#FF8C00',
  'Other': '#B4A7D6',
};

export const INCOME_CATEGORIES = [
  'Salary (Net)',
  'Salary (Gross)',
  'Freelance',
  'Rental Income',
  'Investment Income',
  'Business Income',
  'Government Benefits',
  'Gift/Inheritance',
  'Other',
];

export const INCOME_CATEGORY_COLORS = {
  'Salary (Net)': '#2ECC71',
  'Salary (Gross)': '#27AE60',
  'Freelance': '#3498DB',
  'Rental Income': '#9B59B6',
  'Investment Income': '#F39C12',
  'Business Income': '#E67E22',
  'Government Benefits': '#1ABC9C',
  'Gift/Inheritance': '#E74C3C',
  'Other': '#95A5A6',
};

export const getCategoryColor = (category) =>
  EXPENSE_CATEGORY_COLORS[category] || EXPENSE_CATEGORY_COLORS['Other'];

export const getIncomeCategoryColor = (category) =>
  INCOME_CATEGORY_COLORS[category] || INCOME_CATEGORY_COLORS['Other'];
