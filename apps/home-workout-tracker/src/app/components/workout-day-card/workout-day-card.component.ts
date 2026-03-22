import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { DayPlan, ExerciseDefinition, WorkoutProgress } from '@home-workout-tracker/workout-tracker-data';

@Component({
  selector: 'tracker-workout-day-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workout-day-card.component.html',
  styleUrl: './workout-day-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkoutDayCardComponent {
  @Input({ required: true }) plan!: DayPlan;
  @Input({ required: true }) progress!: WorkoutProgress;
  @Input({ required: true }) completed!: boolean;

  @Output() readonly setChanged = new EventEmitter<{ exerciseName: string; setIndex: number }>();
  @Output() readonly cardioRoundChanged = new EventEmitter<number>();
  @Output() readonly restDayChanged = new EventEmitter<boolean>();

  get mainExercises(): ExerciseDefinition[] {
    return this.plan.exercises.filter((exercise) => exercise.category !== 'core');
  }

  get coreExercises(): ExerciseDefinition[] {
    return this.plan.exercises.filter((exercise) => exercise.category === 'core');
  }

  onToggleSet(exerciseName: string, setIndex: number): void {
    this.setChanged.emit({ exerciseName, setIndex });
  }

  onToggleRestDay(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.restDayChanged.emit(checked);
  }
}

