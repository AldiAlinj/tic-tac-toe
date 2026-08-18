# Documentation

## Overview

This is a single-page Angular 20 application using standalone components, RxJS, and
typed reactive forms. The app has three phases:

```text
setup -> playing -> tournament-complete
  ^                         |
  +------ Play Again -------+
```

`TournamentStore` owns the application state. Components read its observables and call
its methods; gameplay state is not stored in components.

## Main Files

- `src/app/services/tournament-store.ts` holds the tournament state in one private
  `BehaviorSubject` and exposes read-only selectors. It handles setup, moves, scores,
  game changes, and reset.
- `src/app/services/board-evaluator.ts` contains the pure `checkWinner`, `isDraw`, and
  `createEmptyBoard` functions.
- `src/app/models/game.models.ts` defines the board, player, score, result, and phase
  types, plus the eight winning lines.
- `src/app/components/player-setup` collects player names, the first player's mark,
  and the best-of choice.
- `src/app/components/game-board` displays the active game and uses `game-cell` for
  each square.
- `src/app/components/scoreboard` displays the current game, turn, and score.
- `src/app/components/tournament-results` displays the final winner, score, and game
  history.

All components use `OnPush` change detection and consume store data with the `async`
pipe. `combineLatest` creates view models when a screen needs multiple state slices.

## Setup Rules

- Both names are required, limited to 20 characters, and must differ after trimming and
  ignoring case.
- Player 1 chooses `X` or `O`; Player 2 automatically receives the opposite mark.
- The tournament length is best of 1, 3, or 5 games.
- Invalid forms are not submitted. Attempting to submit marks all fields as touched so
  validation messages appear.

## Game Rules

The board is a flat array of nine cells indexed from 0 to 8. A move is ignored when the
game is not active, the cell is occupied, or players have not been set up.

After each valid move, the store checks for a win and then a draw. A completed game is
added to the results and its score is updated. The next game starts with the other
player and a fresh board.

A player wins the tournament after reaching `Math.floor(bestOf / 2) + 1` wins. If all
selected games are played without a majority, the player with more wins is the winner;
tied scores produce an overall draw.

## Testing

Run the development server with:

```bash
npm start
```

Run the unit tests with:

```bash
npm test
```

Run the production build with:

```bash
npm run build
```

Tests cover board evaluation, mark assignment, turn changes, invalid moves, draws,
starting-player rotation, tournament completion, reset behavior, and the root screen.
