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

### Frontend
- `npm run build` produces a static `dist/` directory you can deploy to **Vercel**, **Netlify**, **Cloudflare Pages**, or any static host.
- Set `VITE_API_BASE_URL` to your production API origin (e.g. `https://api.example.com/api`).
- For SPA hosting on a CDN, configure a fallback to `index.html` for unknown routes.

### Backend
- Run with a process manager (e.g. `pm2`, `systemd`) or deploy to **Render**, **Railway**, **Fly.io**, **AWS ECS/Fargate**, or **Cloud Run**.
- Required env vars: `JWT_SECRET`, at least one provider key, `CORS_ORIGIN` set to your frontend URL.
- Put it behind a reverse proxy (nginx, Caddy, Cloudflare). Disable response buffering on the streaming route — for nginx:
  ```nginx
  location /api/chat/stream {
    proxy_pass http://app;
    proxy_buffering off;
    proxy_cache off;
    proxy_set_header Connection '';
    proxy_http_version 1.1;
    chunked_transfer_encoding on;
  }
  ```
- Keep secrets in a secret manager (AWS Secrets Manager, Doppler, 1Password) — never in git.
- Add observability: structured JSON logs, request IDs, metrics, error tracking (Sentry).

### Security best practices
- Rotate `JWT_SECRET` regularly; use short token lifetimes plus refresh tokens for long sessions.
- Move JWTs into `httpOnly`, `Secure`, `SameSite=Strict` cookies for first-party apps.
- Strict CORS allow-list — never `*` in production.
- Provider keys live only on the backend. Never expose them via `VITE_*` envs.
- Apply per-user rate limits (the example uses per-IP; switch to per-`user.id`).
- Validate every request payload (this project uses `zod`).
- Use Helmet (already wired) and add a strong CSP suited to your domain.
- Cap message length and conversation depth to mitigate prompt-injection and abuse.
- Log responses without their content; redact PII before sending to log sinks.

### Frontend best practices
- Code-split heavy markdown / syntax highlighter chunks (already done via Vite `manualChunks`).
- Memoize `MessageBubble` (already done) — long conversations stay smooth.
- Keep the streaming reader cancelable via `AbortController` to avoid orphan requests on unmount.
- Persist chats with a schema version (`aichat.chats.v1`) so future migrations are safe.
- Avoid storing JWTs in `localStorage` for high-stakes apps — prefer cookie-based auth.

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
