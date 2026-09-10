#!/usr/bin/env bash
# One-command Cloudflare Tunnel (installs cloudflared, starts :8000, prints a public URL).
exec node "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/share-tunnel.mjs" "$@"
