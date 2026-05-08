# Glass Dark Redesign + Deploy — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing chat-app visual identity with a "Glass Dark" aesthetic (dark default, frosted glass, electric purple→cyan gradient) and a clean light-mode fallback, ship a new animated branded empty state, and deploy the result to Vercel (frontend) + Render (backend).

**Architecture:** Token-driven theming — Tailwind references CSS custom properties on `:root` (light) and `html.dark` (dark) so component code only references named tokens, never raw colors. A single fixed-position "backdrop" component renders animated gradient orbs behind the app. Theme default flips from system-preference to dark. Backend gains a single `/api/health` route used by the header to show provider availability.

**Tech Stack:** React 18, Vite 5, Tailwind 3, framer-motion 11, lucide-react, Express 4 (backend, untouched architecturally), Node 20+ built-in test runner for pure-logic tests, Render (backend) + Vercel (frontend) for deployment.

**Spec reference:** [docs/superpowers/specs/2026-05-08-glass-dark-redesign-design.md](../specs/2026-05-08-glass-dark-redesign-design.md)

---

## Approach notes

This is primarily a visual/UI overhaul. There is no existing test runner, and adding one (vitest + RTL) just for visuals would be over-engineering. The plan therefore uses two verification modes:

- **Manual browser verification** for visual surfaces — every relevant task ends with a "Verify in browser" step that lists the exact things to look at on `http://localhost:3000` (run via `./dev.sh` from project root).
- **`node --test` (Node's built-in test runner)** for pure logic — `formatRelativeShort`, `bucketByDate`, the health endpoint's provider-availability function. No test framework added; just `node --test path/to/*.test.js`.

Each task ends with a commit. Commits land on `main` directly because this project is solo and the changes are staged so each commit leaves the app in a runnable state.

---

## File map

After all tasks land, the file tree changes are:

| File | Status | Responsibility |
|---|---|---|
| `tailwind.config.js` | rewrite | New token-referenced color/shadow/radius/animation config |
| `src/index.css` | rewrite | Global tokens (`:root`, `html.dark`), token-fade keyframes, halo pulse, orb drift, scrollbar polish, component classes (`btn-gradient`, `chip`, `card-glass`) |
| `src/styles/markdown.css` | edit | Replace `slate-*` references with token references |
| `index.html` | edit | Title, meta description, theme-color, body classes |
| `src/utils/constants.js` | edit | `APP_NAME` default → "Lumen" |
| `src/utils/formatters.js` | edit | Add `formatRelativeShort` and `bucketByDate` |
| `src/utils/formatters.test.js` | create | `node --test` cases for the two new helpers |
| `src/context/ThemeContext.jsx` | edit | Default theme = `'dark'` when no stored preference |
| `src/components/AppBackdrop.jsx` | create | Fixed-position orb backdrop, dark-mode only |
| `src/App.jsx` | edit | Mount `<AppBackdrop />` |
| `src/pages/ChatPage.jsx` | edit | Surface treatment of `<main>` |
| `src/components/Sidebar.jsx` | rewrite | Gradient logo, gradient new-chat, glass surface, enhanced settings footer |
| `src/components/Header.jsx` | rewrite | Glass header, model chip, online dot |
| `src/components/ChatInput.jsx` | rewrite | Glass input, gradient send |
| `src/components/MessageBubble.jsx` | rewrite | Token-themed bubbles, code-block chrome, streaming token reveal |
| `src/components/ChatHistory.jsx` | rewrite | Date buckets + relative timestamps |
| `src/components/ChatWindow.jsx` | edit | Replace inline `EmptyState` with import; jump-to-latest pill restyle |
| `src/components/EmptyState.jsx` | create | Animated branded hero (extracted + redesigned) |
| `src/components/SettingsModal.jsx` | edit | Token-referenced surfaces |
| `src/components/TypingIndicator.jsx` | edit | Cyan dots on accent palette |
| `src/services/healthService.js` | create | Tiny fetch wrapper for `/api/health`, session-cached |
| `backend/server.js` | edit | Mount `/api/health` route |
| `backend/routes/health.js` | create | Provider-availability handler |
| `backend/routes/health.test.js` | create | `node --test` cases for provider availability |
| `render.yaml` | create | Render service blueprint for backend |
| `README.md` | edit | New "Deploy" section with explicit Vercel + Render env vars |

---

## Task index

- [Task 0 — Initialize git + baseline commit](#task-0--initialize-git--baseline-commit)
- [Task 1 — Token foundation: tailwind config + index.css](#task-1--token-foundation-tailwind-config--indexcss)
- [Task 2 — Default theme dark + index.html metadata + APP_NAME](#task-2--default-theme-dark--indexhtml-metadata--app_name)
- [Task 3 — Backdrop layer (orb drift)](#task-3--backdrop-layer-orb-drift)
- [Task 4 — Sidebar restyle (logo, gradient new-chat, footer)](#task-4--sidebar-restyle-logo-gradient-new-chat-footer)
- [Task 5 — Header restyle (glass + model chip)](#task-5--header-restyle-glass--model-chip)
- [Task 6 — Chat input restyle (glass + gradient send)](#task-6--chat-input-restyle-glass--gradient-send)
- [Task 7 — Message bubbles + code blocks](#task-7--message-bubbles--code-blocks)
- [Task 8 — Date-bucketed history with relative timestamps](#task-8--date-bucketed-history-with-relative-timestamps)
- [Task 9 — Animated branded empty state](#task-9--animated-branded-empty-state)
- [Task 10 — Streaming token reveal](#task-10--streaming-token-reveal)
- [Task 11 — Settings modal + typing indicator + jump-to-latest pill polish](#task-11--settings-modal--typing-indicator--jump-to-latest-pill-polish)
- [Task 12 — Light-mode pass](#task-12--light-mode-pass)
- [Task 13 — Backend `/api/health` endpoint](#task-13--backend-apihealth-endpoint)
- [Task 14 — Header online-dot wired to /api/health](#task-14--header-online-dot-wired-to-apihealth)
- [Task 15 — Deploy: render.yaml + README deploy section](#task-15--deploy-renderyaml--readme-deploy-section)
- [Task 16 — Push to GitHub + first deploy (manual user-driven)](#task-16--push-to-github--first-deploy-manual-user-driven)

---

## Task 0 — Initialize git + baseline commit

This must run first. Subsequent tasks commit per task; without git initialized, those commits would fail or be lost.

**Files:**
- Modify: existing `.gitignore` (verify content, no edit unless missing entries)

- [ ] **Step 1: Initialize the repo**

```bash
cd /Users/askfaisaloutlook.com/Documents/projects/agent/agentforapp
git init -b main
```

Expected output: `Initialized empty Git repository in .../agentforapp/.git/`

- [ ] **Step 2: Verify .gitignore covers all noisy files**

```bash
cat .gitignore
```

Expected: contains `node_modules`, `dist`, `.env`, `.env.local`, `.env.*.local`, `.DS_Store`, `*.log`, `.vite`, `coverage`, `backend/node_modules`, `backend/.env`, `.superpowers/`. If anything is missing, add it.

- [ ] **Step 3: Verify the noisy files are actually ignored**

```bash
git status --short | head -30
```

Expected: Only source files appear. Should NOT see `node_modules/`, `.env`, `dist/`, or anything inside `.superpowers/`.

If `node_modules/` or `.env` shows up, fix `.gitignore` before continuing.

- [ ] **Step 4: Stage and commit baseline**

```bash
git add .
git commit -m "chore: baseline before glass-dark redesign"
```

- [ ] **Step 5: Confirm commit landed**

```bash
git log --oneline
```

Expected: one commit, "chore: baseline before glass-dark redesign".

---

## Task 1 — Token foundation: tailwind config + index.css

Lay down the token system. After this task, the app **will look broken transiently** — components still reference `bg-brand-600` etc. which now resolve to new gradient/CSS-var values. That's fine; subsequent tasks rewrite each component.

**Files:**
- Modify: `tailwind.config.js` (rewrite)
- Modify: `src/index.css` (rewrite the body and component layers; keep `@tailwind` directives)

- [ ] **Step 1: Replace `tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        // Tokens map to CSS variables defined in src/index.css.
        // Light values live on :root, dark values on html.dark.
        bg: {
          deep: 'var(--bg-deep)',
          elev: 'var(--bg-elev)',
        },
        surface: {
          1: 'var(--surface-1)',
          2: 'var(--surface-2)',
          3: 'var(--surface-3)',
        },
        line: {
          1: 'var(--border-1)',
          2: 'var(--border-2)',
        },
        ink: {
          1: 'var(--text-1)',
          2: 'var(--text-2)',
          3: 'var(--text-3)',
        },
        accent: {
          violet: 'var(--accent-1)',
          cyan: 'var(--accent-2)',
        },
        ok: 'var(--ok)',
        warn: 'var(--warn)',
        err: 'var(--err)',
      },
      backgroundImage: {
        'accent-grad': 'var(--accent-grad)',
        'accent-grad-soft': 'var(--accent-grad-soft)',
      },
      boxShadow: {
        'glow-sm': 'var(--glow-sm)',
        'glow-md': 'var(--glow-md)',
        lift: 'var(--lift)',
        soft: 'var(--lift)', // legacy alias to ease migration
        card: 'var(--lift)', // legacy alias
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '10px',
        xl: '14px',
        '2xl': '18px',
      },
      keyframes: {
        bounceDot: {
          '0%, 80%, 100%': { transform: 'scale(0.6)', opacity: '0.6' },
          '40%': { transform: 'scale(1)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        tokenFade: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        haloPulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.08)', opacity: '0.3' },
        },
        orbDrift: {
          '0%, 100%': { transform: 'translate(0,0)' },
          '50%': { transform: 'translate(30px, 20px)' },
        },
        cursorBlink: {
          '50%': { opacity: '0' },
        },
      },
      animation: {
        bounceDot: 'bounceDot 1.2s infinite ease-in-out',
        fadeIn: 'fadeIn 0.25s ease-out both',
        tokenFade: 'tokenFade 80ms ease-out both',
        haloPulse: 'haloPulse 3s ease-in-out infinite',
        orbDrift1: 'orbDrift 12s ease-in-out infinite',
        orbDrift2: 'orbDrift 14s ease-in-out infinite reverse',
        cursorBlink: 'cursorBlink 1s steps(2) infinite',
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 2: Replace `src/index.css`** (full content shown — copy verbatim)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ============================================================
 * THEME TOKENS
 * Light is the default (:root); dark is applied when html has the
 * .dark class. Tailwind's `colors` map these to CSS variables, so
 * components reference token names (bg-surface-1, text-ink-2, …)
 * and never raw color values.
 * ============================================================ */

:root {
  color-scheme: light;
  --bg-deep: #ffffff;
  --bg-elev: #fafafa;
  --surface-1: rgba(15, 23, 42, 0.03);
  --surface-2: rgba(15, 23, 42, 0.06);
  --surface-3: #0f172a; /* code blocks stay dark even in light theme */
  --border-1: #e5e7eb;
  --border-2: #d4d4d8;
  --text-1: #0f172a;
  --text-2: #475569;
  --text-3: #94a3b8;

  --accent-1: #a855f7;
  --accent-2: #22d3ee;
  --accent-grad: linear-gradient(135deg, #a855f7 0%, #22d3ee 100%);
  --accent-grad-soft: linear-gradient(135deg, rgba(168,85,247,.18) 0%, rgba(34,211,238,.12) 100%);

  --ok: #22c55e;
  --warn: #f59e0b;
  --err: #f43f5e;

  --glow-sm: 0 2px 6px rgba(15, 23, 42, 0.06);
  --glow-md: 0 4px 14px rgba(15, 23, 42, 0.08);
  --lift: 0 16px 48px rgba(15, 23, 42, 0.08);
}

html.dark {
  color-scheme: dark;
  --bg-deep: #07060c;
  --bg-elev: #0e0d1a;
  --surface-1: rgba(255, 255, 255, 0.03);
  --surface-2: rgba(255, 255, 255, 0.06);
  --surface-3: rgba(0, 0, 0, 0.45);
  --border-1: rgba(255, 255, 255, 0.06);
  --border-2: rgba(255, 255, 255, 0.10);
  --text-1: #f5f5f7;
  --text-2: #a1a1aa;
  --text-3: #71717a;

  --glow-sm: 0 4px 14px rgba(168, 85, 247, 0.35);
  --glow-md: 0 8px 24px rgba(168, 85, 247, 0.4), 0 0 40px rgba(34, 211, 238, 0.25);
  --lift: 0 16px 48px rgba(0, 0, 0, 0.45);
}

html, body, #root {
  height: 100%;
  background: var(--bg-deep);
  color: var(--text-1);
}

body {
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

/* Custom scrollbar — themed */
*::-webkit-scrollbar { width: 10px; height: 10px; }
*::-webkit-scrollbar-track { background: transparent; }
*::-webkit-scrollbar-thumb {
  background: var(--border-2);
  border-radius: 9999px;
  border: 2px solid transparent;
  background-clip: content-box;
}
*::-webkit-scrollbar-thumb:hover {
  background: var(--text-3);
  background-clip: content-box;
  border: 2px solid transparent;
}

/* Reduced motion: kill the decorative loops */
@media (prefers-reduced-motion: reduce) {
  .animate-orbDrift1, .animate-orbDrift2, .animate-haloPulse, .animate-tokenFade {
    animation: none !important;
  }
}

@layer components {
  /* Primary button — gradient, glow */
  .btn-gradient {
    @apply inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60;
    background-image: var(--accent-grad);
    box-shadow: var(--glow-sm);
  }
  .btn-gradient:hover { box-shadow: var(--glow-md); }
  .btn-gradient:focus { outline: none; box-shadow: 0 0 0 2px rgba(168,85,247,.5); }

  /* Ghost button — quiet, used for sidebar settings, modal close, etc. */
  .btn-ghost {
    @apply inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition;
    color: var(--text-2);
  }
  .btn-ghost:hover { background: var(--surface-1); color: var(--text-1); }
  .btn-ghost:focus { outline: none; box-shadow: 0 0 0 2px rgba(168,85,247,.4); }

  /* Square icon button — header toolbar, message actions */
  .btn-icon {
    @apply inline-flex h-9 w-9 items-center justify-center rounded-md transition;
    color: var(--text-2);
  }
  .btn-icon:hover { background: var(--surface-1); color: var(--text-1); }
  .btn-icon:focus { outline: none; box-shadow: 0 0 0 2px rgba(168,85,247,.4); }

  /* Input baseline — used by SettingsModal et al. */
  .input-base {
    @apply w-full rounded-lg px-3 py-2 text-sm transition;
    background: var(--surface-1);
    border: 1px solid var(--border-1);
    color: var(--text-1);
  }
  .input-base::placeholder { color: var(--text-3); }
  .input-base:focus {
    outline: none;
    border-color: var(--accent-1);
    box-shadow: 0 0 0 2px rgba(168,85,247,.25);
  }

  /* Glass surface — sidebar, header, input wrapper */
  .glass {
    background: var(--surface-1);
    border: 1px solid var(--border-1);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  /* Generic card */
  .card {
    border-radius: 14px;
    background: var(--surface-1);
    border: 1px solid var(--border-1);
  }

  /* Chip — model selector wrapper, token counter */
  .chip {
    @apply inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition;
    background: var(--surface-1);
    border: 1px solid var(--border-1);
    color: var(--text-1);
  }

  /* Gradient text — for hero headings */
  .text-gradient {
    background-image: var(--accent-grad);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
}

/* Markdown content polish — unchanged structure, token references only */
.prose-chat pre {
  margin: 0.75rem 0;
  overflow-x: auto;
  border-radius: 10px;
  background: var(--surface-3);
  color: #f5f5f7;
  border: 1px solid var(--border-2);
  padding: 0.75rem;
  font-size: 0.875rem;
}
.prose-chat code:not(pre code) {
  border-radius: 4px;
  background: var(--surface-2);
  color: var(--text-1);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85em;
  padding: 1px 5px;
}
.prose-chat p { line-height: 1.6; }
.prose-chat ul, .prose-chat ol { margin: 0.5rem 0; padding-left: 1.25rem; }
.prose-chat ul { list-style: disc; }
.prose-chat ol { list-style: decimal; }
.prose-chat ul li, .prose-chat ol li { margin: 0.15rem 0; }
.prose-chat a {
  color: var(--accent-1);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.prose-chat a:hover { color: var(--accent-2); }
.prose-chat blockquote {
  border-left: 3px solid var(--border-2);
  padding-left: 0.75rem;
  color: var(--text-2);
  font-style: italic;
}
.prose-chat table { width: 100%; border-collapse: collapse; margin: 0.75rem 0; font-size: 0.875rem; }
.prose-chat th, .prose-chat td { border: 1px solid var(--border-1); padding: 0.4rem 0.7rem; }
.prose-chat h1, .prose-chat h2, .prose-chat h3 { margin: 1rem 0 0.5rem; font-weight: 600; letter-spacing: -0.01em; }
```

- [ ] **Step 3: Build to confirm Tailwind compiles**

```bash
npm run build 2>&1 | tail -20
```

Expected: build completes without unknown-class errors. Some `bg-brand-600`-style legacy classes might still appear in components — those resolve to `undefined` and just produce no style. That's the intended transitional state.

- [ ] **Step 4: Run lint to catch syntax errors**

```bash
npm run lint 2>&1 | tail -20
```

Expected: no errors related to the two files we changed (the css/config aren't lintable JS; just confirm nothing complains about JSX side effects).

- [ ] **Step 5: Commit**

```bash
git add tailwind.config.js src/index.css
git commit -m "feat(theme): introduce token system + new tailwind config"
```

---

## Task 2 — Default theme dark + index.html metadata + APP_NAME

**Files:**
- Modify: `src/context/ThemeContext.jsx:6-11` (`getInitialTheme`)
- Modify: `index.html` (title, meta description, theme-color, body classes)
- Modify: `src/utils/constants.js:17` (`APP_NAME` default)

- [ ] **Step 1: Update `getInitialTheme` in `src/context/ThemeContext.jsx`**

Replace the function body so the no-stored-preference branch returns `'dark'` instead of consulting `prefers-color-scheme`. SSR fallback also flips to dark to match.

```jsx
function getInitialTheme() {
  if (typeof window === 'undefined') return 'dark'
  const stored = window.localStorage.getItem(STORAGE_KEYS.THEME)
  if (stored === 'light' || stored === 'dark') return stored
  return 'dark' // brand default
}
```

- [ ] **Step 2: Replace `index.html`** (full content)

```html
<!doctype html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="#07060c" />
    <meta name="description" content="Lumen — chat with the smartest AI models, locally or in the cloud." />
    <title>Lumen — AI Chat</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
      rel="stylesheet"
    />
  </head>
  <body class="font-sans antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

Notes on the changes from the previous version:
- `<html lang="en" class="dark">` — pre-set so the very first paint is dark, avoiding a light-mode flash before React mounts. The `ThemeContext` will toggle this class as needed once it runs.
- Body class drops `bg-slate-50 dark:bg-slate-950` — the new tokens already drive `body { background: var(--bg-deep); }`.

- [ ] **Step 3: Update `APP_NAME` in `src/utils/constants.js`**

Find the line:
```js
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'AI Chatbot'
```

Replace with:
```js
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Lumen'
```

- [ ] **Step 4: Verify in browser**

```bash
./dev.sh
```

Open http://localhost:3000. Verify:
- Page tab title says "Lumen — AI Chat".
- First paint is dark (no white flash on load).
- DevTools → Elements → `<html>` has `class="dark"`.
- localStorage `aichat.theme` only sets after the user clicks the toggle (until then, it's empty and the dark default is in effect).

- [ ] **Step 5: Commit**

```bash
git add src/context/ThemeContext.jsx index.html src/utils/constants.js
git commit -m "feat(theme): default to dark; rename app to Lumen; update meta"
```

---

## Task 3 — Backdrop layer (orb drift)

**Files:**
- Create: `src/components/AppBackdrop.jsx`
- Modify: `src/App.jsx` (mount the backdrop)

- [ ] **Step 1: Create `src/components/AppBackdrop.jsx`**

```jsx
/**
 * Fixed backdrop layer rendered behind the entire app.
 *
 * Two blurred gradient orbs drift slowly in dark mode (purely CSS — no JS,
 * no React state). In light mode the orbs hide and a soft top-radial gradient
 * substitutes, keeping the surface clean.
 *
 * pointer-events: none so it never intercepts clicks.
 */
export default function AppBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Light-mode soft gradient */}
      <div
        className="absolute inset-0 dark:hidden"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(168,85,247,0.10), transparent 60%)',
        }}
      />
      {/* Dark-mode orbs */}
      <div
        className="absolute hidden h-[380px] w-[380px] rounded-full opacity-[0.35] blur-[60px] dark:block animate-orbDrift1"
        style={{
          top: '-120px',
          left: '-80px',
          background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute hidden h-[320px] w-[320px] rounded-full opacity-[0.25] blur-[60px] dark:block animate-orbDrift2"
        style={{
          bottom: '-100px',
          right: '-60px',
          background: 'radial-gradient(circle, #22d3ee 0%, transparent 70%)',
        }}
      />
    </div>
  )
}
```

- [ ] **Step 2: Mount in `src/App.jsx`**

Replace the file contents with:
```jsx
import AppBackdrop from './components/AppBackdrop.jsx'
import ChatPage from './pages/ChatPage.jsx'

export default function App() {
  return (
    <>
      <AppBackdrop />
      <ChatPage />
    </>
  )
}
```

- [ ] **Step 3: Verify in browser**

With `./dev.sh` running, open http://localhost:3000. Verify:
- Two blurred gradient orbs visible behind the app — one purple top-left, one cyan bottom-right.
- Slowly drift (each takes 12–14s for one cycle).
- Click anywhere — no orb intercepts the click.
- Toggle to light mode (theme button in header). Orbs disappear; a faint top radial purple tint replaces them.
- Toggle reduced-motion (macOS: System Settings → Accessibility → Display → Reduce motion). Orbs stop drifting on next reload.

- [ ] **Step 4: Commit**

```bash
git add src/components/AppBackdrop.jsx src/App.jsx
git commit -m "feat(theme): add gradient-orb backdrop"
```

---

## Task 4 — Sidebar restyle (logo, gradient new-chat, footer)

**Files:**
- Modify: `src/components/Sidebar.jsx` (rewrite)

This task only restyles the sidebar shell (brand row, new-chat button, footer). The `<ChatHistory>` inside it gets bucketing later in Task 8.

- [ ] **Step 1: Replace `src/components/Sidebar.jsx`** (full content)

```jsx
import { Plus, Settings as SettingsIcon, Sparkles, X } from 'lucide-react'
import { useChat } from '../hooks/useChat.js'
import ChatHistory from './ChatHistory.jsx'
import { APP_NAME } from '../utils/constants.js'
import { classNames } from '../utils/helpers.js'

export default function Sidebar({ open, onClose, onOpenSettings }) {
  const { newChat } = useChat()

  return (
    <>
      {/* Mobile backdrop */}
      <div
        onClick={onClose}
        className={classNames(
          'fixed inset-0 z-30 bg-black/40 backdrop-blur-sm transition-opacity md:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        aria-hidden={!open}
      />

      <aside
        className={classNames(
          'fixed inset-y-0 left-0 z-40 flex w-72 flex-col transition-transform md:static md:translate-x-0',
          'bg-surface-1 border-r border-line-1 backdrop-blur-md',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Conversation history"
      >
        {/* Brand row */}
        <div className="flex items-center justify-between gap-2 px-4 pb-3 pt-4">
          <div className="flex items-center gap-2.5">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-md text-white shadow-glow-sm"
              style={{ backgroundImage: 'var(--accent-grad)' }}
              aria-hidden="true"
            >
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold text-ink-1 tracking-tight">
              {APP_NAME}
            </span>
          </div>
          <button
            onClick={onClose}
            className="btn-icon md:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* New chat */}
        <div className="px-3 pb-3">
          <button
            onClick={() => {
              newChat()
              onClose?.()
            }}
            className="btn-gradient w-full"
          >
            <Plus className="h-4 w-4" />
            New chat
          </button>
        </div>

        {/* History list */}
        <div className="flex-1 min-h-0 overflow-y-auto px-1">
          <ChatHistory onSelect={onClose} />
        </div>

        {/* Footer */}
        <div className="border-t border-line-1 px-3 py-3">
          <button
            onClick={onOpenSettings}
            className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-sm text-ink-2 transition hover:bg-surface-1 hover:text-ink-1"
          >
            <SettingsIcon className="h-4 w-4" />
            Settings
          </button>
        </div>
      </aside>
    </>
  )
}
```

- [ ] **Step 2: Verify in browser**

Refresh http://localhost:3000:
- Sidebar background is a faint translucent surface (visible behind it: orb backdrop in dark).
- Brand row: gradient-filled logo square (purple→cyan) + "Lumen" in bold-ish.
- "New chat" button has the gradient bg, drop-shadow glow on hover.
- Settings row at the bottom — gear icon + "Settings" text.
- Mobile (resize browser narrow): sidebar slides in over a dark backdrop, clicking outside closes.

- [ ] **Step 3: Commit**

```bash
git add src/components/Sidebar.jsx
git commit -m "feat(sidebar): glass surface, gradient brand + new-chat"
```

---

## Task 5 — Header restyle (glass + model chip)

**Files:**
- Modify: `src/components/Header.jsx` (rewrite)

The model selector stays a native `<select>` for accessibility; we restyle the wrapper as a "chip" and put a status dot adjacent (the dot is wired to live data in Task 14 — for now it's a static placeholder green).

- [ ] **Step 1: Replace `src/components/Header.jsx`**

```jsx
import { Menu, Moon, Sun, Trash2 } from 'lucide-react'
import { useChat } from '../hooks/useChat.js'
import { useTheme } from '../hooks/useTheme.js'
import { MODELS } from '../utils/constants.js'
import { formatTokens } from '../utils/formatters.js'

export default function Header({ onToggleSidebar }) {
  const { theme, toggleTheme } = useTheme()
  const { activeChat, model, setModel, clearActiveChat } = useChat()
  const usage = activeChat?.tokenUsage

  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between gap-2 px-3 py-2 sm:px-6"
      style={{
        background: 'color-mix(in srgb, var(--bg-deep) 70%, transparent)',
        borderBottom: '1px solid var(--border-1)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSidebar}
          className="btn-icon md:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <ModelSelector value={model} onChange={setModel} />
      </div>

      <div className="flex items-center gap-1">
        {usage?.total > 0 && (
          <span
            className="chip hidden sm:inline-flex"
            title={`Prompt ${usage.prompt} / Completion ${usage.completion}`}
          >
            {formatTokens(usage.total)} tokens
          </span>
        )}
        <button
          onClick={() => {
            if (window.confirm('Clear all messages from this conversation?')) {
              clearActiveChat()
            }
          }}
          className="btn-icon"
          title="Clear conversation"
          aria-label="Clear conversation"
          disabled={!activeChat?.messages?.length}
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <button
          onClick={toggleTheme}
          className="btn-icon"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle dark mode"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </header>
  )
}

function ModelSelector({ value, onChange }) {
  // Static green dot placeholder — wired to live /api/health data in Task 14.
  return (
    <label
      className="chip relative cursor-pointer pl-2 pr-7"
      style={{ paddingTop: 0, paddingBottom: 0, height: '32px' }}
    >
      <span className="sr-only">Model</span>
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ background: 'var(--ok)', boxShadow: '0 0 6px rgba(34,197,94,.6)' }}
        aria-hidden="true"
      />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-transparent pr-1 text-xs font-medium text-ink-1 outline-none"
        style={{ background: 'transparent' }}
      >
        {MODELS.map((m) => (
          <option key={m.id} value={m.id}>
            {m.label}
          </option>
        ))}
      </select>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-3"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.24 4.38a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
          clipRule="evenodd"
        />
      </svg>
    </label>
  )
}
```

- [ ] **Step 2: Verify in browser**

Refresh http://localhost:3000:
- Header has a slight translucent dark backdrop with subtle blur (the orbs behind show through faintly).
- Model selector is a small chip with a green dot + selected model name + chevron.
- Token chip appears once a conversation exists (use one suggestion to start a chat first to test).
- Sun/moon toggle works; both light and dark renderings of header are clean.
- No `<select>` system styling leaks (no native arrow on top of the chevron).

- [ ] **Step 3: Commit**

```bash
git add src/components/Header.jsx
git commit -m "feat(header): glass header + model chip + status dot placeholder"
```

---

## Task 6 — Chat input restyle (glass + gradient send)

**Files:**
- Modify: `src/components/ChatInput.jsx` (rewrite)

- [ ] **Step 1: Replace `src/components/ChatInput.jsx`**

```jsx
import { useEffect, useRef, useState } from 'react'
import { ArrowUp, Square } from 'lucide-react'
import { useChat } from '../hooks/useChat.js'
import { classNames } from '../utils/helpers.js'

export default function ChatInput() {
  const { sendMessage, isStreaming, stopGenerating } = useChat()
  const [value, setValue] = useState('')
  const textareaRef = useRef(null)

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`
  }, [value])

  function handleSubmit(e) {
    e?.preventDefault()
    if (isStreaming) return
    const text = value.trim()
    if (!text) return
    setValue('')
    sendMessage(text)
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="px-3 pb-3 pt-2 sm:px-6"
      style={{
        background: 'color-mix(in srgb, var(--bg-deep) 70%, transparent)',
        borderTop: '1px solid var(--border-1)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div
        className="mx-auto flex max-w-3xl items-end gap-2 rounded-xl px-3 py-2 transition"
        style={{
          background: 'var(--surface-1)',
          border: '1px solid var(--border-2)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          placeholder="Send a message…  (Shift+Enter for new line)"
          className="max-h-48 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-ink-1 outline-none placeholder:text-ink-3"
          aria-label="Message input"
        />
        {isStreaming ? (
          <button
            type="button"
            onClick={stopGenerating}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-ink-1 transition"
            style={{ background: 'var(--surface-2)' }}
            aria-label="Stop generating"
            title="Stop"
          >
            <Square className="h-4 w-4" fill="currentColor" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!value.trim()}
            className={classNames(
              'inline-flex h-9 w-9 items-center justify-center rounded-md text-white transition disabled:cursor-not-allowed',
              value.trim() ? '' : 'opacity-40',
            )}
            style={{
              backgroundImage: 'var(--accent-grad)',
              boxShadow: value.trim() ? 'var(--glow-sm)' : 'none',
            }}
            aria-label="Send message"
            title="Send"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        )}
      </div>
      <p className="mx-auto mt-2 max-w-3xl px-1 text-center text-xs text-ink-3">
        AI may produce inaccurate information. Verify important answers.
      </p>
    </form>
  )
}
```

- [ ] **Step 2: Verify in browser**

- Input wrapper sits on a translucent surface with a 1px outlined border.
- Send button has the gradient + glow when text is in the box; muted when empty.
- Stop button (only visible during streaming) is a subdued surface-2 square.
- Auto-grow still works (paste a paragraph in the textarea).
- Shift+Enter still inserts newline; Enter still submits.

- [ ] **Step 3: Commit**

```bash
git add src/components/ChatInput.jsx
git commit -m "feat(input): glass surface + gradient send"
```

---

## Task 7 — Message bubbles + code blocks

**Files:**
- Modify: `src/components/MessageBubble.jsx` (rewrite)

The structure stays similar; only the surface treatment, asymmetric radii, gradient on user bubbles, and code-block chrome change. Token-streaming reveal is added in Task 10 — for now, content renders normally.

- [ ] **Step 1: Replace `src/components/MessageBubble.jsx`**

```jsx
import { memo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { motion } from 'framer-motion'
import { Bot, Check, Copy, RefreshCw, User } from 'lucide-react'
import { copyToClipboard, classNames } from '../utils/helpers.js'
import { MESSAGE_ROLES } from '../utils/constants.js'

function MessageBubble({ message, isLastAssistant, onRegenerate }) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === MESSAGE_ROLES.USER

  async function handleCopy() {
    const ok = await copyToClipboard(message.content)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      className={classNames(
        'group flex items-start gap-3 px-2 py-3',
        isUser && 'flex-row-reverse',
      )}
    >
      <Avatar role={message.role} />
      <div
        className={classNames(
          'flex max-w-[88%] flex-col gap-1.5 sm:max-w-[78%] md:max-w-[70%]',
          isUser ? 'items-end' : 'items-start',
        )}
      >
        <div
          className={classNames(
            'px-4 py-3 text-sm leading-relaxed transition',
            isUser
              ? 'text-white'
              : 'prose-chat text-ink-1 border border-line-1',
          )}
          style={
            isUser
              ? {
                  borderRadius: '12px 12px 4px 12px',
                  backgroundImage: 'var(--accent-grad)',
                  boxShadow: 'var(--glow-sm)',
                }
              : {
                  borderRadius: '12px 12px 12px 4px',
                  background: 'var(--surface-1)',
                }
          }
        >
          {isUser ? (
            <span className="whitespace-pre-wrap break-words">{message.content}</span>
          ) : (
            <Markdown content={message.content} />
          )}
        </div>

        {!isUser && (
          <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
            <button
              onClick={handleCopy}
              className="btn-icon h-8 w-8"
              aria-label="Copy message"
              title="Copy"
            >
              {copied ? (
                <Check className="h-4 w-4 text-ok" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
            {isLastAssistant && (
              <button
                onClick={onRegenerate}
                className="btn-icon h-8 w-8"
                aria-label="Regenerate response"
                title="Regenerate"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

function Avatar({ role }) {
  const isUser = role === MESSAGE_ROLES.USER
  return (
    <div
      className={classNames(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
        isUser ? 'bg-surface-2 text-ink-1' : 'text-white',
      )}
      style={isUser ? undefined : { backgroundImage: 'var(--accent-grad)', boxShadow: 'var(--glow-sm)' }}
      aria-hidden="true"
    >
      {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
    </div>
  )
}

function Markdown({ content }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '')
          const codeString = String(children).replace(/\n$/, '')
          if (match) {
            return <CodeBlock language={match[1]} code={codeString} />
          }
          return (
            <code className={className} {...props}>
              {children}
            </code>
          )
        },
      }}
    >
      {content || ''}
    </ReactMarkdown>
  )
}

function CodeBlock({ language, code }) {
  const [copied, setCopied] = useState(false)
  async function handleCopy() {
    const ok = await copyToClipboard(code)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }
  return (
    <div className="group/code relative my-2 overflow-hidden rounded-lg border border-line-2">
      <div
        className="flex items-center justify-between px-3 py-1.5 text-xs"
        style={{ background: 'var(--surface-2)', color: 'var(--text-2)' }}
      >
        <span className="font-mono uppercase tracking-wide">{language}</span>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1 rounded px-2 py-1 transition hover:bg-surface-2 hover:text-ink-1"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderRadius: 0,
          padding: '0.85rem 1rem',
          fontSize: '0.85rem',
          background: 'rgba(0,0,0,0.45)',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}

export default memo(MessageBubble)
```

- [ ] **Step 2: Verify in browser**

Send a message that contains a code fence so you exercise the code path. E.g., type:
> "Show me a basic React useState example."

Verify:
- User bubble: gradient bg, white text, asymmetric radius (square corner top-right), subtle glow shadow.
- Assistant bubble: surface-1 with 1px border, asymmetric radius (square corner top-left).
- Code block header: language label + Copy button on a slightly elevated surface; body is dark and readable in both themes.
- Hover the assistant bubble — copy/regenerate icons appear at the bottom.

- [ ] **Step 3: Commit**

```bash
git add src/components/MessageBubble.jsx
git commit -m "feat(messages): gradient user bubbles + glass assistant + code chrome"
```

---

## Task 8 — Date-bucketed history with relative timestamps

**Files:**
- Modify: `src/utils/formatters.js` (add helpers)
- Create: `src/utils/formatters.test.js` (`node --test`)
- Modify: `src/components/ChatHistory.jsx` (rewrite)

- [ ] **Step 1: Add helpers to `src/utils/formatters.js`**

Append these two exports (don't remove existing functions):

```js
/**
 * Compact relative time: "2m" / "3h" / "4d" / "2w" / "5mo" / "1y"
 * Used in sidebar thread rows where space is tight.
 */
export function formatRelativeShort(timestamp, now = Date.now()) {
  if (!timestamp) return ''
  const diff = Math.max(0, now - timestamp)
  const m = 60 * 1000
  const h = 60 * m
  const d = 24 * h
  if (diff < m) return 'now'
  if (diff < h) return `${Math.floor(diff / m)}m`
  if (diff < d) return `${Math.floor(diff / h)}h`
  if (diff < 7 * d) return `${Math.floor(diff / d)}d`
  if (diff < 30 * d) return `${Math.floor(diff / (7 * d))}w`
  if (diff < 365 * d) return `${Math.floor(diff / (30 * d))}mo`
  return `${Math.floor(diff / (365 * d))}y`
}

/**
 * Group chats into time buckets for sidebar rendering.
 * Each chat must have a numeric `updatedAt`. Returns an ordered array
 * of { label, chats } where chats are in their original (newest-first) order.
 *
 *   Today        — same calendar day as `now`
 *   Yesterday    — calendar day immediately before
 *   Last 7 days  — older than yesterday, within 7 days
 *   Older        — anything older
 */
export function bucketByDate(chats, now = Date.now()) {
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  const startOfToday = today.getTime()
  const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000
  const sevenDaysAgo = startOfToday - 7 * 24 * 60 * 60 * 1000

  const buckets = {
    today: [],
    yesterday: [],
    week: [],
    older: [],
  }

  for (const chat of chats) {
    const ts = chat.updatedAt ?? 0
    if (ts >= startOfToday) buckets.today.push(chat)
    else if (ts >= startOfYesterday) buckets.yesterday.push(chat)
    else if (ts >= sevenDaysAgo) buckets.week.push(chat)
    else buckets.older.push(chat)
  }

  const out = []
  if (buckets.today.length) out.push({ label: 'Today', chats: buckets.today })
  if (buckets.yesterday.length) out.push({ label: 'Yesterday', chats: buckets.yesterday })
  if (buckets.week.length) out.push({ label: 'Last 7 days', chats: buckets.week })
  if (buckets.older.length) out.push({ label: 'Older', chats: buckets.older })
  return out
}
```

- [ ] **Step 2: Create `src/utils/formatters.test.js`**

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { formatRelativeShort, bucketByDate } from './formatters.js'

const NOW = new Date('2026-05-08T12:00:00.000Z').getTime()
const MIN = 60 * 1000
const HOUR = 60 * MIN
const DAY = 24 * HOUR

test('formatRelativeShort: under 1 minute → "now"', () => {
  assert.equal(formatRelativeShort(NOW - 30 * 1000, NOW), 'now')
})

test('formatRelativeShort: minutes', () => {
  assert.equal(formatRelativeShort(NOW - 5 * MIN, NOW), '5m')
})

test('formatRelativeShort: hours', () => {
  assert.equal(formatRelativeShort(NOW - 3 * HOUR, NOW), '3h')
})

test('formatRelativeShort: days', () => {
  assert.equal(formatRelativeShort(NOW - 2 * DAY, NOW), '2d')
})

test('formatRelativeShort: weeks', () => {
  assert.equal(formatRelativeShort(NOW - 14 * DAY, NOW), '2w')
})

test('formatRelativeShort: months', () => {
  assert.equal(formatRelativeShort(NOW - 60 * DAY, NOW), '2mo')
})

test('formatRelativeShort: years', () => {
  assert.equal(formatRelativeShort(NOW - 400 * DAY, NOW), '1y')
})

test('formatRelativeShort: missing timestamp → empty string', () => {
  assert.equal(formatRelativeShort(0, NOW), '')
  assert.equal(formatRelativeShort(undefined, NOW), '')
})

test('bucketByDate: groups today, yesterday, week, older', () => {
  const chats = [
    { id: '1', updatedAt: NOW - 30 * MIN },        // today
    { id: '2', updatedAt: NOW - 6 * HOUR },        // today
    { id: '3', updatedAt: NOW - 30 * HOUR },       // yesterday
    { id: '4', updatedAt: NOW - 4 * DAY },         // week
    { id: '5', updatedAt: NOW - 30 * DAY },        // older
  ]
  const out = bucketByDate(chats, NOW)
  assert.equal(out.length, 4)
  assert.deepEqual(out.map((b) => b.label), ['Today', 'Yesterday', 'Last 7 days', 'Older'])
  assert.equal(out[0].chats.length, 2)
  assert.equal(out[1].chats[0].id, '3')
  assert.equal(out[2].chats[0].id, '4')
  assert.equal(out[3].chats[0].id, '5')
})

test('bucketByDate: omits empty buckets', () => {
  const chats = [
    { id: 'a', updatedAt: NOW - 100 * DAY },
  ]
  const out = bucketByDate(chats, NOW)
  assert.equal(out.length, 1)
  assert.equal(out[0].label, 'Older')
})

test('bucketByDate: missing updatedAt → Older bucket (treated as 0)', () => {
  const chats = [{ id: 'x' }]
  const out = bucketByDate(chats, NOW)
  assert.equal(out.length, 1)
  assert.equal(out[0].label, 'Older')
  assert.equal(out[0].chats[0].id, 'x')
})
```

- [ ] **Step 3: Run the tests**

```bash
node --test src/utils/formatters.test.js
```

Expected output: 11 passing tests, no failures. If any fail, fix the helper code in `formatters.js` until they pass.

- [ ] **Step 4: Replace `src/components/ChatHistory.jsx`**

First read the current file to confirm the available API on the `useChat` hook (chats list, active chat id, rename/delete handlers). Open `src/components/ChatHistory.jsx` and `src/hooks/useChat.js` to confirm field names. The replacement assumes the existing API:

```jsx
import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { useChat } from '../hooks/useChat.js'
import { bucketByDate, formatRelativeShort } from '../utils/formatters.js'
import { classNames } from '../utils/helpers.js'

export default function ChatHistory({ onSelect }) {
  const { chats, activeChatId, setActiveChat, renameChat, deleteChat } = useChat()
  const [editingId, setEditingId] = useState(null)
  const [draftTitle, setDraftTitle] = useState('')

  const buckets = bucketByDate(chats)

  if (!chats.length) {
    return (
      <p className="px-4 py-6 text-center text-xs text-ink-3">
        No conversations yet
      </p>
    )
  }

  function startEdit(chat) {
    setEditingId(chat.id)
    setDraftTitle(chat.title || '')
  }
  function commitEdit() {
    if (editingId) {
      renameChat(editingId, draftTitle.trim() || 'Untitled')
    }
    setEditingId(null)
    setDraftTitle('')
  }
  function cancelEdit() {
    setEditingId(null)
    setDraftTitle('')
  }

  return (
    <div className="space-y-3 pb-3">
      {buckets.map((bucket) => (
        <div key={bucket.label}>
          <p className="mx-3 mb-1 mt-2 text-[10px] font-semibold uppercase tracking-wider text-ink-3">
            {bucket.label}
          </p>
          <ul className="px-1">
            {bucket.chats.map((chat) => {
              const isActive = chat.id === activeChatId
              const isEditing = chat.id === editingId
              return (
                <li key={chat.id}>
                  <div
                    className={classNames(
                      'group/row flex items-center gap-1 rounded-md px-2 py-1.5 transition',
                      isActive
                        ? 'border border-transparent text-ink-1'
                        : 'border border-transparent text-ink-2 hover:bg-surface-1 hover:text-ink-1',
                    )}
                    style={
                      isActive
                        ? {
                            backgroundImage: 'var(--accent-grad-soft)',
                            borderColor: 'rgba(168,85,247,0.2)',
                          }
                        : undefined
                    }
                  >
                    {isEditing ? (
                      <input
                        autoFocus
                        value={draftTitle}
                        onChange={(e) => setDraftTitle(e.target.value)}
                        onBlur={commitEdit}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commitEdit()
                          if (e.key === 'Escape') cancelEdit()
                        }}
                        className="flex-1 bg-transparent px-1 text-xs text-ink-1 outline-none"
                      />
                    ) : (
                      <button
                        onClick={() => {
                          setActiveChat(chat.id)
                          onSelect?.()
                        }}
                        className="flex-1 truncate text-left text-xs"
                      >
                        {chat.title || 'New chat'}
                      </button>
                    )}

                    <span className="ml-1 shrink-0 text-[10px] text-ink-3">
                      {formatRelativeShort(chat.updatedAt)}
                    </span>

                    {!isEditing && (
                      <span className="ml-1 hidden shrink-0 items-center gap-0.5 group-hover/row:flex">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            startEdit(chat)
                          }}
                          className="rounded p-0.5 text-ink-3 hover:bg-surface-2 hover:text-ink-1"
                          aria-label="Rename"
                          title="Rename"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (window.confirm('Delete this conversation?')) {
                              deleteChat(chat.id)
                            }
                          }}
                          className="rounded p-0.5 text-ink-3 hover:bg-surface-2 hover:text-err"
                          aria-label="Delete"
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 5: Verify against the actual `useChat` API**

Open `src/hooks/useChat.js` (or wherever `useChat` is defined — likely `src/context/ChatContext.jsx`). Confirm these names exist on the returned object: `chats`, `activeChatId`, `setActiveChat`, `renameChat`, `deleteChat`. If any name differs (e.g., `activeId` instead of `activeChatId`), adjust the destructure in the code above to match.

If `chats` doesn't already have `updatedAt` per chat, add it to whatever code creates/mutates chats so each chat carries `updatedAt: Date.now()`. (Minimal change: in the chat-creation function, set `updatedAt`. In the message-append function, also update it.) This is a small extra edit; do it before continuing if missing.

- [ ] **Step 6: Verify in browser**

- Send a few messages to create a few chats (or use existing localStorage if you have history).
- Open the sidebar. Verify:
  - Chats are grouped under "Today", "Yesterday", etc.
  - Each row has a small relative timestamp on the right ("2m", "1d").
  - Active row has the gradient-soft tint + violet border.
  - Hover a row — pencil and trash icons appear; clicking pencil enters inline edit mode.
  - Press Escape during edit cancels; Enter or blur commits.

- [ ] **Step 7: Commit**

```bash
git add src/utils/formatters.js src/utils/formatters.test.js src/components/ChatHistory.jsx
# also stage any updates to chat creation if you had to add updatedAt:
git add src/context/ChatContext.jsx 2>/dev/null || true
git commit -m "feat(history): date buckets + relative timestamps + inline rename"
```

---

## Task 9 — Animated branded empty state

**Files:**
- Create: `src/components/EmptyState.jsx`
- Modify: `src/components/ChatWindow.jsx` (replace inline `EmptyState` with import)

- [ ] **Step 1: Create `src/components/EmptyState.jsx`**

```jsx
import { Bot, Code2, FileText, Lightbulb, Sparkles } from 'lucide-react'
import { APP_NAME } from '../utils/constants.js'

const SUGGESTIONS = [
  {
    Icon: Code2,
    title: 'Code with me',
    sub: "Write a debounce hook in TypeScript with tests",
    prompt: 'Write a debounce hook in TypeScript with tests.',
  },
  {
    Icon: Lightbulb,
    title: 'Explain a concept',
    sub: "Quantum entanglement, like I'm 12",
    prompt: "Explain quantum entanglement like I'm 12.",
  },
  {
    Icon: Bot,
    title: 'Brainstorm ideas',
    sub: '10 unusual mobile-app ideas for runners',
    prompt: 'Give me 10 unusual mobile-app ideas for runners.',
  },
  {
    Icon: FileText,
    title: 'Summarize text',
    sub: 'Key risks of large language models',
    prompt: 'Summarize the key risks of large language models.',
  },
]

export default function EmptyState({ onPick }) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center justify-center gap-5 py-12 text-center">
      <div className="relative">
        <span
          className="flex h-16 w-16 items-center justify-center rounded-2xl text-white"
          style={{
            backgroundImage: 'var(--accent-grad)',
            boxShadow: 'var(--glow-md)',
          }}
          aria-hidden="true"
        >
          <Sparkles className="h-7 w-7" />
        </span>
        {/* Pulsing halo */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-2 rounded-[22px] border border-line-2 animate-haloPulse"
        />
      </div>

      <h2 className="text-[26px] font-semibold leading-tight tracking-tight text-ink-1">
        What can <span className="text-gradient">{APP_NAME}</span> help with today?
      </h2>

      <p className="max-w-md text-sm leading-relaxed text-ink-2">
        Ask anything — coding, writing, research, or brainstorming. Local
        models stay on your machine; cloud models stream from your provider.
      </p>

      <ul className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
        {SUGGESTIONS.map(({ Icon, title, sub, prompt }) => (
          <li key={title}>
            <button
              onClick={() => onPick(prompt)}
              className="group/sug relative w-full overflow-hidden rounded-xl border border-line-1 px-4 py-3 text-left transition hover:-translate-y-0.5"
              style={{ background: 'var(--surface-1)' }}
            >
              {/* Soft gradient overlay on hover */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-0 transition group-hover/sug:opacity-100"
                style={{ backgroundImage: 'var(--accent-grad-soft)' }}
              />
              <span
                className="relative z-10 mb-2 flex h-7 w-7 items-center justify-center rounded-md text-accent-cyan"
                style={{ background: 'var(--surface-2)' }}
              >
                <Icon className="h-3.5 w-3.5" />
              </span>
              <span className="relative z-10 block text-sm font-medium text-ink-1">
                {title}
              </span>
              <span className="relative z-10 mt-0.5 block text-xs text-ink-3">
                {sub}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

- [ ] **Step 2: Modify `src/components/ChatWindow.jsx`**

Replace the import block at the top (add `EmptyState` import and remove the inline `SUGGESTIONS` constant + inline `EmptyState` function at the bottom):

Find the imports section, currently:
```jsx
import { useMemo } from 'react'
import { AlertTriangle, ArrowDown, Bot, Sparkles } from 'lucide-react'
```
Change to:
```jsx
import { useMemo } from 'react'
import { AlertTriangle, ArrowDown } from 'lucide-react'
import EmptyState from './EmptyState.jsx'
```

Find and DELETE the entire `SUGGESTIONS` constant (lines around 9–14 in the current file).

Find and DELETE the entire `function EmptyState({ onPick }) { ... }` definition at the bottom of the file.

The `<EmptyState onPick={(text) => sendMessage(text)} />` JSX usage inside the component stays unchanged (it now refers to the imported one).

- [ ] **Step 3: Verify in browser**

Refresh on a fresh empty chat (delete history or start a new conversation). Verify:
- Hero glyph is a gradient square with a sparkle icon, glow shadow, and a slowly pulsing 1px halo around it.
- Heading uses gradient text on the app name (the word "Lumen").
- Tagline visible below.
- 4 suggestion cards in 2×2 grid; hovering one lifts it slightly and tints the surface with the soft gradient.
- Clicking a suggestion sends that prompt as a message.

- [ ] **Step 4: Commit**

```bash
git add src/components/EmptyState.jsx src/components/ChatWindow.jsx
git commit -m "feat(empty-state): animated branded hero with gradient glyph"
```

---

## Task 10 — Streaming token reveal

**Files:**
- Modify: `src/components/MessageBubble.jsx` (add streaming flag + per-element fade animation on the assistant `Markdown` wrapper)

The reveal works by toggling a CSS class on the assistant bubble's content wrapper while streaming. The class applies `animation: tokenFade 80ms ease-out backwards` to direct child elements of the markdown root. Because react-markdown reuses DOM nodes for unchanged prefixes, only newly-mounted children animate. Existing tokens stay opaque.

- [ ] **Step 1: Update `src/components/MessageBubble.jsx`**

Two changes:

1. The component already receives the `message` object — add `message.streaming` (a boolean already set by the chat hook during active SSE streams) check and apply a class.
2. Wrap the `<Markdown>` invocation in a `<div>` whose class enables the animation when `message.streaming` is true.

In `MessageBubble`, replace the conditional that renders user vs. assistant content:

Old:
```jsx
{isUser ? (
  <span className="whitespace-pre-wrap break-words">{message.content}</span>
) : (
  <Markdown content={message.content} />
)}
```

New:
```jsx
{isUser ? (
  <span className="whitespace-pre-wrap break-words">{message.content}</span>
) : (
  <div
    className={classNames(
      'streaming-md',
      message.streaming && 'is-streaming',
    )}
  >
    <Markdown content={message.content} />
    {message.streaming && (
      <span
        aria-hidden="true"
        className="ml-0.5 inline-block h-3 w-[2px] align-[-2px] animate-cursorBlink"
        style={{ background: 'var(--accent-2)' }}
      />
    )}
  </div>
)}
```

- [ ] **Step 2: Add CSS for the per-element fade**

Append to `src/index.css` (at the bottom, after the `.prose-chat *` rules):

```css
/* Streaming token reveal — fade in newly-mounted elements while is-streaming. */
.streaming-md.is-streaming > * {
  animation: tokenFade 80ms ease-out both;
}
@media (prefers-reduced-motion: reduce) {
  .streaming-md.is-streaming > * { animation: none; }
}
```

- [ ] **Step 3: Verify in browser with local llama**

Start the backend + ollama, send a prompt that produces a long answer with paragraph breaks ("Explain the difference between DNS records: A, AAAA, CNAME, MX, TXT — one paragraph each"). Observe:
- New paragraphs and list items as they arrive fade in over ~80ms (subtle but present).
- A blinking cyan cursor sits at the end of the live token until streaming completes.
- Existing text already on screen does not flash or re-fade as new tokens arrive.
- After streaming completes, the bubble is fully opaque and the cursor disappears.

If you don't see the fade, inspect a streaming bubble in DevTools — you should see `class="streaming-md is-streaming"` on the wrapper. If the class isn't appearing, confirm `message.streaming` is reaching the component (log it once, then remove the log).

- [ ] **Step 4: Commit**

```bash
git add src/components/MessageBubble.jsx src/index.css
git commit -m "feat(streaming): per-token fade-in + blinking cursor"
```

---

## Task 11 — Settings modal + typing indicator + jump-to-latest pill polish

**Files:**
- Modify: `src/components/SettingsModal.jsx`
- Modify: `src/components/TypingIndicator.jsx`
- Modify: `src/components/ChatWindow.jsx` (jump-to-latest pill restyle)

- [ ] **Step 1: Read current `src/components/SettingsModal.jsx` and `src/components/TypingIndicator.jsx`**

Open both files first to know exactly what's there. Most modals have an overlay + dialog + form. We'll replace surface colors with tokens and use `card-glass`/`btn-gradient`/`input-base` instead of slate/brand classes.

- [ ] **Step 2: Update `src/components/SettingsModal.jsx`**

Identify each Tailwind class group that uses `slate-*`, `brand-*`, `bg-white`, or `dark:bg-slate-*` etc. Replace per the table:

| Old class | New class |
|---|---|
| `bg-white dark:bg-slate-900` | `bg-bg-elev` |
| `border-slate-200 dark:border-slate-800` | `border-line-1` |
| `text-slate-900 dark:text-slate-100` | `text-ink-1` |
| `text-slate-500 dark:text-slate-400` | `text-ink-2` |
| `text-slate-400 dark:text-slate-500` | `text-ink-3` |
| `bg-slate-50 dark:bg-slate-800` | `bg-surface-1` |
| `bg-brand-600 hover:bg-brand-700` | `btn-gradient` (replace whole button class set) |
| `ring-1 ring-slate-200 dark:ring-slate-800` | `border border-line-1` |
| `shadow-card` / `shadow-soft` | `shadow-lift` |

Form inputs: any `<input>`/`<textarea>`/`<select>` that previously used slate borders → switch to `className="input-base"`.

The overlay backdrop (the dimmed page behind the modal) should use:
```jsx
<div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />
```

The dialog body should use:
```jsx
<div className="fixed left-1/2 top-1/2 z-50 w-[92%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-bg-elev border border-line-1 shadow-lift">
  ...
</div>
```

Do NOT change the modal's internal logic, props, or state — only restyle.

- [ ] **Step 3: Update `src/components/TypingIndicator.jsx`**

Open and inspect. The animation already exists (`animate-bounceDot`). Only color changes:
- Dots use `bg-accent-cyan` (i.e. `style={{ background: 'var(--accent-2)' }}`).
- Container, if any, uses `bg-surface-1` matching assistant bubbles.

If the current implementation has a wrapping bubble, keep its structure but update those classes. The indicator should look like an assistant bubble with three small cyan dots animating.

- [ ] **Step 4: Update jump-to-latest pill in `src/components/ChatWindow.jsx`**

Current code:
```jsx
<button
  onClick={() => scrollToBottom()}
  className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-card ring-1 ring-slate-200 transition hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700 dark:hover:bg-slate-800"
>
```

Replace with:
```jsx
<button
  onClick={() => scrollToBottom()}
  className="chip absolute bottom-4 left-1/2 z-10 -translate-x-1/2 transition hover:-translate-y-0.5"
  style={{ boxShadow: 'var(--lift)' }}
>
```

(The text content stays unchanged.)

- [ ] **Step 5: Verify in browser**

- Open Settings modal: dark glass surface, lift shadow, primary action uses gradient button. Theme toggle inside the app still works while modal is open.
- Send a slow prompt; while it streams, the typing indicator (only briefly visible before first token) shows three cyan bouncing dots inside an assistant-bubble surface.
- Scroll up in a long conversation while a response is finishing — "Jump to latest" pill appears as a subtle chip above the input. Click it; it smooth-scrolls to bottom and disappears.

- [ ] **Step 6: Commit**

```bash
git add src/components/SettingsModal.jsx src/components/TypingIndicator.jsx src/components/ChatWindow.jsx
git commit -m "feat(polish): settings modal + typing indicator + jump pill"
```

---

## Task 12 — Light-mode pass

A targeted pass to catch any surface that still leaks dark-only colors when the user toggles to light mode. No new code expected — just visual verification + small fixes.

**Files:**
- Possibly modify: any component file where leakage is found

- [ ] **Step 1: Toggle to light mode**

In the running app, click the moon/sun toggle to enter light mode.

- [ ] **Step 2: Walk every surface**

For each item below, confirm it looks correct in light mode. If wrong, identify the offending class/style in the named component, replace with a token, commit a fix, and continue.

- Sidebar (background, border, brand row, new chat button, history items, footer).
- Header (translucent white background, model chip readable, theme toggle visible).
- Empty state (gradient logo + halo still vibrant; suggestion cards have visible borders and hover lift).
- Active conversation (assistant bubbles have visible 1px border, code blocks remain dark).
- User bubble: gradient still vibrant against white.
- Settings modal: white surface, dark text, gradient primary button.

- [ ] **Step 3: Verify orb backdrop is suppressed in light mode**

Open DevTools → Elements. The two dark-mode orb divs should have `display: none` (via `hidden dark:block`). Only the soft top radial gradient div is visible. Confirm.

- [ ] **Step 4: Verify no leftover `brand-*` classes**

```bash
grep -rE '(bg|text|border|ring|from|to|via)-brand-[0-9]+' src/ index.html 2>&1 | grep -v node_modules
```

Expected: no output. If any matches, replace them with the appropriate token-based class from the table in Task 11 (or remove if vestigial).

- [ ] **Step 5: Verify no leftover `slate-*` color classes used as theme colors**

```bash
grep -rE '(bg|text|border|ring)-slate-[0-9]+' src/ index.html 2>&1 | grep -v node_modules
```

Most should be gone. The few that remain (e.g., a fallback in markdown code blocks if any) should be intentional.

- [ ] **Step 6: Commit (if any fixes were needed)**

```bash
git add -A
git commit -m "fix(theme): light-mode polish pass" 2>/dev/null || echo "No leakage found"
```

---

## Task 13 — Backend `/api/health` endpoint

**Files:**
- Create: `backend/routes/health.js`
- Create: `backend/routes/health.test.js` (`node --test`)
- Modify: `backend/server.js` (mount the route)

- [ ] **Step 1: Create `backend/routes/health.js`**

```js
import { Router } from 'express'

/**
 * GET /api/health
 *
 * Returns provider availability flags so the frontend can show an
 * "online" indicator next to the active model.
 *
 *   {
 *     ok: true,
 *     providers: {
 *       openai:    boolean,  // OPENAI_API_KEY set
 *       anthropic: boolean,  // ANTHROPIC_API_KEY set
 *       google:    boolean,  // GOOGLE_API_KEY set
 *       llama:     boolean,  // LLAMA_BASE_URL is reachable
 *     }
 *   }
 *
 * The llama check is a 750ms-timed-out HEAD request; non-fatal on any
 * error/timeout.
 */
export const router = Router()

router.get('/', async (_req, res) => {
  const providers = {
    openai: Boolean(process.env.OPENAI_API_KEY),
    anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
    google: Boolean(process.env.GOOGLE_API_KEY),
    llama: await checkLlama(),
  }
  res.json({ ok: true, providers })
})

export async function checkLlama(baseUrl = process.env.LLAMA_BASE_URL) {
  if (!baseUrl) return false
  // Try the OpenAI-compatible `/models` endpoint with a short timeout.
  const url = baseUrl.replace(/\/+$/, '') + '/models'
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), 750)
  try {
    const r = await fetch(url, { method: 'GET', signal: controller.signal })
    return r.ok
  } catch {
    return false
  } finally {
    clearTimeout(t)
  }
}
```

- [ ] **Step 2: Create `backend/routes/health.test.js`**

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { checkLlama } from './health.js'

test('checkLlama: returns false when baseUrl is empty', async () => {
  const result = await checkLlama('')
  assert.equal(result, false)
})

test('checkLlama: returns false when baseUrl is undefined', async () => {
  const result = await checkLlama(undefined)
  assert.equal(result, false)
})

test('checkLlama: returns false on connection refused', async () => {
  // Port 1 is reserved and not listening — fetch will fail fast.
  const result = await checkLlama('http://127.0.0.1:1/v1')
  assert.equal(result, false)
})

test('checkLlama: returns false on bad URL', async () => {
  const result = await checkLlama('http://nonexistent.invalid:1/v1')
  assert.equal(result, false)
})
```

The "happy path" (returns true) test is deliberately omitted because it would require a running mock server — overkill for a single util. The endpoint is also exercised manually via curl in Step 4.

- [ ] **Step 3: Run the test**

```bash
cd backend
node --test routes/health.test.js
```

Expected: 4 passing tests.

- [ ] **Step 4: Mount the route in `backend/server.js`**

Read `backend/server.js` first to see the existing route-mount pattern (chat + auth routes). Add an import and a mount alongside them.

Add near the top with the other route imports:
```js
import { router as healthRouter } from './routes/health.js'
```

Add near the other `app.use('/api/...', ...)` calls:
```js
app.use('/api/health', healthRouter)
```

- [ ] **Step 5: Verify with curl**

```bash
curl -sS http://localhost:8080/api/health | head -200
```

Expected output (assuming `LLAMA_BASE_URL` points at a running Ollama):
```json
{"ok":true,"providers":{"openai":false,"anthropic":false,"google":false,"llama":true}}
```

If any cloud key is set in `backend/.env`, that provider will show `true`. If Ollama isn't running, `llama` shows `false`.

- [ ] **Step 6: Commit**

```bash
git add backend/routes/health.js backend/routes/health.test.js backend/server.js
git commit -m "feat(backend): /api/health endpoint with provider availability"
```

---

## Task 14 — Header online-dot wired to /api/health

**Files:**
- Create: `src/services/healthService.js`
- Modify: `src/components/Header.jsx` (wire the dot to live data)

- [ ] **Step 1: Create `src/services/healthService.js`**

```js
import api from './api.js'
import { MODELS } from '../utils/constants.js'

let cached = null

export async function getHealth() {
  if (cached) return cached
  try {
    const r = await api.get('/health')
    cached = r.data
    return cached
  } catch {
    cached = { ok: false, providers: {} }
    return cached
  }
}

export function providerForModel(modelId) {
  return MODELS.find((m) => m.id === modelId)?.provider ?? null
}
```

- [ ] **Step 2: Verify the existing axios `api` instance is at `src/services/api.js`**

```bash
cat src/services/api.js | head -30
```

It should default-export an axios instance configured with `VITE_API_BASE_URL`. The import in `healthService.js` assumes that. If the existing file uses a named export instead, adjust the import line accordingly.

- [ ] **Step 3: Wire the live dot in `src/components/Header.jsx`**

Add at the top (with other imports):
```jsx
import { useEffect, useState } from 'react'
import { getHealth, providerForModel } from '../services/healthService.js'
```

Inside the `Header` function (after the existing `useTheme` / `useChat` calls):
```jsx
const [providers, setProviders] = useState(null)
useEffect(() => {
  let alive = true
  getHealth().then((h) => {
    if (alive) setProviders(h.providers)
  })
  return () => { alive = false }
}, [])

const provider = providerForModel(model)
const isOnline = providers ? Boolean(providers[provider]) : null
```

Update the `<ModelSelector>` invocation to pass the dot color:
```jsx
<ModelSelector value={model} onChange={setModel} status={isOnline} />
```

In the `ModelSelector` function, accept `status` and use it to color the dot:
```jsx
function ModelSelector({ value, onChange, status }) {
  const dotColor =
    status === true ? 'var(--ok)' :
    status === false ? 'var(--text-3)' :
    'var(--text-3)' // unknown / loading — gray
  const glow = status === true ? '0 0 6px rgba(34,197,94,.6)' : 'none'
  return (
    <label
      className="chip relative cursor-pointer pl-2 pr-7"
      style={{ paddingTop: 0, paddingBottom: 0, height: '32px' }}
      title={status === true ? 'Provider reachable' : status === false ? 'Provider unreachable' : 'Checking…'}
    >
      <span className="sr-only">Model</span>
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ background: dotColor, boxShadow: glow }}
        aria-hidden="true"
      />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-transparent pr-1 text-xs font-medium text-ink-1 outline-none"
        style={{ background: 'transparent' }}
      >
        {MODELS.map((m) => (
          <option key={m.id} value={m.id}>
            {m.label}
          </option>
        ))}
      </select>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-3"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.24 4.38a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
          clipRule="evenodd"
        />
      </svg>
    </label>
  )
}
```

- [ ] **Step 4: Verify in browser**

With backend + Ollama running:
- Select a llama model. Dot is green (Ollama reachable).
- Stop Ollama (`pkill ollama` or close the app), then **hard reload the page** (Cmd+Shift+R) to bust the in-memory cache. Dot is gray. (The cache is per-session by design — toggling Ollama between hard reloads is the only way to see the change live.)
- Select a model whose provider has no key set in `backend/.env` (e.g., `gpt-4.1` if `OPENAI_API_KEY` is empty). Dot is gray, tooltip "Provider unreachable".

- [ ] **Step 5: Commit**

```bash
git add src/services/healthService.js src/components/Header.jsx
git commit -m "feat(header): wire online dot to /api/health"
```

---

## Task 15 — Deploy: render.yaml + README deploy section

**Files:**
- Create: `render.yaml` (project root)
- Modify: `README.md` (replace existing "Production deployment" section)
- Verify: `vercel.json` (no edits needed; existing config covers Vite SPA correctly)

- [ ] **Step 1: Create `render.yaml`**

```yaml
# Render Blueprint — provisions the backend Web Service.
# Reference: https://render.com/docs/blueprint-spec
services:
  - type: web
    name: lumen-backend
    runtime: node
    plan: free
    rootDir: backend
    buildCommand: npm install
    startCommand: npm start
    autoDeploy: true
    envVars:
      - key: NODE_ENV
        value: production
      # Provider keys — set these manually in the Render dashboard.
      - key: OPENAI_API_KEY
        sync: false
      - key: ANTHROPIC_API_KEY
        sync: false
      - key: GOOGLE_API_KEY
        sync: false
      # Required: where the frontend is served from (Vercel URL).
      - key: CORS_ORIGIN
        sync: false
      # JWT secret. Generate with `openssl rand -hex 32`.
      - key: JWT_SECRET
        sync: false
      # Optional: rate limit per-IP per minute.
      - key: RATE_LIMIT_PER_MIN
        value: "60"
```

- [ ] **Step 2: Read the current README**

```bash
cat README.md | sed -n '170,228p'
```

This shows the existing "Production deployment" section (~lines 173–212 today). We replace it.

- [ ] **Step 3: Replace the README "Production deployment" section**

Open `README.md`. Find the line `## Production deployment` and replace everything from that heading down to (but not including) `## Scripts` with this:

```markdown
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
```

- [ ] **Step 4: Run lint to confirm nothing else broke**

```bash
npm run lint 2>&1 | tail -20
```

Expected: 0 warnings/errors.

- [ ] **Step 5: Build to confirm production frontend builds**

```bash
npm run build 2>&1 | tail -20
```

Expected: `dist/` produced, no errors.

- [ ] **Step 6: Commit**

```bash
git add render.yaml README.md
git commit -m "docs(deploy): render.yaml + Vercel/Render walkthrough"
```

---

## Task 16 — Push to GitHub + first deploy (manual, user-driven)

This task can't be scripted because it requires the user's GitHub credentials, Render account, and Vercel account. Treat this as a guided manual checklist.

- [ ] **Step 1: Create GitHub repo + push**

```bash
gh auth status   # confirm logged in; if not: gh auth login
gh repo create lumen --public --source=. --push
```

If you don't have `gh`, do the equivalent in the GitHub web UI: create a new empty repo named `lumen`, then:
```bash
git remote add origin git@github.com:<yourname>/lumen.git
git branch -M main
git push -u origin main
```

- [ ] **Step 2: Provision Render**

Follow `README.md` → Production deployment → section B exactly. Stop at the smoke-test step.

- [ ] **Step 3: Provision Vercel**

Follow section C exactly.

- [ ] **Step 4: Set CORS_ORIGIN on Render to your Vercel URL**

Edit env vars in Render → Manual Deploy → "Clear build cache & deploy".

- [ ] **Step 5: Run end-to-end smoke test**

Follow section D exactly. If anything fails, file the failure mode against the checklist in section D and debug from there (the most common failure is a CORS mismatch — confirm origin includes `https://` and has no trailing slash).

- [ ] **Step 6: Tag the deploy**

```bash
git tag -a v1.0.0 -m "First production deploy: Glass Dark redesign"
git push --tags
```

---

## Self-review (writer's checklist)

- **Spec coverage** — every section of the spec has at least one task implementing it:
  - §2 Naming/copy → Task 2.
  - §3 Tokens/typography/radii/shadows/motion → Task 1.
  - §4.1–4.12 Per-component edits → Tasks 4–11 cover each component (Sidebar, Header, ChatWindow, MessageBubble + code blocks, ChatInput, ChatHistory, EmptyState, SettingsModal, TypingIndicator).
  - §4.4 Sidebar enhanced footer (no avatar/email v1) → Task 4 honored.
  - §5 Light fallback → Task 1 (variables) + Task 12 (verification pass).
  - §6.1 Backdrop layer → Task 3.
  - §6.2 Theme system + dark default → Task 1 + Task 2.
  - §6.3 File layout → covered by individual tasks.
  - §6.4 Token-streaming reveal → Task 10.
  - §7.1–7.3 Vercel/Render/CORS → Task 15 (+ existing `vercel.json`).
  - §7.3 `/api/health` → Task 13.
  - §7.4 Local-llama prod note → README in Task 15.
  - §7.5 Deploy checklist → README in Task 15.
  - §8 Migration plan stages 1–8 → Tasks 1, 3–6, 7, 8, 9, 10, 12, 15 (mapped 1:1 with renumbering).
  - §10 Acceptance criteria → all checkboxes are exercised by the per-task verification steps.
- **Placeholder scan** — no "TBD/TODO" remain; every step has either real code or an exact command.
- **Type/name consistency** — `formatRelativeShort`, `bucketByDate`, `getHealth`, `providerForModel`, `checkLlama` are all referenced consistently across tasks. Tailwind token names (`bg-bg-elev`, `border-line-1`, `text-ink-2`, `bg-accent-violet`) match between `tailwind.config.js` and component code.
- **One area still requires the user**: Step 5 of Task 8 (verifying `useChat` field names). Could not pre-resolve this in the plan because the file's exports vary by codebase shape; explicit instruction added to read the file and adjust.
