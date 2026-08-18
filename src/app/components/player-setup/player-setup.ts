import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { BestOf, Mark } from '../../models/game.models';
import { TournamentStore } from '../../services/tournament-store';

const namesMustDifferValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const name1 = (group.get('player1Name')?.value ?? '').trim().toLowerCase();
  const name2 = (group.get('player2Name')?.value ?? '').trim().toLowerCase();
  if (!name1 || !name2) return null;
  return name1 === name2 ? { namesIdentical: true } : null;
};

@Component({
  selector: 'app-player-setup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './player-setup.html',
  styleUrl: './player-setup.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerSetupComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(TournamentStore);

  readonly bestOfOptions: BestOf[] = [1, 3, 5];

  readonly form = this.fb.nonNullable.group(
    {
      player1Name: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(20)]),
      player2Name: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(20)]),
      player1Mark: this.fb.nonNullable.control<Mark>('X', Validators.required),
      bestOf: this.fb.nonNullable.control<BestOf>(3, Validators.required),
    },
    { validators: namesMustDifferValidator },
  );

  get player2Mark(): Mark {
    return this.form.controls.player1Mark.value === 'X' ? 'O' : 'X';
  }

  showError(controlName: 'player1Name' | 'player2Name'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { player1Name, player2Name, player1Mark, bestOf } = this.form.getRawValue();
    this.store.startTournament(player1Name, player1Mark, player2Name, bestOf);
  }
}
