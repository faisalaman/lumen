# Glass Dark Redesign + Deploy — Design Spec

**Date:** 2026-05-08
**Status:** Approved (visual direction); awaiting spec review before plan
**Outcome:** Full visual + motion overhaul of the chat app to a "Glass Dark" aesthetic with a clean light-mode fallback, plus a new animated branded empty state, and a production deployment to Vercel (frontend) + Render (backend).

---

## 1. Goals & non-goals

**Goals**
1. Replace the current generic SaaS-blue look with a distinctive, modern "Glass Dark" identity (deep dark surfaces, frosted-glass cards, electric purple→cyan gradient accent).
2. Ship a clean light-mode fallback that's visually distinct from but coherent with the dark mode.
3. Replace the current 4-card empty state with an animated, branded hero that sets the product's tone.
4. Deploy a public, working version (Vercel for the static frontend, Render for the Express backend) with documented setup.

**Non-goals**
- Adding new features (no command palette, no file uploads, no slash commands, no model comparison view, no inline model switcher).
- Changing the shell layout (sidebar / header / chat / input stays in the same arrangement).
- Backend-architecture changes (Express stays Express; provider abstraction stays as-is).
- Auth changes — the existing optional JWT layer is fine for v1.
- Replacing the cloud-only model behavior in production — local Ollama remains a dev-only path.

---

## 2. Naming and copy

| Item | Value |
|---|---|
| App name | **Lumen** *(replaces "AI Chatbot")* |
| Tagline (empty state) | *"Ask anything — coding, writing, research, or brainstorming. Local models stay on your machine; cloud models stream from your provider."* |
| Empty-state heading | *"What can Lumen help with today?"* (with "Lumen" rendered as gradient text) |
| HTML `<title>` / favicon | "Lumen — AI Chat" |

`APP_NAME` already routes through `import.meta.env.VITE_APP_NAME`, so this is a one-line change in the env plus a default in `src/utils/constants.js`. If "Lumen" is not the final name, the only change needed later is one env value and the favicon.

---

## 3. Design system

### 3.1 Tokens

Defined as CSS custom properties on `:root` (light) and `.dark` (dark). Tailwind reads them via `theme.extend.colors` referencing the variables. Both themes share spacing, typography, radii, motion — only colors and shadow recipes differ.

**Dark (Glass Dark, primary):**

| Token | Value | Use |
|---|---|---|
| `--bg-deep` | `#07060c` | Page background base |
| `--bg-elev` | `#0e0d1a` | Modal / popover background |
| `--surface-1` | `rgba(255,255,255,0.03)` | Sidebar, header, cards (resting) |
| `--surface-2` | `rgba(255,255,255,0.06)` | Cards (hover), assistant bubbles, code-block frame |
| `--surface-3` | `rgba(0,0,0,0.45)` | Code block body (deeper than surrounding) |
| `--border-1` | `rgba(255,255,255,0.06)` | Resting borders |
| `--border-2` | `rgba(255,255,255,0.10)` | Input border, hover borders |
| `--text-1` | `#f5f5f7` | Primary text |
| `--text-2` | `#a1a1aa` | Secondary / metadata |
| `--text-3` | `#71717a` | Tertiary / timestamps / placeholder |
| `--accent-1` | `#a855f7` | Violet (gradient start) |
| `--accent-2` | `#22d3ee` | Cyan (gradient end) |
| `--accent-grad` | `linear-gradient(135deg, #a855f7 0%, #22d3ee 100%)` | User bubble, primary buttons, brand mark, gradient text |
| `--accent-grad-soft` | `linear-gradient(135deg, rgba(168,85,247,.18) 0%, rgba(34,211,238,.12) 100%)` | Active sidebar row, hover overlays |
| `--success` | `#22c55e` | Online dot, success state |
| `--warn` | `#f59e0b` | Warnings |
| `--error` | `#f43f5e` | Errors |

**Light (clean fallback):**

| Token | Value |
|---|---|
| `--bg-deep` | `#ffffff` |
| `--bg-elev` | `#fafafa` |
| `--surface-1` | `rgba(15,23,42,0.03)` |
| `--surface-2` | `rgba(15,23,42,0.06)` |
| `--surface-3` | `#0f172a` *(code blocks stay dark for code legibility)* |
| `--border-1` | `#e5e7eb` |
| `--border-2` | `#d4d4d8` |
| `--text-1` | `#0f172a` |
| `--text-2` | `#475569` |
| `--text-3` | `#94a3b8` |
| `--accent-*` | unchanged from dark — the gradient is the brand and stays consistent |

