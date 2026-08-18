import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { ScoreboardComponent } from '../scoreboard/scoreboard';
import { GameCellComponent } from '../game-cell/game-cell';
import { TournamentStore } from '../../services/tournament-store';
import { GameStatus, Player, PlayerId } from '../../models/game.models';

@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [CommonModule, ScoreboardComponent, GameCellComponent],
  templateUrl: './game-board.html',
  styleUrl: './game-board.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameBoardComponent {
  private readonly store = inject(TournamentStore);

  readonly vm$ = combineLatest([
    this.store.board$,
    this.store.status$,
    this.store.winningLine$,
    this.store.players$,
    this.store.currentTurn$,
  ]).pipe(
    map(([board, status, winningLine, players, currentTurn]) => ({
      board,
      status,
      winningLine,
      players,
      lastMoverName: this.lastMoverName(status, players, currentTurn),
    })),
  );

  private lastMoverName(
    status: GameStatus,
    players: [Player, Player] | null,
    currentTurn: PlayerId,
  ): string | null {
    if (status !== 'won' || !players) return null;
    return currentTurn === 'player1' ? players[0].name : players[1].name;
  }

  onCellClick(index: number): void {
    this.store.playCell(index);
  }

  onNextGame(): void {
    this.store.startNextGame();
  }

  isWinningCell(index: number, winningLine: number[] | null): boolean {
    return !!winningLine && winningLine.includes(index);
  }
}
