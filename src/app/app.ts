import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerSetupComponent } from './components/player-setup/player-setup';
import { GameBoardComponent } from './components/game-board/game-board';
import { TournamentResultsComponent } from './components/tournament-results/tournament-results';
import { TournamentStore } from './services/tournament-store';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, PlayerSetupComponent, GameBoardComponent, TournamentResultsComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly store = inject(TournamentStore);
  readonly phase$ = this.store.phase$;
}
