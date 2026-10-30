# Local development shortcuts. Run `just --list` to see them.

# Start the dev server (editable source) and open it in a browser; optionally a program, e.g. `just show bal`.
show program="":
    #!/usr/bin/env bash
    set -euo pipefail
    cd app
    [ -d node_modules ] || npm ci
    # A free port, so another worktree's dev server can keep running.
    port=$(node -e "const s=require('net').createServer().listen(0,'127.0.0.1',()=>{console.log(s.address().port);s.close()})")
    url="http://127.0.0.1:${port}/"
    [ -n "{{program}}" ] && url="${url}#/program/{{program}}"
    npx vite --config config/vite.config.js --host 127.0.0.1 --port "$port" --strictPort &
    server=$!
    trap 'kill $server 2>/dev/null' EXIT INT TERM
    until curl -sf -o /dev/null "http://127.0.0.1:${port}/"; do sleep 0.3; done
    echo "Opening $url (Ctrl+C stops the server)"
    if grep -qi microsoft /proc/version 2>/dev/null; then
      powershell.exe -NoProfile -Command "Start-Process '$url'" >/dev/null
    elif command -v xdg-open >/dev/null; then xdg-open "$url" >/dev/null 2>&1
    elif command -v open >/dev/null; then open "$url"
    fi
    wait $server
