#!/bin/bash
set -euo pipefail

# Only run in Claude Code on the web (remote) sessions. Local sessions
# already have their own node_modules.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# Install JS dependencies so typecheck (`npx tsc --noEmit`) and Metro
# bundling work during the session. `npm install` (not `ci`) is used so the
# cached container state can be reused across sessions, and it is idempotent.
npm install --no-audit --no-fund
