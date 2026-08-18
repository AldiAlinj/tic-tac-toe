export type Mark = 'X' | 'O';

/** A single cell on the board is either empty or holds a mark. */
export type CellValue = Mark | null;

/** The board is always a flat array of 9 cells, indexed 0-8:
 *   0 | 1 | 2
 *   3 | 4 | 5
 *   6 | 7 | 8
 */
export type Board = CellValue[];

export type BestOf = 1 | 3 | 5;

export type PlayerId = 'player1' | 'player2';

export interface Player {
  id: PlayerId;
  name: string;
  mark: Mark;
}

export type GameOutcome = 'player1' | 'player2' | 'draw';

export interface GameResult {
  gameNumber: number;
  outcome: GameOutcome;
  winningLine: number[] | null;
  board: Board;
}

export type GameStatus = 'in-progress' | 'won' | 'draw';

export interface Scoreboard {
  player1Wins: number;
  player2Wins: number;
  draws: number;
}

/** The 8 possible winning lines on a 3x3 board, as cell indices. */
export const WINNING_LINES: readonly number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export type AppPhase = 'setup' | 'playing' | 'tournament-complete';
