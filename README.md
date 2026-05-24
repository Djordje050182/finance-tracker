# Finance Tracker

Personal expense + income tracker with AI-assisted categorization, CSV import from any bank, budgets, and a chat-style spending advisor. Built with React + Vite, deploys to GitHub Pages, AI calls go through a Cloudflare Worker that holds the Anthropic API key.

Live URL: `https://djordje050182.github.io/finance-tracker/`

## Architecture

```
Browser (React app on GitHub Pages)
      │
      │  POST /  { model, max_tokens, messages }
      ▼
Cloudflare Worker (worker/)
  - holds ANTHROPIC_API_KEY as a secret
  - CORS-restricted to the Pages origin + localhost
      │
      ▼
api.anthropic.com
```

All user data (expenses, income, budgets, learned preferences) is stored locally in `localStorage`. Nothing is sent to any server except the AI requests.

## Local development

Prereqs: Node 20+.

```bash
npm install
cp .env.example .env
# Optional, for AI features: point VITE_AI_PROXY_URL at a running worker
#   VITE_AI_PROXY_URL=http://127.0.0.1:8787
npm run dev
```

The app runs without `VITE_AI_PROXY_URL` set — AI features just become no-ops.

## Deploying the AI proxy (Cloudflare Worker)

One-time setup:

```bash
cd worker
npm install
npx wrangler login                    # opens browser
npx wrangler secret put ANTHROPIC_API_KEY
# paste your key when prompted
npm run deploy
```

Wrangler prints a URL like `https://finance-tracker-ai.<your-subdomain>.workers.dev`. That's your `VITE_AI_PROXY_URL`.

If you change the deployed app's origin (custom domain, repo rename), update `ALLOWED_ORIGINS` in `worker/src/index.js` and redeploy.

## Deploying the app (GitHub Pages)

`.github/workflows/deploy.yml` builds and publishes on every push to `main`.

Before the first deploy:

1. Repo settings → Pages → Source: GitHub Actions.
2. Repo settings → Secrets and variables → Actions → New repository secret:
   - Name: `VITE_AI_PROXY_URL`
   - Value: the workers.dev URL from above
3. Push to `main`. The workflow runs `npm run build` with that env var baked in.

If the repo name is anything other than `finance-tracker`, update `base` in `vite.config.js` to match.

## Project layout

```
src/
  components/        # one file per view + small UI bits
  hooks/             # usePersistedState, useFinanceData
  services/ai.js     # the only place that talks to the proxy
  utils/             # csv, dates, smartCategorize, categorizeBatch, storage
  constants/         # categories + merchant database
  App.jsx            # orchestrator
worker/              # Cloudflare Worker proxy for Anthropic
```
