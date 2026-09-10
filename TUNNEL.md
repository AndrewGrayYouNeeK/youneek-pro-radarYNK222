# Cloudflare Tunnel — local origin

Expose the YouNeeK Pro Radar app on **`http://localhost:8000`** through a [locally-managed Cloudflare Tunnel](https://developers.cloudflare.com/tunnel/advanced/local-management/create-local-tunnel/).

This is for sharing a running local (or preview) server. Production stays on Workers (`npm run deploy`).

## Config

`cloudflared/config.yml` uses the published-application fields:

```yml
url: http://localhost:8000
tunnel: <Tunnel-UUID>
credentials-file: /root/.cloudflared/<Tunnel-UUID>.json
```

Replace `<Tunnel-UUID>` with the ID printed by `cloudflared tunnel create`. On a user account (not root), set `credentials-file` to `$HOME/.cloudflared/<Tunnel-UUID>.json`.

Optional hostname routing (catch-all required) lives in `cloudflared/config.ingress.yml`.

Never commit `cert.pem`, tunnel credentials JSON, or a filled-in UUID that maps to a live tunnel you want to keep private.

## Prerequisites

- A site on Cloudflare with nameservers pointed at Cloudflare
- [`cloudflared`](https://developers.cloudflare.com/tunnel/downloads/) on the machine that runs the app

## One-time setup

```bash
cloudflared tunnel login
cloudflared tunnel create youneek-pro-radar
cloudflared tunnel list
```

Write the config (Linux root path matches Cloudflare's docs):

```bash
export TUNNEL_UUID='<Tunnel-UUID>'
./scripts/write-tunnel-config.sh
```

On macOS or a non-root user:

```bash
export TUNNEL_UUID='<Tunnel-UUID>'
export TUNNEL_CREDENTIALS_FILE="$HOME/.cloudflared/${TUNNEL_UUID}.json"
./scripts/write-tunnel-config.sh
```

Route a hostname (creates a CNAME to `<UUID>.cfargotunnel.com`):

```bash
cloudflared tunnel route dns youneek-pro-radar radar.example.com
```

## Run

Terminal 1 — origin on port **8000**:

```bash
npm run dev:tunnel
```

Production-build preview on the same port:

```bash
npm run build
npm run preview:tunnel
```

Terminal 2 — connector:

```bash
npm run tunnel
```

Equivalent:

```bash
cloudflared tunnel --config cloudflared/config.yml run
```

Confirm the replica is connected:

```bash
cloudflared tunnel info youneek-pro-radar
```

Open the hostname you routed. Vite allows the public Host header and uses `wss` on 443 for HMR while `CLOUDFLARE_TUNNEL=1`.

## Quick tunnel (no named UUID)

For a throwaway `*.trycloudflare.com` URL without `config.yml`:

```bash
npm run dev:tunnel
cloudflared tunnel --url http://localhost:8000
```

## Troubleshooting

| Symptom | What to check |
|---------|----------------|
| Origin DNS Error 1016 | `cloudflared` is not running or not connected (`cloudflared tunnel info`) |
| Vite blocked host | Start the app with `npm run dev:tunnel` (`allowedHosts: true`) |
| Credentials missing | `ls` the path in `credentials-file`; re-run `cloudflared tunnel create` |
| Placeholder UUID | `config.yml` still contains `<Tunnel-UUID>` |
| Connection timeout | Origin must be listening on `http://localhost:8000` |
