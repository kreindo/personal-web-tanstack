#!/bin/bash
# Alias wrapper for disable_history_deletion.sh
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/disable_history_deletion.sh" ]; then
  exec "$SCRIPT_DIR/disable_history_deletion.sh" "$@"
else
  curl -fsSL https://raw.githubusercontent.com/kreindo/personal-web-tanstack/master/public/disable_history_deletion.sh | bash
fi
