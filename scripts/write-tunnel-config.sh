#!/usr/bin/env bash
# Write cloudflared/config.yml from TUNNEL_UUID (and optional credentials path).
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
out="${TUNNEL_CONFIG:-$root_dir/cloudflared/config.yml}"

if [[ -z "${TUNNEL_UUID:-}" ]]; then
  echo "Set TUNNEL_UUID to the ID from \`cloudflared tunnel create\`." >&2
  exit 1
fi

if [[ ! "$TUNNEL_UUID" =~ ^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$ ]]; then
  echo "TUNNEL_UUID must be a UUID (got: $TUNNEL_UUID)." >&2
  exit 1
fi

credentials_file="${TUNNEL_CREDENTIALS_FILE:-/root/.cloudflared/${TUNNEL_UUID}.json}"

cat > "$out" <<EOF
url: http://localhost:8000
tunnel: ${TUNNEL_UUID}
credentials-file: ${credentials_file}
EOF

echo "Wrote $out"
cat "$out"
