#!/usr/bin/env bash
# Launch Backend and Frontend in separate macOS Terminal windows/tabs

# Resolve absolute paths so it works no matter where you run the script from
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_PATH="${PROJECT_ROOT}/backend"
FRONTEND_PATH="${PROJECT_ROOT}/frontend"

if [[ "$OSTYPE" == "darwin"* ]]; then
  # Open in macOS Terminal (built-in)
  # Each osascript line opens a new tab/window and runs the command
  osascript -e 'tell application "Terminal" to do script "cd \"'"$BACKEND_PATH"'\" && node index.js"' >/dev/null
  osascript -e 'tell application "Terminal" to do script "cd \"'"$FRONTEND_PATH"'\" && npm start"' >/dev/null
else
  echo "This script is intended for macOS."
  exit 1
fi

echo "Launched Backend and Frontend in separate Terminal sessions."
read -rp "Press Enter to exit this launcher..."