**Dropping**: The existing `brand-50…brand-900` palette in `tailwind.config.js` is replaced wholesale. No code outside the components references those scale numbers directly except via Tailwind classes (`bg-brand-600`, etc.) — those are migrated to the new tokens.

### 3.2 Typography

- **Inter** for everything (already wired). Weights used: 400, 500, 600.
- **JetBrains Mono** for code (already wired).
- **Type scale** (rem assuming 16px root):
  - `xs` 0.75 / `sm` 0.8125 / **base** 0.875 / `md` 0.9375 / `lg` 1.0625 / `xl` 1.25 / `hero` 1.625 (26px)
- **Letter-spacing**: `-0.01em` on `lg+`, `-0.02em` on `hero`. Body default.
- **Line-height**: 1.55 body, 1.2 headings, 1.6 in code.

### 3.3 Radii

| Token | Value | Use |
|---|---|---|
| `sm` | 6px | Chips, tags, pills |
| `md` | 8px | Buttons, sidebar rows |
| `lg` | 10px | Inputs, message bubbles |
| `xl` | 14px | Cards, input bar wrapper |
| `2xl` | 18px | Hero glyph |
| `full` | 9999px | Avatars, status dots |

Bubbles use asymmetric radii to indicate sender direction: user `12px 12px 4px 12px`, assistant `12px 12px 12px 4px`.

### 3.4 Shadows

Dark mode uses **glow-style** shadows (colored, blurred); light mode uses **lift-style** (gray, soft).

| Token | Dark | Light |
|---|---|---|
| `glow-sm` | `0 4px 14px rgba(168,85,247,.35)` | `0 2px 6px rgba(15,23,42,.06)` |
| `glow-md` | `0 8px 24px rgba(168,85,247,.4), 0 0 40px rgba(34,211,238,.25)` | `0 4px 14px rgba(15,23,42,.08)` |
| `lift` | `0 16px 48px rgba(0,0,0,.45)` | `0 16px 48px rgba(15,23,42,.08)` |

### 3.5 Motion

Single source of truth: timings + easings used everywhere.

| Token | Value | Use |
|---|---|---|
| `--motion-fast` | `120ms ease-out` | Button hover, icon swap |
| `--motion-base` | `180ms ease-out` | Card hover, surface transitions |
| `--motion-slow` | `260ms cubic-bezier(0.4, 0, 0.2, 1)` | Modal in/out, bubble entry |
| `--motion-spring` | framer-motion spring `{ stiffness: 320, damping: 26 }` | Bubble entry |

**Streaming token reveal**: Each token fades in with `opacity 0→1` over 80ms via a CSS class on freshly-arrived content. *(This is the critical perceived-performance moment — without it, streaming feels janky on local Llama.)*

**Background orb drift**: 12s/14s asymmetric `ease-in-out` infinite, `transform: translate()` of small offsets. Behind everything via `z-index: 0`.

**Hero glyph halo**: 3s `ease-in-out` infinite, `transform: scale(1) ↔ scale(1.08)` with opacity 0.8↔0.3 — a slow breathing pulse.

**Streaming cursor**: blinks 1s steps(2), 2px×13px cyan bar at the end of the live token.

`prefers-reduced-motion: reduce` disables orb drift, halo pulse, and the streaming token fade. The streaming cursor and bubble entry stay (functionally informative).

---

## 4. Component-by-component changes

### 4.1 `src/index.css`

Replace the global CSS with the new token system. Preserve `@tailwind base/components/utilities`. Drop the existing `--brand-*` references. Add the orb backdrop (positioned fixed in body, behind `#root`) — see §6.1 for placement.

### 4.2 `tailwind.config.js`

- Replace `colors.brand` with token-referencing colors: `bg`, `surface`, `border`, `text`, `accent` mapped to CSS variables.
- Add `boxShadow.glow-sm`, `glow-md`, `lift` referencing variables.
- Add `borderRadius` updates per §3.3.
- Keep `keyframes/animation` for `bounceDot` and `fadeIn`. Add `orbDrift`, `haloPulse`, `tokenFade`.

### 4.3 `src/pages/ChatPage.jsx`

