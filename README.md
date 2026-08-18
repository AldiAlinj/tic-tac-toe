# Tic Tac Toe — Angular Tournament Challenge

A two-player, best-of-N Tic Tac Toe tournament app built with **Angular 20**, **RxJS**, and
**Reactive Forms (FormBuilder)**.

Play a best-of-1/3/5 series between two named players with live score tracking,
per-game win/draw detection, alternating first-move rotation, and a final results screen.

---

## Requirements

- **Node.js** 20.19+ or 22.12+
- **npm** 10+

## Getting started

```bash
npm install
npm start
```

Then open **http://localhost:4200** in your browser.

## Scripts

| Command         | What it does                                                         |
|-----------------|----------------------------------------------------------------------|
| `npm start`     | Dev server with live reload                                          |
| `npm run build` | Optimized production build → `dist/tic-tac-toe`                     |
| `npm test`      | Unit tests via Karma/Jasmine (requires a local Chrome/Chromium)      |
| `npm run watch` | Rebuilds on file changes without serving                             |

> **Note on `npm test`:** Karma runs against Chrome Headless. If Chrome is not on your PATH, set `CHROME_BIN`:
> ```bash
> CHROME_BIN=$(which chromium) npm test
> ```

## Architecture

The app moves through three phases managed entirely by `TournamentStore`:

```text
setup -> playing -> tournament-complete
  ^                        |
  +------- Play Again -----+
```

`TournamentStore` holds all state in a single private `BehaviorSubject` and exposes
read-only RxJS selectors. Components only read observables and call store methods —
no gameplay state lives in components. All components use `OnPush` change detection
and consume store slices with the `async` pipe.

## Project structure

```
src/app/
├── models/
│   └── game.models.ts          # Board, Player, Scoreboard, GameResult types + WINNING_LINES
├── services/
│   ├── board-evaluator.ts      # Pure checkWinner / isDraw / createEmptyBoard (+ spec)
│   └── tournament-store.ts     # RxJS BehaviorSubject store — single source of truth (+ spec)
├── components/
│   ├── player-setup/           # FormBuilder setup: names, mark choice, best-of
│   ├── game-board/             # Active game screen: grid + round-end banner
│   ├── game-cell/              # Single cell — presentational (Input/Output only)
│   ├── scoreboard/             # Persistent score, turn indicator, game progress
│   └── tournament-results/     # Final winner, score breakdown, Play Again
├── app.ts / app.html / app.css # Root — switches between the three phases
└── app.config.ts               # Angular providers
```

## Setup rules

- Both names are required, max 20 characters, and must differ (case-insensitive, trimmed).
- Player 1 chooses `X` or `O`; Player 2 automatically receives the opposite mark.
- Tournament length is best of 1, 3, or 5 games.
- Submitting an invalid form marks all fields as touched so errors are shown immediately.

## Game rules

The board is a flat array of nine cells indexed 0–8. A move is ignored when the game is
not in progress, the cell is occupied, or players haven't been set up.

After each valid move the store checks for a win then a draw. A finished game is recorded
and scores are updated. The next game starts with the other player on a fresh board.

A player wins the tournament after reaching `Math.floor(bestOf / 2) + 1` wins. If no
majority is reached after all games, the player with more wins is the winner; equal
scores produce an overall draw.
