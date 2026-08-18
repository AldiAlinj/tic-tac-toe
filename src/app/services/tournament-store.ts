import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import {
  AppPhase,
  Board,
  BestOf,
  GameOutcome,
  GameResult,
  GameStatus,
  Mark,
  Player,
  PlayerId,
  Scoreboard,
} from '../models/game.models';
import { checkWinner, createEmptyBoard, isDraw } from './board-evaluator';

/**
 * The full shape of the application's state. Everything the UI needs to
 * render is derived from this one object, which lives inside a single
 * BehaviorSubject. This is a light hand-rolled "store" pattern
 * (subject-in / observable-out) rather than pulling in NgRx or a similar
 * library, since the brief calls a full store "encouraged, not required".
 */
export interface TournamentState {
  phase: AppPhase;
  players: [Player, Player] | null;
  bestOf: BestOf;

  board: Board;
  currentTurn: PlayerId;
  status: GameStatus;
  winningLine: number[] | null;

  scoreboard: Scoreboard;
  currentGameNumber: number;
  gameResults: GameResult[];

  nextStartingPlayer: PlayerId;

  tournamentWinner: PlayerId | 'draw' | null;
}

function initialState(): TournamentState {
  return {
    phase: 'setup',
    players: null,
    bestOf: 3,
    board: createEmptyBoard(),
    currentTurn: 'player1',
    status: 'in-progress',
    winningLine: null,
    scoreboard: { player1Wins: 0, player2Wins: 0, draws: 0 },
    currentGameNumber: 1,
    gameResults: [],
    nextStartingPlayer: 'player1',
    tournamentWinner: null,
  };
}

@Injectable({ providedIn: 'root' })
export class TournamentStore {
  /** The single BehaviorSubject holding all state. Private so components can never bypass the API below. */
  private readonly state$$ = new BehaviorSubject<TournamentState>(initialState());

  /** Read-only stream of the full state, exposed for anything that needs more than one slice at once. */
  readonly state$: Observable<TournamentState> = this.state$$.asObservable();

  // ---- Derived selectors ----
  readonly phase$: Observable<AppPhase> = this.select((s) => s.phase);
  readonly players$: Observable<[Player, Player] | null> = this.select((s) => s.players);
  readonly board$: Observable<Board> = this.select((s) => s.board);
  readonly currentTurn$: Observable<PlayerId> = this.select((s) => s.currentTurn);
  readonly status$: Observable<GameStatus> = this.select((s) => s.status);
  readonly winningLine$: Observable<number[] | null> = this.select((s) => s.winningLine);
  readonly scoreboard$: Observable<Scoreboard> = this.select((s) => s.scoreboard);
  readonly currentGameNumber$: Observable<number> = this.select((s) => s.currentGameNumber);
  readonly bestOf$: Observable<BestOf> = this.select((s) => s.bestOf);
  readonly gameResults$: Observable<GameResult[]> = this.select((s) => s.gameResults);
  readonly tournamentWinner$: Observable<PlayerId | 'draw' | null> = this.select(
    (s) => s.tournamentWinner,
  );

  

  /** Convenience stream combining current-player id with the players tuple, for display. */
  readonly currentPlayer$: Observable<Player | null> = combineLatest([
    this.players$,
    this.currentTurn$,
  ]).pipe(map(([players, turn]) => (players ? players[this.indexFor(turn)] : null)));

  private select<T>(project: (state: TournamentState) => T): Observable<T> {
    return this.state$$.pipe(map(project), distinctUntilChanged());
  }

  private get snapshot(): TournamentState {
    return this.state$$.value;
  }

  private patch(partial: Partial<TournamentState>): void {
    this.state$$.next({ ...this.snapshot, ...partial });
  }

  private indexFor(id: PlayerId): 0 | 1 {
    return id === 'player1' ? 0 : 1;
  }

  private other(id: PlayerId): PlayerId {
    return id === 'player1' ? 'player2' : 'player1';
  }