- Add a fixed-position orb backdrop layer behind the app shell.
- Apply the glass surface treatment to `<main>` (translucent + backdrop-blur) only in dark mode.
- No structural changes (still flex h-screen with sidebar + main column).

### 4.4 `src/components/Sidebar.jsx`

- Brand row: replace plain Sparkles+text with **gradient logo glyph + app name**.
- "New chat" button: switch from solid `btn-primary` to `--accent-grad` background with `glow-sm`.
- Section labels (Today / Yesterday / Older): add — currently the list is flat. Source from `chat.updatedAt` grouped into buckets (today, yesterday, last 7 days, older).
- Thread row: add a right-aligned timestamp (`Xm`/`Xh`/`Xd` relative).
- Active row: gradient-soft background + thin gradient border.
- Footer: a styled "Settings" row with the gear icon. The mockup's avatar + email is **conditional** — only rendered if a `user.email` value is present in localStorage (added later when real auth lands). For v1 the footer is the gear + "Settings" label on `surface-1` background, slightly more prominent than today's `btn-ghost`.

### 4.5 `src/components/Header.jsx`

- Glass treatment: `bg-rgba(7,6,12,.5)` (dark) / `bg-rgba(255,255,255,.7)` (light) with `backdrop-blur(12px)`.
- Model selector: keep the existing native `<select appearance-none>` for accessibility; restyle the chrome to look like a chip (matching `surface-1` + `border-1`, gradient ring on `:hover`/`:focus`). The green "online" dot sits **outside** the `<select>`, in the chip wrapper, so styling stays simple.
- Online dot logic: a single ping at app load to `GET /api/health` (added in §7.3) returns which providers are reachable. The dot is green when the currently-selected model's provider is reachable, gray otherwise. Result is cached in memory for the session.
- Token counter: chip-style (`surface-1`, rounded-full).

### 4.6 `src/components/ChatWindow.jsx`

The `min-h-0` flex fix from earlier today stays. Beyond that, only style polish:
- Bubbles: per-direction asymmetric radii.
- Assistant bubble: `surface-1` + 1px `border-1`.
- User bubble: gradient bg, white text, `glow-sm` shadow.
- Token reveal: wrap each freshly-streamed segment in a `<span class="token-reveal">` so CSS can fade it in. *Implementation: append-only spans during streaming; coalesce to plain text on stream completion to keep DOM lean.*
- "Jump to latest" pill: re-style as glass chip with gradient ring on hover.

### 4.7 `src/components/MessageBubble.jsx` & code blocks

- The existing `CodeBlock` (PrismLight syntax highlighter) keeps its structure; only the chrome (header bar with language + copy button) and surface colors change. Header becomes `surface-2`; body becomes `surface-3` (dark in both themes — code stays legible).
- Inline `<code>` becomes `surface-2` with `--text-1`.

### 4.8 `src/components/ChatInput.jsx`

- Wrapper: `surface-1` + `border-2` + `radius-xl` + backdrop-blur.
- Send button: `--accent-grad` + `glow-sm`.
- Disabled state: drop opacity, no glow.
- Stop button: `surface-2` neutral.

### 4.9 `src/components/TypingIndicator.jsx`

- 3 dots, accent-cyan, with `bounceDot` animation (already exists — palette updates only).

### 4.10 `src/components/ChatHistory.jsx`

- Add bucket headers (Today / Yesterday / Last 7 days / Older).
- Per-row: title + relative timestamp + hover actions (rename, delete) revealed on hover.

### 4.11 `src/components/SettingsModal.jsx`

- Surface: `bg-elev` + `border-1` + `lift` shadow.
- Form fields: input-base classes restyled to use new tokens.
- No new fields in this redesign.

### 4.12 New: animated empty state

Lives inside `ChatWindow.jsx`'s `EmptyState` component — replace the existing implementation.

**Structure** (centered, max-width 560px):
1. **Hero glyph** — 64px gradient-filled square (`--accent-grad`) with a sparkle/star SVG inside, surrounded by a pulsing 1px ring (haloPulse).
2. **Heading** — "What can `<gradient-text>Lumen</gradient-text>` help with today?" — 26px, weight 600, tight letter-spacing.
3. **Subtitle** — tagline copy from §2, `--text-2`, max-width 420px.
4. **Suggestion grid** — 2×2, four cards. Each card: glass surface, accent-cyan icon in a small `surface-2` square, title, hint, gradient-soft overlay on hover, lift on hover. Click → `sendMessage(hint)`.

