const ALLOWED_ORIGINS = new Set([
  'https://djordje050182.github.io',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]);

const corsHeaders = (origin) => {
  const allow = ALLOWED_ORIGINS.has(origin) ? origin : '';
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
};

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (!ALLOWED_ORIGINS.has(origin)) {
      return new Response('Origin not allowed', { status: 403 });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', {
        status: 405,
        headers: corsHeaders(origin),
      });
    }

    if (!env.ANTHROPIC_API_KEY) {
      return new Response('Server misconfigured: missing ANTHROPIC_API_KEY', {
        status: 500,
        headers: corsHeaders(origin),
      });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response('Invalid JSON', { status: 400, headers: corsHeaders(origin) });
    }

    const { model, max_tokens, messages } = body || {};
    if (!model || !max_tokens || !Array.isArray(messages)) {
      return new Response('Missing model/max_tokens/messages', {
        status: 400,
        headers: corsHeaders(origin),
      });
    }

    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({ model, max_tokens, messages }),
    });

    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: {
        'Content-Type': upstream.headers.get('Content-Type') || 'application/json',
        ...corsHeaders(origin),
      },
    });
  },
};
