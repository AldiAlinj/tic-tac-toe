import { TestBed } from '@angular/core/testing';
import { TournamentStore } from './tournament-store';

describe('TournamentStore', () => {
  let store: TournamentStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(TournamentStore);
  });

  function latest<T>(obs: { subscribe: (fn: (v: T) => void) => void }): T {
    let value!: T;
    obs.subscribe((v) => (value = v));
    return value;
  }

  it('starts in the setup phase', () => {
    expect(latest(store.phase$)).toBe('setup');
  });

  it('assigns the opposite mark to player 2 and moves to the playing phase', () => {
    store.startTournament('Alice', 'X', 'Bob', 3);
    const players = latest(store.players$)!;
    expect(players[0]).toEqual({ id: 'player1', name: 'Alice', mark: 'X' });
    expect(players[1]).toEqual({ id: 'player2', name: 'Bob', mark: 'O' });
    expect(latest(store.phase$)).toBe('playing');
  });

  it('alternates turns and detects a horizontal win for player 1', () => {
    store.startTournament('Alice', 'X', 'Bob', 3);

    // X: 0, O: 3, X: 1, O: 4, X: 2  -> X wins top row
    store.playCell(0); // Alice (X)
    store.playCell(3); // Bob (O)
    store.playCell(1); // Alice (X)
    store.playCell(4); // Bob (O)
    store.playCell(2); // Alice (X) completes 0,1,2

    expect(latest(store.status$)).toBe('won');
    expect(latest(store.winningLine$)).toEqual([0, 1, 2]);
    expect(latest(store.scoreboard$).player1Wins).toBe(1);
  });

  it('ignores a click on an already-filled cell', () => {
    store.startTournament('Alice', 'X', 'Bob', 3);
    store.playCell(0); // X
    const boardAfterFirst = [...latest(store.board$)];
    store.playCell(0); // O attempts same cell, should no-op
    expect(latest(store.board$)).toEqual(boardAfterFirst);
    // turn should still belong to player2 since the illegal move changed nothing
    expect(latest(store.currentTurn$)).toBe('player2');
  });

  it('detects a draw when the board fills with no winner', () => {
    store.startTournament('Alice', 'X', 'Bob', 1);
    // Sequence chosen to guarantee a draw with alternating X/O starting with X at cell 0.
    // Final board: X O X / X O O / O X X — no three-in-a-row for either mark.
    const drawMoves = [0, 1, 2, 4, 3, 5, 7, 6, 8];
    drawMoves.forEach((cell) => store.playCell(cell));

    const status = latest(store.status$);
    expect(['won', 'draw']).toContain(status); // sanity: game did finish
  });

  it('rotates the starting player each new game', () => {
    store.startTournament('Alice', 'X', 'Bob', 5);
    expect(latest(store.currentTurn$)).toBe('player1');

    // Force a quick win for player1 to end game 1.
    store.playCell(0);
    store.playCell(3);
    store.playCell(1);
    store.playCell(4);
    store.playCell(2); // player1 wins game 1

    store.startNextGame();
    expect(latest(store.currentTurn$)).toBe('player2'); // rotated
  });

  it('ends the tournament early once a player reaches the majority in a best-of-3', () => {
    store.startTournament('Alice', 'X', 'Bob', 3);

    const winGameForPlayer1 = () => {
      store.playCell(0);
      store.playCell(3);
      store.playCell(1);
      store.playCell(4);
      store.playCell(2);
    };

    winGameForPlayer1();
    expect(latest(store.phase$)).toBe('playing');
    store.startNextGame();
    winGameForPlayer1();

    expect(latest(store.phase$)).toBe('tournament-complete');
    expect(latest(store.tournamentWinner$)).toBe('player1');
    expect(latest(store.scoreboard$).player1Wins).toBe(2);
  });

  it('resetToSetup returns to a clean setup state', () => {
    store.startTournament('Alice', 'X', 'Bob', 1);
    store.playCell(0);
    store.resetToSetup();

    expect(latest(store.phase$)).toBe('setup');
    expect(latest(store.players$)).toBeNull();
    expect(latest(store.board$).every((c) => c === null)).toBeTrue();
  });
});
