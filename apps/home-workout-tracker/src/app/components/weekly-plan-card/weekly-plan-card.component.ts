import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ProgressDayView } from '@home-workout-tracker/workout-tracker-data';

@Component({
  selector: 'tracker-weekly-plan-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './weekly-plan-card.component.html',
  styleUrl: './weekly-plan-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WeeklyPlanCardComponent {
  @Input({ required: true }) weekNumber = 1;
  @Input({ required: true }) days: ProgressDayView[] = [];
}

