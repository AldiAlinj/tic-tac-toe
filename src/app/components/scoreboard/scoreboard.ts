import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { TournamentStore } from '../../services/tournament-store';

/**
 * Persistent scoreboard shown above the board during play.
 *
 * Rather than subscribing to five separate store streams from the
 * template, this combines them with `combineLatest` into a single
 * view-model observable, which is a common RxJS pattern for keeping
 * templates simple (one `| async` instead of five).
 */
@Component({
  selector: 'app-scoreboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scoreboard.html',
  styleUrl: './scoreboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScoreboardComponent {
  private readonly store = inject(TournamentStore);

  readonly vm$ = combineLatest([
    this.store.players$,
    this.store.scoreboard$,
    this.store.currentGameNumber$,
    this.store.bestOf$,
    this.store.currentPlayer$,
    this.store.status$,
  ]).pipe(
    map(([players, scoreboard, currentGameNumber, bestOf, currentPlayer, status]) => ({
      players,
      scoreboard,
      currentGameNumber,
      bestOf,
      currentPlayer,
      status,
    })),
  );
}
