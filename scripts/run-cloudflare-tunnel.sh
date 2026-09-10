#!/usr/bin/env bash
# Run the locally-managed Cloudflare Tunnel against http://localhost:8000.
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
config="${TUNNEL_CONFIG:-$root_dir/cloudflared/config.yml}"

if ! command -v cloudflared >/dev/null 2>&1; then
  echo "cloudflared is not installed. See TUNNEL.md." >&2
  exit 1
fi

if [[ ! -f "$config" ]]; then
  echo "Missing $config. Copy cloudflared/config.yml and replace <Tunnel-UUID>." >&2
  exit 1
fi

if grep -q '<Tunnel-UUID>' "$config"; then
  echo "Replace <Tunnel-UUID> in $config (or run scripts/write-tunnel-config.sh)." >&2
  exit 1
fi

credentials_file="$(awk -F': *' '/^credentials-file:/{print $2; exit}' "$config")"
if [[ -n "$credentials_file" && ! -f "$credentials_file" ]]; then
  echo "Credentials file not found: $credentials_file" >&2
  echo "Run \`cloudflared tunnel create\` and point credentials-file at the generated JSON." >&2
  exit 1
fi

exec cloudflared tunnel --config "$config" run
