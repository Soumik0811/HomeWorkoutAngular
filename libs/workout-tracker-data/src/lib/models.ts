export type WorkoutType = 'push' | 'pull' | 'legs' | 'rest';
export type ThemeMode = 'dark' | 'light';

export interface ExerciseDefinition {
  name: string;
  sets: number;
  category?: 'core' | 'main';
}

export interface DayPlan {
  dayNumber: number;
  cycleDay: number;
  weekNumber: number;
  workoutType: WorkoutType;
  title: string;
  shortLabel: string;
  includesCardio: boolean;
  includesCore: boolean;
  exercises: ExerciseDefinition[];
}

export interface WorkoutProgress {
  completedSets: Record<string, boolean[]>;
  cardioRounds: boolean[];
  restDayComplete: boolean;
}

export interface PushUpEntry {
  date: string;
  maxPushUps: number;
  targetMin: number;
  targetMax: number;
  maxSetCompleted: boolean;
  maxSetReps: number | null;
  backOffSetsCompleted: boolean;
  inclinePushUpsCompleted: boolean;
  kneeBurnoutCompleted: boolean;
  emomMinutesCompleted: number;
}

export interface TrackerState {
  startDate: string;
  theme: ThemeMode;
  workouts: Record<number, WorkoutProgress>;
  pushUpEntries: PushUpEntry[];
  lastResetAt: string;
}

export interface SummarySnapshot {
  currentDayNumber: number;
  currentWeekNumber: number;
  completedDays: number;
  currentStreak: number;
  latestPushUpMax: number;
}

export interface ProgressDayView {
  plan: DayPlan;
  progress: WorkoutProgress;
  completed: boolean;
  status: 'complete' | 'missed' | 'today' | 'upcoming';
}

