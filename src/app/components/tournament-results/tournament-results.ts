import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { TournamentStore } from '../../services/tournament-store';
import { GameOutcome, Player } from '../../models/game.models';

/**
 * Final "tournament complete" screen: overall winner, final score,
 * per-game breakdown, and a "Play Again" action that resets the store
 * back to the setup phase.
 */
@Component({
  selector: 'app-tournament-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tournament-results.html',
  styleUrl: './tournament-results.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TournamentResultsComponent {
  private readonly store = inject(TournamentStore);

  readonly vm$ = combineLatest([
    this.store.players$,
    this.store.scoreboard$,
    this.store.gameResults$,
    this.store.tournamentWinner$,
    this.store.bestOf$,
  ]).pipe(
    map(([players, scoreboard, gameResults, tournamentWinner, bestOf]) => ({
      players,
      scoreboard,
      gameResults,
      tournamentWinner,
      bestOf,
    })),
  );

  outcomeLabel(outcome: GameOutcome, players: [Player, Player] | null): string {
    if (outcome === 'draw') return 'Draw';
    if (!players) return '';
    return outcome === 'player1' ? players[0].name : players[1].name;
  }

  playAgain(): void {
    this.store.resetToSetup();
  }
}
