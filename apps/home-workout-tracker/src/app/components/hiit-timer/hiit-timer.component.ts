import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  inject
} from '@angular/core';
import { HIIT_EXERCISES } from '@home-workout-tracker/workout-tracker-data';

interface HiitStage {
  duration: number;
  phase: 'work' | 'rest';
  round: number;
  exercise: string;
  autoCompleteRound: boolean;
}

@Component({
  selector: 'tracker-hiit-timer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hiit-timer.component.html',
  styleUrl: './hiit-timer.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HiitTimerComponent implements OnDestroy {
  @Input({ required: true }) roundStates!: boolean[];

  @Output() readonly roundCompleted = new EventEmitter<number>();
  @Output() readonly roundToggled = new EventEmitter<number>();

  private readonly cdr = inject(ChangeDetectorRef);
  private readonly stages = this.buildStages();
  private intervalId: ReturnType<typeof setInterval> | null = null;

  readonly hiitExercises = HIIT_EXERCISES;
  stageIndex = 0;
  secondsRemaining = this.stages[0].duration;
  running = false;

  get currentStage(): HiitStage | null {
    return this.stages[this.stageIndex] ?? null;
  }

  get currentRound(): number {
    return this.currentStage?.round ?? 3;
  }

  get currentExerciseLabel(): string {
    if (!this.currentStage) {
      return 'Workout complete';
    }

    return this.currentStage.phase === 'work' ? this.currentStage.exercise : 'Rest';
  }

  get currentPhaseLabel(): string {
    if (!this.currentStage) {
      return 'Done';
    }

    return this.currentStage.phase === 'work' ? 'Work block' : 'Recovery';
  }

  get upcomingExercise(): string {
    if (!this.currentStage || this.currentStage.phase === 'work') {
      return '';
    }

    const nextWorkStage = this.stages.slice(this.stageIndex + 1).find((stage) => stage.phase === 'work');
    return nextWorkStage?.exercise ?? 'Finish strong';
  }

  toggleTimer(): void {
    if (!this.currentStage) {
      this.reset();
      return;
    }

    this.running ? this.pause() : this.start();
  }

  reset(): void {
    this.pause();
    this.stageIndex = 0;
    this.secondsRemaining = this.stages[0].duration;
    this.cdr.markForCheck();
  }

  onToggleRound(roundIndex: number): void {
    this.roundToggled.emit(roundIndex);
  }

  ngOnDestroy(): void {
    this.pause();
  }

  private buildStages(): HiitStage[] {
    const stages: HiitStage[] = [];

    for (let round = 1; round <= 3; round += 1) {
      // The timer alternates work/rest stages so the same sequence can drive the full session UI.
      HIIT_EXERCISES.forEach((exercise, exerciseIndex) => {
        const isLastExerciseInRound = exerciseIndex === HIIT_EXERCISES.length - 1;
        const isLastRound = round === 3;

        stages.push({
          duration: 40,
          phase: 'work',
          round,
          exercise,
          autoCompleteRound: isLastExerciseInRound
        });

        if (!isLastExerciseInRound || !isLastRound) {
          stages.push({
            duration: 20,
            phase: 'rest',
            round,
            exercise,
            autoCompleteRound: false
          });
        }
      });
    }

    return stages;
  }

  private start(): void {
    if (this.running) {
      return;
    }

    this.running = true;
    this.intervalId = setInterval(() => {
      if (this.secondsRemaining > 1) {
        this.secondsRemaining -= 1;
        this.cdr.markForCheck();
        return;
      }

      this.advanceStage();
    }, 1000);
  }

  private pause(): void {
    this.running = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private advanceStage(): void {
    const activeStage = this.currentStage;
    if (!activeStage) {
      this.pause();
      return;
    }

    if (activeStage.autoCompleteRound) {
      this.roundCompleted.emit(activeStage.round - 1);
    }

    const nextStageIndex = this.stageIndex + 1;
    const nextStage = this.stages[nextStageIndex];

    if (!nextStage) {
      this.pause();
      this.stageIndex = this.stages.length;
      this.secondsRemaining = 0;
      this.cdr.markForCheck();
      return;
    }

    this.stageIndex = nextStageIndex;
    this.secondsRemaining = nextStage.duration;
    this.cdr.markForCheck();
  }
}
