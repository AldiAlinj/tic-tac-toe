import { Board, CellValue, WINNING_LINES } from '../models/game.models';

/**
 * Pure functions for inspecting a board. Kept outside the store/service
 * so the win/draw logic is trivially unit-testable in isolation and has
 * no dependency on RxJS or Angular at all.
 */

export interface WinCheckResult {
  winner: CellValue;
  line: number[] | null;
}

export function checkWinner(board: Board): WinCheckResult {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  return { winner: null, line: null };
}

export function isDraw(board: Board): boolean {
  return board.every((cell) => cell !== null) && checkWinner(board).winner === null;
}

export function createEmptyBoard(): Board {
  return Array<CellValue>(9).fill(null);
}
