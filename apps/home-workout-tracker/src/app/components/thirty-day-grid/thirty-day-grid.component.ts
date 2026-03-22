import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ProgressDayView } from '@home-workout-tracker/workout-tracker-data';

@Component({
  selector: 'tracker-thirty-day-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './thirty-day-grid.component.html',
  styleUrl: './thirty-day-grid.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThirtyDayGridComponent {
  @Input({ required: true }) days: ProgressDayView[] = [];
}

