import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  inject
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PushUpEntry } from '@home-workout-tracker/workout-tracker-data';

type PushUpPayload = Omit<PushUpEntry, 'date'>;

@Component({
  selector: 'tracker-pushup-challenge',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pushup-challenge.component.html',
  styleUrl: './pushup-challenge.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PushupChallengeComponent implements OnChanges, OnDestroy {
  @Input() entry: PushUpEntry | null = null;
  @Input({ required: true }) history: PushUpEntry[] = [];
  @Input({ required: true }) dayNumber = 1;

  @Output() readonly entrySaved = new EventEmitter<PushUpPayload>();

  maxPushUps = 20;
  maxSetCompleted = false;
  maxSetReps: number | null = null;
  backOffSetsCompleted = false;
  inclinePushUpsCompleted = false;
  kneeBurnoutCompleted = false;
  emomMinutesCompleted = 0;

  emomRunning = false;
  emomSeconds = 0;
  chartDots: Array<{ x: number; y: number }> = [];

  private readonly cdr = inject(ChangeDetectorRef);
  private emomIntervalId: ReturnType<typeof setInterval> | null = null;

  get targetMin(): number {
    return Math.max(1, Math.round(this.maxPushUps * 0.6));
  }

  get targetMax(): number {
    return Math.max(this.targetMin, Math.round(this.maxPushUps * 0.7));
  }

  get chartPoints(): string {
    return this.chartDots.map((dot) => `${dot.x},${dot.y}`).join(' ');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['entry']) {
      this.hydrateFromEntry();
    }

    if (changes['history']) {
      if (!this.entry) {
        this.maxPushUps = this.history.at(-1)?.maxPushUps ?? this.maxPushUps;
      }
      this.chartDots = this.buildChartDots();
    }
  }

  ngOnDestroy(): void {
    this.pauseEmom();
  }

  save(): void {
    this.entrySaved.emit({
      maxPushUps: this.maxPushUps,
      targetMin: this.targetMin,
      targetMax: this.targetMax,
      maxSetCompleted: this.maxSetCompleted,
      maxSetReps: this.maxSetReps,
      backOffSetsCompleted: this.backOffSetsCompleted,
      inclinePushUpsCompleted: this.inclinePushUpsCompleted,
      kneeBurnoutCompleted: this.kneeBurnoutCompleted,
      emomMinutesCompleted: this.emomMinutesCompleted
    });
  }

  toggleEmom(): void {
    if (this.emomRunning) {
      this.pauseEmom();
      return;
    }

    this.emomRunning = true;
    this.emomIntervalId = setInterval(() => {
      this.emomSeconds += 1;
      this.emomMinutesCompleted = Math.floor(this.emomSeconds / 60);
      this.cdr.markForCheck();
    }, 1000);
  }

  resetEmom(): void {
    this.pauseEmom();
    this.emomSeconds = 0;
    this.emomMinutesCompleted = 0;
    this.cdr.markForCheck();
  }

  private hydrateFromEntry(): void {
    if (!this.entry) {
      this.maxPushUps = this.history.at(-1)?.maxPushUps ?? 20;
      this.maxSetCompleted = false;
      this.maxSetReps = null;
      this.backOffSetsCompleted = false;
      this.inclinePushUpsCompleted = false;
      this.kneeBurnoutCompleted = false;
      this.emomSeconds = 0;
      this.emomMinutesCompleted = 0;
      return;
    }

    this.maxPushUps = this.entry.maxPushUps;
    this.maxSetCompleted = this.entry.maxSetCompleted;
    this.maxSetReps = this.entry.maxSetReps;
    this.backOffSetsCompleted = this.entry.backOffSetsCompleted;
    this.inclinePushUpsCompleted = this.entry.inclinePushUpsCompleted;
    this.kneeBurnoutCompleted = this.entry.kneeBurnoutCompleted;
    this.emomSeconds = this.entry.emomMinutesCompleted * 60;
    this.emomMinutesCompleted = this.entry.emomMinutesCompleted;
  }

  private buildChartDots(): Array<{ x: number; y: number }> {
    if (!this.history.length) {
      return [];
    }

    const width = 290;
    const height = 140;
    const padding = 20;
    const maxValue = Math.max(...this.history.map((item) => item.maxPushUps), 1);
    const stepX = this.history.length === 1 ? 0 : (width - padding * 2) / (this.history.length - 1);

    return this.history.map((item, index) => ({
      x: padding + stepX * index,
      y: height - padding - (item.maxPushUps / maxValue) * (height - padding * 2)
    }));
  }

  private pauseEmom(): void {
    this.emomRunning = false;
    if (this.emomIntervalId) {
      clearInterval(this.emomIntervalId);
      this.emomIntervalId = null;
    }
  }
}
