#!/usr/bin/env bash
# Start the backend (Express on :8080) and the frontend (Vite on :5173)
# concurrently. Ctrl+C stops both.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

if [ ! -d node_modules ]; then
  echo "[setup] Installing frontend dependencies..."
  npm install
fi
if [ ! -d backend/node_modules ]; then
  echo "[setup] Installing backend dependencies..."
  (cd backend && npm install)
fi
if [ ! -f backend/.env ]; then
  echo "[setup] Creating backend/.env from .env.example..."
  cp backend/.env.example backend/.env
  echo "        → add your API key(s) (OPENAI_API_KEY etc.) to backend/.env, then re-run."
fi
if [ ! -f .env ]; then
  cp .env.example .env
fi

trap 'echo; echo "[shutdown] stopping..."; kill 0 2>/dev/null || true; wait 2>/dev/null; exit 0' INT TERM

(cd backend && npm run dev) &
BACK_PID=$!
sleep 1
(cd "$ROOT" && npm run dev) &
FRONT_PID=$!

echo
echo "  Frontend  → http://localhost:3000"
echo "  Backend   → http://localhost:8080/api/health"
echo "  (Ctrl+C to stop both)"
echo

wait $BACK_PID $FRONT_PID
