<div align="center">

# STILLSTANCE

**Time in position.**

A beautiful, privacy-first rhythm timer for stretch holds.

</div>

---

STILLSTANCE gives your stretching a rhythm: a short countdown to get into position, a timed **hold**, a timed **transition** into the next position — repeating until you stop. No exercises, no plans, no accounts. One purpose, zero distractions.

## Screenshots

<!-- Repo-hosted screenshots (docs/screenshots/), regenerate with scripts/screenshots.mjs -->
<p align="center">
  <img src="docs/screenshots/idle.png" width="160" alt="Home screen" />
  <img src="docs/screenshots/get-ready.png" width="160" alt="Get ready countdown" />
  <img src="docs/screenshots/hold.png" width="160" alt="Hold countdown" />
  <img src="docs/screenshots/next-position.png" width="160" alt="Next position transition" />
  <img src="docs/screenshots/finished.png" width="160" alt="Finished screen with total time in position" />
</p>

## Features

- **Repeating hold cycle** — GET READY → HOLD → NEXT POSITION → HOLD → … until you stop
- **Configurable rhythm** — hold duration (15–120 s) and transition time (0–30 s)
- **Accurate timing** — timestamp-derived countdowns, immune to tab throttling and backgrounding
- **Pause / resume** — continues with the exact remaining time
- **Screen Wake Lock** — the display stays on while you hold (where supported)
- **Optional feedback** — vibration and generated sounds on every phase change
- **Offline-first installable PWA** — works with no connection at all
- **Zero tracking, zero external requests, no account, no backend**
- **Self-hostable** — one `docker compose up -d` away

## Privacy

STILLSTANCE is private by architecture, not by policy:

- **No accounts, no analytics, no telemetry, no cookies, no fingerprinting.**
- **Zero external requests.** Fonts (Inter, bundled via Fontsource, [OFL-1.1](https://github.com/rsms/inter/blob/master/LICENSE.txt)), icons, and every other asset ship with the app. Nothing is loaded from Google, any CDN, or any third party.
- **Local-only data.** The only thing stored anywhere is your settings, in your browser's `localStorage`.
- **Verifiable.** Open DevTools → Network: after loading, every request targets the app's own origin. The codebase is small enough to audit in an afternoon.

## Quick start (development)

Requires Node.js >= 22.

```bash
git clone https://github.com/nicolasduernbeck/stillstance.git
cd stillstance
npm ci
npm run dev
```

## Self-hosting with Docker

```bash
docker compose up -d
```

The app is then available at `http://localhost:8080`. Set `PORT` to change the host port:

```bash
PORT=3000 docker compose up -d
```

The image is a multi-stage build: Node builds the static bundle, then an **unprivileged nginx (alpine)** serves it with strict security headers (CSP, `nosniff`, `Referrer-Policy`, `Permissions-Policy`). Multi-arch base images — runs on a VPS, home server, or Raspberry Pi.

### HTTPS / reverse proxy

The container serves plain HTTP and does **not** handle TLS. Terminate HTTPS at your reverse proxy (Caddy, Traefik, Nginx Proxy Manager):

```text
Internet → Reverse proxy (HTTPS) → stillstance container (HTTP :8080) → static PWA
```

Example Caddyfile:

```caddy
stretch.example.com {
    reverse_proxy localhost:8080
}
```

> **Note:** PWA installation and the Screen Wake Lock API require a secure context — use HTTPS (or `localhost`) for full functionality.

## Architecture

- **Timer engine** ([src/features/timer/engine.ts](src/features/timer/engine.ts)) — elapsed time is always `accumulatedMs + (now − runningSince)`, computed from `Date.now()` timestamps. No tick counting, so rendering delays, browser throttling, and backgrounding cannot corrupt the time. Negative clock jumps are clamped.
- **State machine** ([src/features/timer/machine.ts](src/features/timer/machine.ts)) — a hand-rolled reducer: `idle → getReady → holding ⇄ transitioning`, plus `paused` and `finished`. Phase handoffs are anchored gap-free at the exact deadline, and invalid events are ignored, which eliminates double-tap races by construction.
- **Wake Lock** ([src/features/wake-lock/useWakeLock.ts](src/features/wake-lock/useWakeLock.ts)) — acquired during a session, re-acquired after visibility changes, silently absent on unsupported browsers.
- **Settings** — a single versioned `localStorage` key with per-field fallback parsing.
- **PWA** — `vite-plugin-pwa` precaches the entire build (~220 KB); the app is fully functional offline after the first visit.

Stack: Vite · React · TypeScript · Tailwind CSS. Runtime dependencies: `react`, `react-dom`, `@fontsource-variable/inter` — that's the complete list.

## Development

| Command             | Purpose                         |
| ------------------- | ------------------------------- |
| `npm run dev`       | Development server              |
| `npm test`          | Unit + component tests (Vitest) |
| `npm run lint`      | ESLint                          |
| `npm run typecheck` | TypeScript check                |
| `npm run build`     | Production build                |
| `npm run preview`   | Serve the production build      |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) — including the scope guardrail and the zero-dependency policy.

## Security

See [SECURITY.md](SECURITY.md) for how to report vulnerabilities.

## License

[AGPL-3.0](LICENSE). You are free to use, study, modify, and self-host STILLSTANCE. If you distribute a modified version — including hosting one as a service — you must make its source available under the same license.
