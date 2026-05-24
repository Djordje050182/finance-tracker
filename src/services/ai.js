const PROXY_URL = import.meta.env.VITE_AI_PROXY_URL;
const MODEL = import.meta.env.VITE_AI_MODEL || 'claude-sonnet-4-6';

export class AIError extends Error {}
export class AIDisabledError extends AIError {
  constructor() {
    super('AI proxy is not configured. Set VITE_AI_PROXY_URL in .env.');
  }
}

export const isAIEnabled = () => Boolean(PROXY_URL);

async function callProxy({ messages, max_tokens, signal }) {
  if (!PROXY_URL) throw new AIDisabledError();

  const response = await fetch(PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, max_tokens, messages }),
    signal,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new AIError(`AI request failed (${response.status}): ${text}`);
  }
  const data = await response.json();
  const content = data?.content?.[0]?.text;
  if (typeof content !== 'string') throw new AIError('Malformed AI response.');
  return content.trim();
}

const stripCodeFence = (text) =>
  text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

export async function categorizeOne(description, { signal } = {}) {
  const text = await callProxy({
    max_tokens: 100,
    signal,
    messages: [{
      role: 'user',
      content: `Categorize this expense: "${description}"

Available categories: Supermarket, Eating & Drinking Out, Coffee, Alcohol, Transport, Entertainment, Shopping, Bills, Subscriptions & Memberships, Rent & Mortgage, Health, Kids, Holiday, Other

Respond ONLY with a JSON object in this exact format:
{"category": "CategoryName", "confidence": "high/medium/low"}

Examples:
- "ABC Company Pty Ltd" -> {"category": "Shopping", "confidence": "low"}
- "Payment - Thank You" -> {"category": "Other", "confidence": "low"}
- "Online Purchase" -> {"category": "Shopping", "confidence": "medium"}`,
    }],
  });
  return JSON.parse(stripCodeFence(text));
}

export async function categorizeBatchAI(chunk, { signal } = {}) {
  const text = await callProxy({
    max_tokens: 2000,
    signal,
    messages: [{
      role: 'user',
      content: `You are categorizing bank transactions. Many descriptions are vague like "Card Purchase", "EFTPOS", "Payment", or company names you don't recognize.

Categories: Supermarket, Eating & Drinking Out, Coffee, Alcohol, Transport, Entertainment, Shopping, Bills, Subscriptions & Memberships, Rent & Mortgage, Health, Kids, Holiday, Other

COFFEE DETECTION RULES:
- Amounts $3-$20 at cafes/coffee shops → Coffee
- Keywords: cafe, coffee, espresso, barista, beans, roasters → Coffee
- Generic small purchases without clear indicators → ask yourself if it could be coffee

For unclear transactions:
- Generic descriptions like "Card Purchase", "Payment", "EFTPOS" → Shopping (medium confidence)
- Business names you don't recognize → Shopping (low confidence)
- Utility/phone companies → Bills (high confidence)
- Streaming services (Netflix, Spotify, Disney+) → Subscriptions & Memberships
- Gym memberships, fitness subscriptions → Subscriptions & Memberships
- Anything with "subscription", "monthly membership", "annual membership" → Subscriptions & Memberships
- Rent payments, mortgage payments, real estate → Rent & Mortgage
- Childcare, school fees, kids activities, toys → Kids
- Gas stations, mechanics → Transport
- Supermarkets (Woolworths, Coles, IGA) → Supermarket
- Cafes, coffee shops → Coffee
- Fast food, restaurants, takeaway, bars, pubs → Eating & Drinking Out
- Bottle shops (Dan Murphy's, BWS) → Alcohol
- Hotels, flights, travel → Holiday
- Utilities (electricity, gas, water, internet, phone bills) → Bills
- Insurance → Bills

Transactions to categorize:
${chunk.map((t, idx) => `${idx}: "${t.description}" ($${t.amount})`).join('\n')}

Respond ONLY with a JSON array (no markdown):
[{"index": 0, "category": "CategoryName", "confidence": "high/medium/low"}, ...]

Include ALL ${chunk.length} transactions.`,
    }],
  });
  return JSON.parse(stripCodeFence(text));
}

export async function getAdvice({ summary, tone, signal }) {
  const toneInstructions = tone === 'brutal'
    ? `You are a brutally honest financial advisor who doesn't sugarcoat anything. Be direct, blunt, and call out poor spending habits. Use phrases like "You're wasting money on...", "This is ridiculous...", "You need to stop...", "Seriously?". Be tough but constructive. Channel the energy of a disappointed parent or a drill sergeant. Make them feel the shame of their bad decisions while still providing actionable advice.`
    : `You are a friendly, encouraging financial advisor who provides supportive and positive guidance.`;

  return callProxy({
    max_tokens: 1000,
    signal,
    messages: [{
      role: 'user',
      content: `${toneInstructions}

Analyze this spending data:

Total Expenses: $${summary.totalExpenses.toFixed(2)}

Category Breakdown:
${summary.categoryBreakdown.map((c) =>
  `- ${c.category}: $${c.spent.toFixed(2)}${c.budget > 0 ? ` (Budget: $${c.budget})` : ''}`
).join('\n')}

Recent Transactions:
${summary.recentExpenses.map((e) => `- ${e.description} ($${e.amount}) - ${e.category}`).join('\n')}

Provide:
1. A brief spending analysis (2-3 sentences)
2. 2-3 specific, actionable tips to improve their finances
3. ${tone === 'brutal' ? 'A harsh reality check about their worst spending habit' : 'One positive observation about their spending habits'}

Keep it ${tone === 'brutal' ? 'brutally honest and direct' : 'conversational and encouraging'}, under 200 words.`,
    }],
  });
}

export async function chat({ summary, userMessage, signal }) {
  return callProxy({
    max_tokens: 500,
    signal,
    messages: [{
      role: 'user',
      content: `You are a helpful financial assistant analyzing spending data. Answer the user's question based on this data:

Total Expenses: $${summary.totalExpenses.toFixed(2)}
Total Income: $${summary.totalIncome.toFixed(2)}
Net: $${(summary.totalIncome - summary.totalExpenses).toFixed(2)}

Category Breakdown:
${summary.categories.map((c) =>
  `- ${c.category}: $${c.spent.toFixed(2)} (${c.count} transactions)${c.budget > 0 ? ` Budget: $${c.budget}` : ''}`
).join('\n')}

Recent Transactions:
${summary.recentExpenses.map((e) => `- ${e.description}: $${e.amount} (${e.category}, ${e.date})`).join('\n')}

User's question: ${userMessage}

Provide a direct, concise answer (2-3 sentences max). Be specific with numbers and percentages.`,
    }],
  });
}
