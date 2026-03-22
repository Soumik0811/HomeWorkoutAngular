import { DayPlan, ExerciseDefinition, WorkoutType } from './models';

const pushDay: ExerciseDefinition[] = [
  { name: 'Dumbbell Floor Press', sets: 4 },
  { name: 'Incline Push-ups', sets: 3 },
  { name: 'Shoulder Press', sets: 3 },
  { name: 'Lateral Raises', sets: 3 },
  { name: 'Overhead Triceps Extension', sets: 3 },
  { name: 'Dips', sets: 3 }
];

const pullDay: ExerciseDefinition[] = [
  { name: 'One-arm Dumbbell Row', sets: 4 },
  { name: 'Dumbbell Deadlift', sets: 3 },
  { name: 'Reverse Fly', sets: 3 },
  { name: 'Bicep Curl', sets: 3 },
  { name: 'Hammer Curl', sets: 3 }
];

const legsDay: ExerciseDefinition[] = [
  { name: 'Goblet Squat', sets: 4 },
  { name: 'Lunges', sets: 3 },
  { name: 'Romanian Deadlift', sets: 3 },
  { name: 'Calf Raises', sets: 4 },
  { name: 'Plank', sets: 3, category: 'core' },
  { name: 'Leg Raises', sets: 3, category: 'core' },
  { name: 'Russian Twists', sets: 3, category: 'core' }
];

const cycle: Array<{
  title: string;
  shortLabel: string;
  workoutType: WorkoutType;
  includesCardio: boolean;
  includesCore: boolean;
  exercises: ExerciseDefinition[];
}> = [
  {
    title: 'Push + Cardio',
    shortLabel: 'Push',
    workoutType: 'push',
    includesCardio: true,
    includesCore: false,
    exercises: pushDay
  },
  {
    title: 'Pull + Cardio',
    shortLabel: 'Pull',
    workoutType: 'pull',
    includesCardio: true,
    includesCore: false,
    exercises: pullDay
  },
  {
    title: 'Legs + Core + Cardio',
    shortLabel: 'Legs',
    workoutType: 'legs',
    includesCardio: true,
    includesCore: true,
    exercises: legsDay
  },
  {
    title: 'Push + Cardio',
    shortLabel: 'Push',
    workoutType: 'push',
    includesCardio: true,
    includesCore: false,
    exercises: pushDay
  },
  {
    title: 'Pull + Cardio',
    shortLabel: 'Pull',
    workoutType: 'pull',
    includesCardio: true,
    includesCore: false,
    exercises: pullDay
  },
  {
    title: 'Legs + Core + Cardio',
    shortLabel: 'Legs',
    workoutType: 'legs',
    includesCardio: true,
    includesCore: true,
    exercises: legsDay
  },
  {
    title: 'Rest',
    shortLabel: 'Rest',
    workoutType: 'rest',
    includesCardio: false,
    includesCore: false,
    exercises: []
  }
];

export const HIIT_EXERCISES = [
  'Burpees',
  'Mountain climbers',
  'Jump squats',
  'High knees',
  'Plank shoulder taps'
];

export const TOTAL_PROGRAM_DAYS = 30;

export const PROGRAM_PLAN: DayPlan[] = Array.from({ length: TOTAL_PROGRAM_DAYS }, (_, index) => {
  const dayNumber = index + 1;
  const cycleDay = (index % cycle.length) + 1;
  const cyclePlan = cycle[cycleDay - 1];

  return {
    dayNumber,
    cycleDay,
    weekNumber: Math.ceil(dayNumber / 7),
    workoutType: cyclePlan.workoutType,
    title: cyclePlan.title,
    shortLabel: cyclePlan.shortLabel,
    includesCardio: cyclePlan.includesCardio,
    includesCore: cyclePlan.includesCore,
    exercises: cyclePlan.exercises
  };
});