**Suggestions** (kept from current with minor copy tweaks):
- *Code with me* — "Write a debounce hook in TypeScript with tests"
- *Explain a concept* — "Quantum entanglement, like I'm 12"
- *Brainstorm ideas* — "10 unusual mobile-app ideas for runners"
- *Summarize text* — "Key risks of large language models"

---

## 5. Light mode fallback

The chosen path is "dark default + clean light fallback." Implementation:

- **Theme toggle** stays in the header (already wired via `useTheme`).
- **Same component tree, different tokens.** Light mode swaps the CSS-variable values via `.dark` class absence. No conditional component logic.
- **Dropped in light mode**: backdrop orbs (replaced with a single soft radial gradient in the page background — much subtler), backdrop-blur-driven glass effects (replaced with solid `--bg-elev` + 1px `--border-1`), glow shadows (replaced with lift shadows).
- **Kept consistent across modes**: gradient logo, gradient-text headings, gradient user bubbles, gradient send button. The brand stays vibrant.
- **Code blocks** keep their dark surface in both themes for readability.

---

## 6. Architecture

### 6.1 Backdrop layer

A single fixed `<div>` in `App.jsx` (or appended to body via a portal) sits at `z-index: 0` behind everything else. Contains two absolutely-positioned blurred gradient orbs. Driven by CSS keyframes — no JS, no React state. `pointer-events: none`.

`#root` and the chat shell sit on top with their own background layers (semi-transparent in dark, opaque in light).

### 6.2 Theme system

- Already class-based (`darkMode: 'class'` in tailwind config), already wired through `useTheme`. Convention: light tokens on `:root`, dark tokens on `html.dark`. The toggle adds/removes the `dark` class on `<html>` (existing behavior in `ThemeContext`).
- **Default theme is now dark** when no preference is stored. The current `getInitialTheme()` falls back to `prefers-color-scheme`; we change the fallback branch to `'dark'` so first-time visitors land in the brand's hero state. Stored preference still wins, so an existing user who chose light keeps light.
- Tailwind classes resolve to `var(...)` references, so component code references tokens — never hardcoded colors. This avoids per-component `dark:` class duplication for color values (we still use `dark:` for non-color overrides where useful).

### 6.3 File layout

| File | Change |
|---|---|
| `tailwind.config.js` | Major rewrite of colors / shadows / radii / animations |
| `src/index.css` | Replace token block + add new component classes (`btn-gradient`, `card-glass`, `chip`) |
| `src/styles/markdown.css` | Token references only |
| `src/components/*.jsx` | Per-component edits per §4 |
| `src/utils/constants.js` | Update default `APP_NAME` to "Lumen"; update `STORAGE_KEYS` if we add a `user.email` slot |
| `src/hooks/useTheme.js` | No change |
| `index.html` | Update `<title>` to "Lumen — AI Chat", `<meta name="theme-color">` from `#1f44f5` to `#07060c` (dark base), `<meta name="description">` to match |
| `vite.config.js` | No change |
| `backend/*` | No change for the redesign itself; deploy-related additions in §7 |

### 6.4 Token-streaming reveal

Implementation in `MessageBubble.jsx` for assistant messages only:
- During streaming, content is split: the stable prefix (already-rendered) is plain text; the most recent N-character chunk is wrapped in `<span class="token-reveal">` which has the fade-in animation.
- On each new token arrival, the previous chunk's class is removed (so it stays opaque) and the new chunk gets the fade.
- On stream completion, all wrappers are flattened to plain text.

This avoids creating one `<span>` per token (DOM bloat over a long answer).

---

## 7. Deployment

### 7.1 Frontend → Vercel

- Existing `vercel.json` already configures Vite + SPA fallback. Keep as-is.
- Set Vercel project env: `VITE_API_BASE_URL=https://<backend-render-url>/api`.
- Connect GitHub repo; Vercel auto-deploys on push.

### 7.2 Backend → Render

