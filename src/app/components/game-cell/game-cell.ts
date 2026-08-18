import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CellValue } from '../../models/game.models';

@Component({
  selector: 'app-game-cell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-cell.html',
  styleUrl: './game-cell.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameCellComponent {
  @Input({ required: true }) value: CellValue = null;
  @Input() index = 0;
  @Input() disabled = false;
  @Input() isWinningCell = false;

  @Output() readonly cellClick = new EventEmitter<number>();

  onClick(): void {
    if (this.disabled || this.value !== null) return;
    this.cellClick.emit(this.index);
  }
}
