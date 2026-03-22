import { DOCUMENT } from '@angular/common';
import { Injectable, computed, inject, signal } from '@angular/core';
import {
  DayPlan,
  ProgressDayView,
  PushUpEntry,
  SummarySnapshot,
  ThemeMode,
  TrackerState,
  WorkoutProgress
} from './models';
import { PROGRAM_PLAN, TOTAL_PROGRAM_DAYS } from './workout-plan';

const STORAGE_KEY = 'home-workout-tracker-state';
const MS_PER_DAY = 86_400_000;

function todayIsoString(): string {
  const today = new Date();
  const month = `${today.getMonth() + 1}`.padStart(2, '0');
  const day = `${today.getDate()}`.padStart(2, '0');
  return `${today.getFullYear()}-${month}-${day}`;
}

function startOfDay(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function parseLocalDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function cloneProgress(progress: WorkoutProgress): WorkoutProgress {
  return {
    completedSets: Object.fromEntries(
      Object.entries(progress.completedSets).map(([exercise, sets]) => [exercise, [...sets]])
    ),
    cardioRounds: [...progress.cardioRounds],
    restDayComplete: progress.restDayComplete
  };
}

function createWorkoutProgress(plan: DayPlan): WorkoutProgress {
  return {
    // Each exercise keeps its own checkbox array so the UI can render set-by-set completion.
    completedSets: Object.fromEntries(
      plan.exercises.map((exercise) => [exercise.name, Array.from({ length: exercise.sets }, () => false)])
    ),
    cardioRounds: [false, false, false],
    restDayComplete: false
  };
}

function createInitialState(): TrackerState {
  return {
    startDate: todayIsoString(),
    theme: 'dark',
    workouts: {},
    pushUpEntries: [],
    lastResetAt: new Date().toISOString()
  };
}

@Injectable({ providedIn: 'root' })
export class TrackerStorageService {
  private readonly document = inject(DOCUMENT);
  private readonly stateSignal = signal<TrackerState>(this.loadState());

  readonly state = this.stateSignal.asReadonly();
  readonly plans = PROGRAM_PLAN;

  readonly summary = computed<SummarySnapshot>(() => ({
    currentDayNumber: this.currentDayNumber(),
    currentWeekNumber: Math.ceil(this.currentDayNumber() / 7),
    completedDays: this.completedDays(),
    currentStreak: this.currentStreak(),
    latestPushUpMax: this.latestPushUpMax()
  }));

  readonly progressDays = computed<ProgressDayView[]>(() => {
    const currentDay = this.currentDayNumber();

    return this.plans.map((plan) => {
      const progress = this.progressForDay(plan.dayNumber);
      const completed = this.isDayCompleted(plan, progress);

      let status: ProgressDayView['status'] = 'upcoming';
      if (completed) {
        status = 'complete';
      } else if (plan.dayNumber < currentDay) {
        status = 'missed';
      } else if (plan.dayNumber === currentDay) {
        status = 'today';
      }

      return {
        plan,
        progress,
        completed,
        status
      };
    });
  });

  readonly weeklyProgress = computed(() => {
    const currentWeek = Math.ceil(this.currentDayNumber() / 7);

    return this.progressDays().filter((day) => day.plan.weekNumber === currentWeek);
  });

  readonly todayPlan = computed(() => this.planForDay(this.currentDayNumber()));
  readonly todayPushUpEntry = computed(() =>
    this.state().pushUpEntries.find((entry) => entry.date === todayIsoString()) ?? null
  );
  readonly latestPushUpMax = computed(() => this.state().pushUpEntries.at(-1)?.maxPushUps ?? 0);
  readonly completedDays = computed(() =>
    this.progressDays().filter((day) => day.completed).length
  );

  readonly currentStreak = computed(() => {
    const currentDay = this.currentDayNumber();
    let streak = 0;

    for (let dayNumber = currentDay; dayNumber >= 1; dayNumber -= 1) {
      const plan = this.planForDay(dayNumber);
      if (!this.isDayCompleted(plan, this.progressForDay(dayNumber))) {
        break;
      }
      streak += 1;
    }

    return streak;
  });

  constructor() {
    this.applyTheme(this.state().theme);
  }

  currentDayNumber(): number {
    // The program advances from the first day the user opens the tracker, then caps at 30 days.
    const startDate = startOfDay(parseLocalDate(this.state().startDate));
    const today = startOfDay(new Date());
    const differenceInDays = Math.max(0, Math.floor((today.getTime() - startDate.getTime()) / MS_PER_DAY));

    return Math.min(TOTAL_PROGRAM_DAYS, differenceInDays + 1);
  }

  planForDay(dayNumber: number): DayPlan {
    return this.plans[Math.min(Math.max(dayNumber, 1), TOTAL_PROGRAM_DAYS) - 1];
  }

  progressForDay(dayNumber: number): WorkoutProgress {
    const cached = this.state().workouts[dayNumber];
    if (cached) {
      return cloneProgress(cached);
    }

    return createWorkoutProgress(this.planForDay(dayNumber));
  }

  toggleSet(dayNumber: number, exerciseName: string, setIndex: number): void {
    const progress = this.progressForDay(dayNumber);
    const updatedSets = [...(progress.completedSets[exerciseName] ?? [])];
    updatedSets[setIndex] = !updatedSets[setIndex];

    progress.completedSets = {
      ...progress.completedSets,
      [exerciseName]: updatedSets
    };

    this.updateWorkout(dayNumber, progress);
  }

  toggleCardioRound(dayNumber: number, roundIndex: number, value?: boolean): void {
    const progress = this.progressForDay(dayNumber);
    const cardioRounds = [...progress.cardioRounds];
    cardioRounds[roundIndex] = value ?? !cardioRounds[roundIndex];
    progress.cardioRounds = cardioRounds;

    this.updateWorkout(dayNumber, progress);
  }

  markRestDay(dayNumber: number, complete: boolean): void {
    const progress = this.progressForDay(dayNumber);
    progress.restDayComplete = complete;
    this.updateWorkout(dayNumber, progress);
  }

  savePushUpEntry(entry: Omit<PushUpEntry, 'date'>): void {
    const date = todayIsoString();
    const nextEntry: PushUpEntry = { date, ...entry };
    const pushUpEntries = this.state().pushUpEntries.filter((item) => item.date !== date);

    pushUpEntries.push(nextEntry);
    pushUpEntries.sort((left, right) => left.date.localeCompare(right.date));

    this.patchState({
      pushUpEntries
    });
  }

  setTheme(theme: ThemeMode): void {
    this.applyTheme(theme);
    this.patchState({ theme });
  }

  resetProgress(): void {
    const nextState = createInitialState();
    this.applyTheme(nextState.theme);
    this.stateSignal.set(nextState);
    this.persist(nextState);
  }

  isDayCompleted(plan: DayPlan, progress: WorkoutProgress): boolean {
    if (plan.workoutType === 'rest') {
      return progress.restDayComplete;
    }

    const allSetsComplete = Object.values(progress.completedSets).every((sets) => sets.every(Boolean));
    const cardioComplete = !plan.includesCardio || progress.cardioRounds.every(Boolean);

    return allSetsComplete && cardioComplete;
  }

  motivationalMessage(): string {
    const completed = this.completedDays();
    const day = this.currentDayNumber();
    const today = this.todayPlan();
    const todayProgress = this.progressForDay(day);

    if (completed === 0) {
      return 'Your 30-day reset starts today. One workout at a time.';
    }

    if (completed >= TOTAL_PROGRAM_DAYS) {
      return '30 days complete. You built real consistency.';
    }

    if (this.isDayCompleted(today, todayProgress)) {
      return `Day ${day} completed. Keep the momentum moving tomorrow.`;
    }

    return `Day ${day} is on deck. ${completed} days completed and building momentum.`;
  }

  private updateWorkout(dayNumber: number, progress: WorkoutProgress): void {
    this.patchState({
      workouts: {
        ...this.state().workouts,
        [dayNumber]: cloneProgress(progress)
      }
    });
  }

  private patchState(patch: Partial<TrackerState>): void {
    const nextState: TrackerState = {
      ...this.state(),
      ...patch
    };

    this.stateSignal.set(nextState);
    this.persist(nextState);
  }

  private loadState(): TrackerState {
    if (typeof localStorage === 'undefined') {
      return createInitialState();
    }

    const savedState = localStorage.getItem(STORAGE_KEY);
    if (!savedState) {
      return createInitialState();
    }

    try {
      const parsed = JSON.parse(savedState) as Partial<TrackerState>;
      return {
        ...createInitialState(),
        ...parsed
      };
    } catch {
      return createInitialState();
    }
  }

  private persist(state: TrackerState): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  private applyTheme(theme: ThemeMode): void {
    this.document.documentElement.dataset['theme'] = theme;
  }
}
