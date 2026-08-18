# Tic Tac Toe — Angular Tournament Challenge

A two-player, best-of-N Tic Tac Toe tournament app built with **Angular 20**, **RxJS**, and
**Reactive Forms (FormBuilder)**, created for a take-home coding challenge.

Play a best-of-1/3/5 series between two named players, with live score tracking,
per-game win/draw detection, alternating first-move rotation, and a final tournament
results screen.

---

## Requirements

- **Node.js** 20.19+ or 22.12+ (Angular 20 requirement)
- **npm** 10+

Check your versions:

```bash
node -v
npm -v
```

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Run the dev server
npm start
```

Then open **http://localhost:4200** in your browser.

## Available scripts

| Command         | What it does                                                        |
|-----------------|-----------------------------------------------------------------------|
| `npm start`     | Runs the app locally with live reload (`ng serve`)                  |
| `npm run build` | Produces an optimized production build in `dist/tic-tac-toe`        |
| `npm test`      | Runs the unit test suite with Karma/Jasmine (needs a local Chromium)|
| `npm run watch` | Rebuilds on file changes without serving (dev config)                |

> **Note on `npm test`:** the suite runs against **Chrome Headless** via Karma. If you don't
> have Chrome/Chromium installed locally, either install it or point
> `CHROME_BIN` at your browser of choice, e.g.:
> ```bash
> CHROME_BIN=$(which chromium) npm test
> ```
> The test *code* itself doesn't depend on a browser — the logic in
> `board-evaluator.spec.ts` and `tournament-store.spec.ts` is plain
> TypeScript/RxJS — it's only Karma's runner that needs one.

## Project structure

```
src/app/
├── models/
│   └── game.models.ts          # Shared types: Board, Player, Scoreboard, etc.
├── services/
│   ├── board-evaluator.ts      # Pure win/draw detection functions (+ spec)
│   └── tournament-store.ts     # RxJS state store — single source of truth (+ spec)
├── components/
│   ├── player-setup/           # FormBuilder-driven setup screen
│   ├── game-board/             # Active game screen (board + round banner)
│   ├── game-cell/              # One reusable board cell
│   ├── scoreboard/             # Persistent score/turn display
│   └── tournament-results/     # Final results + "Play Again"
├── app.ts / app.html / app.css # Root component — switches screens by phase
└── app.config.ts               # Angular application providers
```

See **DOCUMENTATION.md** for the architecture write-up, the RxJS/reactive-forms usage,
and a requirements checklist mapping each brief item to where it's implemented.

## Building for production

```bash
npm run build
```

Output goes to `dist/tic-tac-toe/`. Serve it with any static file server, e.g.:

```bash
npx http-server dist/tic-tac-toe/browser
```
