import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SummarySnapshot } from '@home-workout-tracker/workout-tracker-data';

@Component({
  selector: 'tracker-dashboard-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-summary.component.html',
  styleUrl: './dashboard-summary.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardSummaryComponent {
  @Input({ required: true }) summary!: SummarySnapshot;
  @Input({ required: true }) todayPlanTitle!: string;
  @Input({ required: true }) message!: string;
}

