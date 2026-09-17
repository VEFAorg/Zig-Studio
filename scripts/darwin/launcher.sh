#!/bin/bash
# Zig Studio macOS Application Bundle Entrypoint
DIR="$(cd "$(dirname "$0")/../Resources" && pwd)"
cd "$DIR"

# Launch ZLS bridge in background if node is available
if command -v node >/dev/null 2>&1; then
    nohup node zls_bridge.js >/dev/null 2>&1 &
fi

# Open index.html in default browser without terminal window
open "index.html"
