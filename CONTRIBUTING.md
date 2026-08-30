# Contributing to STILLSTANCE

Thanks for your interest! STILLSTANCE is deliberately small. The best contributions keep it that way.

## Scope guardrail

The app does **one thing**: pace stretch holds with a repeating countdown cycle. Pull requests adding exercise libraries, workout plans, accounts, cloud sync, analytics, or social features will be declined kindly — they are out of scope by design, not by oversight.

Good contribution areas: timer accuracy, accessibility, PWA/wake-lock behavior on real devices, performance, documentation, translations of docs.

## Development setup

Requirements: Node.js >= 22, npm.

```bash
git clone <your-fork-url>
cd stillstance
npm ci
npm run dev
```

## Commands

| Command              | Purpose                            |
| -------------------- | ---------------------------------- |
| `npm run dev`        | Development server                 |
| `npm test`           | Run the test suite once            |
| `npm run test:watch` | Tests in watch mode                |
| `npm run lint`       | ESLint                             |
| `npm run typecheck`  | TypeScript project check           |
| `npm run build`      | Production build (also typechecks) |
| `npm run preview`    | Serve the production build locally |

## Expectations for pull requests

- Tests pass; new timer/state logic comes with unit tests.
- `npm run lint` and `npm run typecheck` are clean.
- **No new runtime dependencies without strong justification.** The complete runtime dependency list is `react`, `react-dom`, and `@fontsource-variable/inter`. Do not add a library for something a few lines of code can do.
- **No external network requests, ever.** Fonts, icons, and all assets are bundled. This is a verifiable privacy guarantee — see the README.
- Keep the UI minimal and monochrome-first; the timer is always the visual hero.

## Architecture in 30 seconds

- `src/features/timer/engine.ts` — pure timestamp math (`accumulatedMs` + `runningSince`). Never count ticks.
- `src/features/timer/machine.ts` — reducer state machine (`idle → getReady → holding ⇄ transitioning`, plus `paused`/`finished`). Invalid events are ignored by design.
- Hooks (`useSession`, `useElapsedSeconds`, `useWakeLock`) bridge the pure logic to React.
- Screens render purely from machine state; there is no router.

Timer correctness is the core product — when in doubt, add a test.
