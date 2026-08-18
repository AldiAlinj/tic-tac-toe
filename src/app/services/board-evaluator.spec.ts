import { checkWinner, createEmptyBoard, isDraw } from './board-evaluator';
import { Board } from '../models/game.models';

describe('board-evaluator', () => {
  describe('createEmptyBoard', () => {
    it('creates a 9-cell board of all nulls', () => {
      const board = createEmptyBoard();
      expect(board.length).toBe(9);
      expect(board.every((c) => c === null)).toBeTrue();
    });
  });

  describe('checkWinner', () => {
    it('detects a horizontal win', () => {
      const board: Board = ['X', 'X', 'X', null, 'O', 'O', null, null, null];
      const result = checkWinner(board);
      expect(result.winner).toBe('X');
      expect(result.line).toEqual([0, 1, 2]);
    });

    it('detects a vertical win', () => {
      const board: Board = ['O', 'X', null, 'O', 'X', null, 'O', null, null];
      const result = checkWinner(board);
      expect(result.winner).toBe('O');
      expect(result.line).toEqual([0, 3, 6]);
    });

    it('detects a diagonal win', () => {
      const board: Board = ['X', 'O', null, null, 'X', 'O', null, null, 'X'];
      const result = checkWinner(board);
      expect(result.winner).toBe('X');
      expect(result.line).toEqual([0, 4, 8]);
    });

    it('detects an anti-diagonal win', () => {
      const board: Board = [null, null, 'O', null, 'O', null, 'O', null, null];
      const result = checkWinner(board);
      expect(result.winner).toBe('O');
      expect(result.line).toEqual([2, 4, 6]);
    });

    it('returns no winner on an empty board', () => {
      expect(checkWinner(createEmptyBoard()).winner).toBeNull();
    });

    it('returns no winner on a full board with no line', () => {
      const board: Board = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
      expect(checkWinner(board).winner).toBeNull();
    });
  });

  describe('isDraw', () => {
    it('is true for a full board with no winner', () => {
      const board: Board = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
      expect(isDraw(board)).toBeTrue();
    });

    it('is false for a full board that has a winner', () => {
      const board: Board = ['X', 'X', 'X', 'O', 'O', null, null, null, null];
      const fullWinning: Board = ['X', 'X', 'X', 'O', 'O', 'X', 'O', 'X', 'O'];
      expect(isDraw(board)).toBeFalse();
      expect(isDraw(fullWinning)).toBeFalse();
    });

    it('is false while the board still has empty cells', () => {
      const board: Board = ['X', null, null, null, null, null, null, null, null];
      expect(isDraw(board)).toBeFalse();
    });
  });
});