  // ---- Public API ----

  /**
   * Kicks off a brand-new tournament from the setup form's values.
   * Resets every piece of per-tournament state.
   */
  startTournament(player1Name: string, player1Mark: Mark, player2Name: string, bestOf: BestOf): void {
    const player2Mark: Mark = player1Mark === 'X' ? 'O' : 'X';
    const players: [Player, Player] = [
      { id: 'player1', name: player1Name.trim(), mark: player1Mark },
      { id: 'player2', name: player2Name.trim(), mark: player2Mark },
    ];

    this.state$$.next({
      ...initialState(),
      phase: 'playing',
      players,
      bestOf,
      currentTurn: 'player1',
      nextStartingPlayer: 'player2',
    });
  }

  /**
   * Attempts to play a mark into the given cell (0-8). No-ops for illegal
   * moves (occupied cell, game already decided) so the UI can call this
   * freely from a click handler without pre-validating.
   */
  playCell(cellIndex: number): void {
    const s = this.snapshot;
    if (s.phase !== 'playing' || s.status !== 'in-progress') return;
    if (s.board[cellIndex] !== null) return;
    if (!s.players) return;

    const mark = s.players[this.indexFor(s.currentTurn)].mark;
    const board = [...s.board];
    board[cellIndex] = mark;

    const { winner, line } = checkWinner(board);

    if (winner) {
      this.finishGame(board, s.currentTurn, line);
      return;
    }

    if (isDraw(board)) {
      this.finishGame(board, 'draw', null);
      return;
    }

    this.patch({ board, currentTurn: this.other(s.currentTurn) });
  }

  private finishGame(board: Board, outcome: GameOutcome, winningLine: number[] | null): void {
    const s = this.snapshot;

    const scoreboard: Scoreboard = {
      player1Wins: s.scoreboard.player1Wins + (outcome === 'player1' ? 1 : 0),
      player2Wins: s.scoreboard.player2Wins + (outcome === 'player2' ? 1 : 0),
      draws: s.scoreboard.draws + (outcome === 'draw' ? 1 : 0),
    };

    const result: GameResult = {
      gameNumber: s.currentGameNumber,
      outcome,
      winningLine,
      board,
    };

    const majorityNeeded = Math.floor(s.bestOf / 2) + 1;
    const tournamentDecided =
      scoreboard.player1Wins >= majorityNeeded ||
      scoreboard.player2Wins >= majorityNeeded ||
      s.currentGameNumber >= s.bestOf;

    if (tournamentDecided) {
      let tournamentWinner: PlayerId | 'draw';
      if (scoreboard.player1Wins > scoreboard.player2Wins) tournamentWinner = 'player1';
      else if (scoreboard.player2Wins > scoreboard.player1Wins) tournamentWinner = 'player2';
      else tournamentWinner = 'draw';

      this.patch({
        board,
        status: outcome === 'draw' ? 'draw' : 'won',
        winningLine,
        scoreboard,
        gameResults: [...s.gameResults, result],
        phase: 'tournament-complete',
        tournamentWinner,
      });
      return;
    }

    // Tournament continues: just record this game's outcome on screen for a beat.
    this.patch({
      board,
      status: outcome === 'draw' ? 'draw' : 'won',
      winningLine,
      scoreboard,
      gameResults: [...s.gameResults, result],
    });
  }

  /** Moves on to the next game in the tournament: fresh board, rotated starting player. */
  startNextGame(): void {
    const s = this.snapshot;
    if (s.phase !== 'playing') return;

    this.patch({
      board: createEmptyBoard(),
      status: 'in-progress',
      winningLine: null,
      currentTurn: s.nextStartingPlayer,
      nextStartingPlayer: this.other(s.nextStartingPlayer),
      currentGameNumber: s.currentGameNumber + 1,
    });
  }

  /** Returns to the setup screen with a completely clean slate for a new tournament. */
  resetToSetup(): void {
    this.state$$.next(initialState());
  }
}
