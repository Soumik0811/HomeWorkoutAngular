import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DashboardSummaryComponent } from './components/dashboard-summary/dashboard-summary.component';
import { HiitTimerComponent } from './components/hiit-timer/hiit-timer.component';
import { PushupChallengeComponent } from './components/pushup-challenge/pushup-challenge.component';
import { ThirtyDayGridComponent } from './components/thirty-day-grid/thirty-day-grid.component';
import { WeeklyPlanCardComponent } from './components/weekly-plan-card/weekly-plan-card.component';
import { WorkoutDayCardComponent } from './components/workout-day-card/workout-day-card.component';
import {
  PushUpEntry,
  ThemeMode,
  TrackerStorageService
} from '@home-workout-tracker/workout-tracker-data';

@Component({
  selector: 'home-workout-tracker-root',
  standalone: true,
  imports: [
    CommonModule,
    DashboardSummaryComponent,
    WorkoutDayCardComponent,
    HiitTimerComponent,
    PushupChallengeComponent,
    WeeklyPlanCardComponent,
    ThirtyDayGridComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  readonly tracker = inject(TrackerStorageService);

  readonly summary = this.tracker.summary;
  readonly todayPlan = this.tracker.todayPlan;
  readonly progressDays = this.tracker.progressDays;
  readonly weeklyProgress = this.tracker.weeklyProgress;
  readonly theme = computed(() => this.tracker.state().theme);
  readonly pushUpHistory = computed(() => this.tracker.state().pushUpEntries);
  readonly todayProgress = computed(() =>
    this.tracker.progressForDay(this.todayPlan().dayNumber)
  );
  readonly todayComplete = computed(() =>
    this.tracker.isDayCompleted(this.todayPlan(), this.todayProgress())
  );
  readonly motivation = computed(() => this.tracker.motivationalMessage());

  toggleTheme(): void {
    const nextTheme: ThemeMode = this.theme() === 'dark' ? 'light' : 'dark';
    this.tracker.setTheme(nextTheme);
  }

  toggleSet(event: { exerciseName: string; setIndex: number }): void {
    this.tracker.toggleSet(this.todayPlan().dayNumber, event.exerciseName, event.setIndex);
  }

  toggleCardioRound(roundIndex: number): void {
    this.tracker.toggleCardioRound(this.todayPlan().dayNumber, roundIndex);
  }

  markRestDay(complete: boolean): void {
    this.tracker.markRestDay(this.todayPlan().dayNumber, complete);
  }

  autoCompleteRound(roundIndex: number): void {
    this.tracker.toggleCardioRound(this.todayPlan().dayNumber, roundIndex, true);
  }

  savePushUpEntry(entry: Omit<PushUpEntry, 'date'>): void {
    this.tracker.savePushUpEntry(entry);
  }

  resetProgress(): void {
    const confirmed = window.confirm('Reset all workouts, cardio rounds, push-up history, and streak data?');
    if (confirmed) {
      this.tracker.resetProgress();
    }
  }
}
