# AI Chatbot — React + Tailwind + Multi-Provider Backend

A modern, production-grade AI chatbot web app. Frontend is built with React 18 (functional components & hooks) and Tailwind CSS. Backend is an Express API with streaming responses and pluggable providers (OpenAI / Anthropic / Google).

## Features

- ChatGPT-style interface with sidebar history, auto-scroll, typing indicator
- Streaming AI responses with stop-generation and regenerate
- Markdown rendering with GitHub-flavored extensions and syntax-highlighted code blocks
- Conversation history with rename, delete, export to Markdown, clear conversation
- Local-storage persistence (chats, theme, model, JWT)
- Dark/light mode toggle with system preference detection
- Token usage display, model selector (multi-provider)
- Mobile-responsive design with slide-in sidebar
- Reusable API service layer (axios + fetch streaming), JWT support
- Express backend with rate limiting, helmet, CORS, JWT middleware
- Error boundary, loading states, accessible UI

## Project structure

```
agentforapp/
├── index.html
├── package.json            # frontend deps
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env.example
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── components/
│   │   ├── ChatWindow.jsx
│   │   ├── MessageBubble.jsx
│   │   ├── Sidebar.jsx
│   │   ├── ChatInput.jsx
│   │   ├── Header.jsx
│   │   ├── TypingIndicator.jsx
│   │   ├── ChatHistory.jsx
│   │   ├── SettingsModal.jsx
│   │   └── ErrorBoundary.jsx
│   ├── pages/
│   │   └── ChatPage.jsx
│   ├── hooks/
│   │   ├── useChat.js
│   │   ├── useTheme.js
│   │   ├── useLocalStorage.js
│   │   └── useAutoScroll.js
│   ├── services/
│   │   ├── api.js
│   │   ├── chatService.js
│   │   └── authService.js
│   ├── context/
│   │   ├── ChatContext.jsx
│   │   └── ThemeContext.jsx
│   ├── utils/
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   └── formatters.js
│   └── styles/
│       └── markdown.css
└── backend/
    ├── package.json
    ├── server.js
    ├── .env.example
    ├── routes/
    │   ├── chat.js
    │   └── auth.js
    ├── middleware/
    │   └── auth.js
    └── services/
        └── providers.js
```

## Setup — Step by step

### 1. Install frontend dependencies

```bash
cd agentforapp
npm install
cp .env.example .env
```

Open `.env` and confirm `VITE_API_BASE_URL=http://localhost:8080/api`.

### 2. Install backend dependencies

```bash
cd backend
npm install
cp .env.example .env
```

Add at least one provider key in `backend/.env`:

```
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...
```

If you want auth, also set `JWT_SECRET`. Leaving it empty disables auth (handy for local dev).

### 3. Run both servers

In one terminal:

```bash
cd agentforapp/backend
npm run dev
# → API listening on http://localhost:8080
```

In another terminal:

```bash
cd agentforapp
npm run dev
# → http://localhost:3000  (Vite dev server)
```

Vite proxies `/api/*` to `localhost:8080`, so you can also leave `VITE_API_BASE_URL=/api` in production-style setups.

