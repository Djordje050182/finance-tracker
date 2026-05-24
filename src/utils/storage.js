const PREFIX = 'finance-';

export const storageKeys = {
  expenses: `${PREFIX}expenses`,
  budgets: `${PREFIX}budgets`,
  preferences: `${PREFIX}user-preferences`,
  income: `${PREFIX}income`,
  recurring: `${PREFIX}recurring`,
};

export const loadJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`Failed to load ${key}:`, err);
    return fallback;
  }
};

export const saveJSON = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to save ${key}:`, err);
  }
};
