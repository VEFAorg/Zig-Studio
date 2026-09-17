#!/bin/sh
# Zig Studio Linux Executable Entrypoint
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

# Check if config exists or if setup was requested
if [ "$1" = "--setup" ] || [ ! -f "zig-studio.json" ]; then
    TARGET="setup.html"
else
    TARGET="index.html"
fi

# Launch ZLS bridge in background if node is available
if command -v node >/dev/null 2>&1; then
    nohup node zls_bridge.js >/dev/null 2>&1 &
fi

# Open in default browser / desktop environment without terminal dependency
if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$TARGET" >/dev/null 2>&1 &
elif command -v gio >/dev/null 2>&1; then
    gio open "$TARGET" >/dev/null 2>&1 &
else
    echo "Zig Studio initialized. Open $DIR/$TARGET in your web browser."
fi
