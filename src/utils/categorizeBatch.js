import { categorizeBatchAI, isAIEnabled } from '../services/ai';
import { detectCoffeeFromAmount, smartCategorize } from './smartCategorize';

export async function categorizeBatch(transactions, { userPreferences = {}, onStatus = () => {} } = {}) {
  const categorized = transactions.map((t) => {
    const coffee = detectCoffeeFromAmount(t.description, parseFloat(t.amount));
    if (coffee) return { ...t, ...coffee, needsAI: false };

    const smart = smartCategorize(t.description, userPreferences);
    if (smart) {
      return { ...t, category: smart.category, confidence: smart.confidence, needsAI: false };
    }
    return { ...t, category: 'Other', confidence: 'low', needsAI: true };
  });

  const needsAI = categorized.filter((t) => t.needsAI);
  if (needsAI.length === 0 || !isAIEnabled()) {
    if (needsAI.length > 0 && !isAIEnabled()) {
      onStatus(`✓ Categorized ${categorized.length - needsAI.length} via local rules (${needsAI.length} unclear, AI disabled — please review)`);
    } else {
      onStatus(`✓ Categorized ${transactions.length} transactions using smart detection`);
    }
    return assignIds(categorized);
  }

  onStatus(`${categorized.length - needsAI.length} auto-categorized, analyzing ${needsAI.length} unclear transactions with AI…`);

  try {
    const chunkSize = 20;
    const aiResults = [];
    for (let i = 0; i < needsAI.length; i += chunkSize) {
      const chunk = needsAI.slice(i, i + chunkSize);
      const results = await categorizeBatchAI(chunk);
      aiResults.push(...results);
    }

    let aiIndex = 0;
    const final = categorized.map((t) => {
      if (!t.needsAI) return t;
      const ai = aiResults[aiIndex++];
      return { ...t, category: ai?.category ?? 'Other', confidence: ai?.confidence ?? 'low' };
    });

    const high = final.filter((t) => t.confidence === 'high').length;
    const med = final.filter((t) => t.confidence === 'medium').length;
    const low = final.filter((t) => t.confidence === 'low').length;
    onStatus(`✓ Categorized: ${high} high confidence, ${med} medium, ${low} low — please review`);
    return assignIds(final);
  } catch (err) {
    console.error('AI categorization failed:', err);
    onStatus('⚠️ AI categorization failed, using best guesses — please review carefully');
    return assignIds(categorized);
  }
}

function assignIds(items) {
  return items.map((t, i) => ({ ...t, id: Date.now() + i }));
}