### 4. (Optional) Get a JWT

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"you@example.com","password":"demo-password"}'
```

Paste the returned token into the **Settings → API token** field in the UI. From then on it’s sent as `Authorization: Bearer <token>`.

## Backend API

### `POST /api/chat`
Non-streaming completion.

```json
{
  "model": "gpt-4.1",
  "messages": [{ "role": "user", "content": "Hello!" }]
}
```

Response:
```json
{ "content": "Hi there!", "usage": { "total_tokens": 17 }, "model": "gpt-4.1" }
```

### `POST /api/chat/stream`
Server-Sent Events stream. Each frame is `data: <json>\n\n`:

```
data: {"type":"token","content":"Hi"}
data: {"type":"token","content":" there!"}
data: {"type":"usage","usage":{"prompt_tokens":12,"completion_tokens":5,"total_tokens":17}}
data: [DONE]
```

The frontend parses these in `src/services/chatService.js`.

## Adding a new provider

1. Add the SDK to `backend/package.json`.
2. Implement a `provider === '<name>'` branch in `callProvider` and `streamProvider` (`backend/services/providers.js`).
3. Map the provider in `PROVIDER_BY_MODEL_PREFIX` (regex on the model id).
4. Add the model to `MODELS` in `src/utils/constants.js`.

## Production deployment

The frontend deploys to Vercel as static; the backend deploys to Render as a long-running Node service. Both connect to GitHub for auto-deploy on push to `main`.

### One-time setup

#### A. Push to GitHub

```bash
gh repo create <yourname>/lumen --public --source=. --push
# or via the GitHub website: create an empty repo, then:
git remote add origin git@github.com:<yourname>/lumen.git
git push -u origin main
```

#### B. Deploy the backend to Render

1. Sign in at https://dashboard.render.com → New → Blueprint.
2. Connect the GitHub repo. Render reads `render.yaml` and provisions a `lumen-backend` service.
3. After provisioning, set these env vars in the Render dashboard (Environment tab):
   - `JWT_SECRET` — run `openssl rand -hex 32` and paste the output.
   - `CORS_ORIGIN` — leave empty for now; you'll fill it in step C after Vercel gives you a URL.
   - At least one of `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY`.
4. The first deploy starts automatically; takes ~3 minutes. Note the service URL: `https://lumen-backend.onrender.com` (your name will differ).
5. Smoke-test:
   ```bash
   curl https://lumen-backend.onrender.com/api/health
   ```
   Expected JSON with `providers` flags reflecting which keys you set.

> **Cold starts:** Render's free tier sleeps services after ~15 minutes idle. The first request after sleep wakes it (~30 s). Upgrade to the $7/mo Starter plan if cold starts are unacceptable.

#### C. Deploy the frontend to Vercel

1. Sign in at https://vercel.com → Add New → Project → import the same GitHub repo.
2. Vercel detects Vite from `vercel.json`. Leave defaults.
3. In the project's Environment Variables tab, set:
   - `VITE_API_BASE_URL` = `https://lumen-backend.onrender.com/api`
   - `VITE_DEFAULT_MODEL` = (any cloud model id you have a key for, e.g. `gpt-4.1`)
   - `VITE_APP_NAME` = `Lumen`
4. Deploy. Note the production URL: `https://lumen-<hash>.vercel.app` (or your custom domain).
5. **Go back to Render → set `CORS_ORIGIN` to your Vercel URL** (the full origin, no trailing slash). Trigger a redeploy.

#### D. Smoke test end-to-end

Open the Vercel URL. Pick a cloud model (the local llama options will show a gray dot in production — that's expected; local Ollama can't be reached from Render). Send a message; verify:
- Response streams in token-by-token.
- Token usage chip updates in the header.
- Code blocks render with syntax highlighting.

### Local development still works

`./dev.sh` is unchanged. Local development hits the local Express backend at `:8080`, which can talk to local Ollama at `:11434`. None of that changes when production is deployed.

### Security checklist before going public

- [ ] `JWT_SECRET` set in Render and rotated.
- [ ] `CORS_ORIGIN` set to your real frontend origin (never `*`).
- [ ] `RATE_LIMIT_PER_MIN` reasonable for your traffic.
- [ ] Provider keys only in Render env (never committed, never exposed via `VITE_*`).
- [ ] Body size cap and per-request validation already enforced by `zod` in routes — confirm.
- [ ] If you intend to expose this to others, switch JWT auth from optional to required (set `JWT_SECRET` and don't leave it empty).

## Scripts

Frontend:
- `npm run dev` — start Vite dev server
- `npm run build` — production build
- `npm run preview` — preview the build

Backend:
- `npm run dev` — `node --watch server.js`
- `npm start` — run the API

## License

MIT
