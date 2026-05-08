#!/usr/bin/env bash
# One-shot deploy script for the AI Chatbot frontend.
# Usage:  ./deploy.sh           # production deploy
#         ./deploy.sh preview   # preview deploy
set -euo pipefail

cd "$(dirname "$0")"

if ! command -v node >/dev/null; then
  echo "Node.js is required (https://nodejs.org)"; exit 1
fi

if ! command -v vercel >/dev/null; then
  echo "Installing Vercel CLI globally..."
  npm install -g vercel
fi

echo "Installing dependencies..."
npm install

echo "Building production bundle..."
npm run build

MODE="${1:-prod}"
if [[ "$MODE" == "preview" ]]; then
  echo "Deploying preview to Vercel..."
  vercel deploy --yes
else
  echo "Deploying to Vercel production..."
  vercel deploy --prod --yes
fi
