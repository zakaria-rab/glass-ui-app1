#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

# glass-ui-app1 runs on 3001; the shell (glass-ui-framework) owns 3000.
exec pnpm dev
