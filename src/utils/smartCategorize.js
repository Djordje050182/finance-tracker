import { MERCHANT_DATABASE } from '../constants/merchantDatabase';

const COFFEE_INDICATORS = [
  'cafe', 'coffee', 'espresso', 'barista', 'roasters', 'roastery', 'brew', 'bean', 'beans',
  'latte', 'cappuccino', 'flat white', 'macchiato', 'mocha',
  'starbucks', 'gloria jeans', 'the coffee club', 'zarraffa',
  'campos', 'toby estate', 'allpress', 'single o', 'pablo & rusty',
  'cup', 'grind', 'espresso bar', 'coffee bar', 'daily grind',
];

export function smartCategorize(description, userPreferences = {}) {
  const desc = description.toLowerCase().trim();

  if (userPreferences[desc]) {
    return { category: userPreferences[desc], confidence: 'high', source: 'learned' };
  }
  for (const [key, category] of Object.entries(userPreferences)) {
    if (desc.includes(key) || key.includes(desc)) {
      return { category, confidence: 'high', source: 'learned' };
    }
  }

  if (COFFEE_INDICATORS.some((kw) => desc.includes(kw))) {
    return { category: 'Coffee', confidence: 'high', source: 'coffee-detection' };
  }

  for (const [category, keywords] of Object.entries(MERCHANT_DATABASE)) {
    for (const keyword of keywords) {
      if (desc.includes(keyword)) {
        return { category, confidence: 'high', source: 'database' };
      }
    }
  }

  if (desc.match(/\d{4}\s*\d{4}\s*\d{4}\s*\d{4}/)) {
    return { category: 'Bills', confidence: 'medium', source: 'pattern' };
  }
  if (desc.includes('www.') || desc.includes('.com') || desc.includes('.au')) {
    return { category: 'Shopping', confidence: 'medium', source: 'pattern' };
  }

  return null;
}

const COFFEE_KEYWORDS = ['cafe', 'coffee', 'espresso', 'barista', 'roasters', 'brew', 'bean', 'beans', 'latte', 'cup', 'grind'];
const WEAK_COFFEE_INDICATORS = ['corner', 'street', 'house', 'store', 'co ', 'co.', 'brothers', 'sisters'];

export function detectCoffeeFromAmount(description, amount) {
  const desc = description.toLowerCase();
  const isCoffeeAmount = amount >= 3 && amount <= 20;
  const hasCoffeeKeyword = COFFEE_KEYWORDS.some((kw) => desc.includes(kw));
  if (hasCoffeeKeyword) return { category: 'Coffee', confidence: 'high' };
  const hasWeakIndicator = WEAK_COFFEE_INDICATORS.some((kw) => desc.includes(kw));
  if (isCoffeeAmount && hasWeakIndicator && desc.length < 40) {
    return { category: 'Coffee', confidence: 'medium' };
  }
  return null;
}
