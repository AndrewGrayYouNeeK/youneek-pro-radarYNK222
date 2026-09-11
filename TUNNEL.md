# Cloudflare Tunnel

Share a running copy of YouNeeK Pro Radar without creating a UUID, logging in, or opening a second terminal.

```bash
npm install
npm run tunnel
```

That command:

1. Starts the app on **`http://localhost:8000`**
2. Downloads the official `cloudflared` binary if it is missing
3. Opens a [Quick Tunnel](https://developers.cloudflare.com/tunnel/setup/#quick-tunnels-development)
4. Prints a public `https://*.trycloudflare.com` URL

Leave it running. Ctrl+C stops the tunnel. The URL is also written to `.tunnel-url` (gitignored).

Production stays on Workers (`npm run deploy`). Quick tunnels are for development and sharing; they use a random hostname each time.

## Optional named tunnel

Only if you already have a remotely-managed tunnel token:

```bash
export TUNNEL_TOKEN='...'
npm run tunnel
```

Or fill in `cloudflared/config.yml` after `cloudflared tunnel create` and keep the credentials JSON on disk:

```yml
url: http://localhost:8000
tunnel: <Tunnel-UUID>
credentials-file: /root/.cloudflared/<Tunnel-UUID>.json
```

`npm run tunnel` uses that named config when the UUID is filled in and the credentials file exists. Otherwise it keeps using a Quick Tunnel.

## Troubleshooting

| Symptom | What to check |
|---------|----------------|
| No public URL printed | Wait a few seconds; `cloudflared` has to connect to Cloudflare |
| Origin DNS Error 1016 | The Node process exited — rerun `npm run tunnel` |
| Port 8000 already in use | The script reuses that origin; stop the other process if it is not this app |