- Create a new Render Web Service from the same GitHub repo, root path `backend/`.
- Build command: `npm install`. Start command: `npm start`. Node version: 20+.
- Env vars: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY` (set whichever you'll use), `JWT_SECRET` (generate fresh), `CORS_ORIGIN=https://<frontend-vercel-url>`, `RATE_LIMIT_PER_MIN=60`. Do **not** set `LLAMA_BASE_URL` — local Ollama doesn't apply in production.
- Render free tier spins down on inactivity (~15min idle wakes ~30s). For a personal demo this is fine; upgrade to Starter ($7/mo) if cold starts are unacceptable.
- Streaming: Render supports SSE on the free tier. The Express SSE endpoint already flushes per-token; verify after deploy by tailing logs.

### 7.3 CORS / health

- `backend/server.js` already reads `CORS_ORIGIN` and configures `cors()` accordingly. Confirm it accepts the production URL.
- Add a `GET /api/health` endpoint that returns provider availability (which env keys are set, ollama reachable). The header's "online" dot reads this on app load.

### 7.4 Local-llama in production

Out of scope for v1. Local Ollama only works when the backend is on the user's machine. Documented in README.

### 7.5 First deploy checklist

A short, dated section to add to README.md so the deploy is reproducible: env vars, GitHub connections, expected deploy duration, smoke-test commands (curl for health, curl for non-streaming chat).

---

## 8. Migration plan

To minimize risk, the redesign ships in stages on a feature branch (`redesign/glass-dark`), each commit independently runnable:

1. **Tokens & Tailwind config** — write the new tokens, swap Tailwind palette, leave components on legacy classes (UI looks weird transiently — that's OK, this is a checkpoint).
2. **Global surfaces** — `App`, `ChatPage`, `Header`, `Sidebar`, `ChatInput` background/border/glass treatments.
3. **Bubbles + code blocks** — `MessageBubble`, `CodeBlock`, inline code.
4. **History grouping + timestamps** — `ChatHistory.jsx`, `Sidebar.jsx`.
5. **Empty-state hero** — `EmptyState` rebuild + animations.
6. **Streaming token reveal** — wrapper logic in `MessageBubble`.
7. **Light-mode pass** — verify each surface in light mode; add any missing token mappings.
8. **Deploy infra** — Render setup, README updates, env var documentation.

Each step has an obvious manual verification (open the app, check the surface). Tests aren't being added for visual changes; verification is by interaction in the browser, especially:
- Empty state: hero animations play, suggestions clickable.
- Active chat: streaming feels smooth, code block readable, copy works.
- Long conversation: scrollbar appears (regression check on the earlier `min-h-0` fix).
- Light mode: no leaking dark colors, gradients still vibrant.
- Mobile: sidebar slide-in works, header doesn't break, input isn't crowded.

---

## 9. Open items / future

- **Custom font hosting** — Inter and JetBrains Mono are loaded from `fonts.googleapis.com` (verified in `index.html`). For production, self-host the woff2 to avoid the third-party dependency, faster initial paint, and works offline.
- **Color contrast audit** — pass WCAG AA on `--text-2` over `--surface-1` once the real values are in. Tweak `--text-2` if needed.
- **Branding details** — favicon and a real product mark beyond the placeholder gradient sparkle. Out of scope for this spec but worth a follow-up.
- **Performance** — backdrop-blur is GPU-heavy. If frame drops show up on lower-end machines, fall back to flat surfaces in dark mode (lose the glass, keep the dark + gradient).
- **Auth UX** — the existing JWT-token-paste-into-Settings flow is fine for v1 but feels dated. A real signup/login flow is a separate project.

---

## 10. Acceptance criteria

The redesign is "done" when:

- [ ] All surfaces (sidebar, header, chat list, input, modal) use the new token system; no leftover `brand-*` classes.
- [ ] Empty state: hero glyph pulses, gradient text on app name, four suggestion cards lift and tint on hover.
- [ ] Streaming: tokens fade in smoothly on local Llama (the worst case for slow streaming visibility).
- [ ] Sidebar: threads are grouped into Today / Yesterday / Last 7 days / Older with relative timestamps.
- [ ] Light mode: clean (no glass effects, no glow shadows, no orb backdrop), brand gradient still consistent.
- [ ] Frontend deployed to Vercel, backend deployed to Render, both reachable; cloud chat works end-to-end with at least one provider key set.
- [ ] README has a deploy section with the exact env vars to set on each platform.
- [ ] No regressions: scrollbar appears on long answers (dark + light), input never gets pushed offscreen, "Jump to latest" still works.
