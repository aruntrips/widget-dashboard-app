import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { WidgetConfig } from '../../core/models/widget-config.model';
import { DashboardStateService } from '../../core/dashboard-state.service';

interface ChartDatum {
  label: string;
  value: number;
}

@Component({
  selector: 'app-chart-widget',
  template: `
    <div class="chart-widget">
      <div class="chart-title">{{ config().title }}</div>

      @if (loading()) {
        <div class="chart-loading">Loading…</div>
      } @else {
        <svg [attr.viewBox]="'0 0 ' + svgWidth + ' ' + svgHeight" class="chart-svg">
          @for (bar of bars(); track bar.label) {
            <rect
              class="chart-bar"
              [class.selected]="bar.label === selectedLabel()"
              [attr.x]="bar.x"
              [attr.y]="bar.y"
              [attr.width]="barWidth"
              [attr.height]="bar.height"
              (click)="onBarClick(bar.label)"
            />
            <text class="chart-label" [attr.x]="bar.x + barWidth / 2" [attr.y]="svgHeight - 4">
              {{ bar.label }}
            </text>
          }
        </svg>
      }
    </div>
  `,
  styles: [
    `
      .chart-widget {
        background: var(--widget-bg);
        border: 1px solid var(--widget-border);
        border-radius: var(--radius-md);
        box-shadow: var(--widget-shadow);
        padding: var(--widget-padding);
        min-width: 280px;
      }
      .chart-title {
        font-size: 0.85rem;
        color: var(--widget-muted-color);
        margin-bottom: 10px;
      }
      .chart-loading {
        font-size: 0.9rem;
        color: var(--widget-muted-color);
      }
      .chart-svg {
        width: 100%;
        height: 160px;
      }
      .chart-bar {
        fill: var(--widget-accent, var(--color-primary));
        cursor: pointer;
        opacity: 0.85;
        transition: opacity 0.15s ease;
      }
      .chart-bar:hover {
        opacity: 1;
      }
      .chart-bar.selected {
        fill: var(--color-danger);
      }
      .chart-label {
        font-size: 9px;
        fill: var(--widget-muted-color);
        text-anchor: middle;
      }
    `,
  ],
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartWidgetComponent {
  /** Signal input (v17.1+ API, the v20 default convention) replacing @Input(). */
  config = input.required<WidgetConfig>();

  private state = inject(DashboardStateService);

  readonly svgWidth = 260;
  readonly svgHeight = 160;
  readonly barWidth = 32;
  readonly gap = 12;

  private entry = computed(() => this.state.widgetData()[this.config().id]);
  loading = computed(() => this.entry()?.status === 'loading' || !this.entry());
  private data = computed(() => (this.entry()?.data as ChartDatum[] | undefined) ?? []);

  selectedLabel = computed(() => {
    const sel = this.state.selection();
    return sel?.widgetId === this.config().id ? (sel.value as string) : null;
  });

  bars = computed(() => {
    const items = this.data();
    const max = Math.max(...items.map((d) => d.value), 1);
    return items.map((d, i) => {
      const height = (d.value / max) * (this.svgHeight - 24);
      return {
        label: d.label,
        value: d.value,
        x: i * (this.barWidth + this.gap) + 8,
        y: this.svgHeight - 20 - height,
        height,
      };
    });
  });

  constructor() {
    effect(() => {
      const cfg = this.config();
      if (cfg.data && !this.entry()) {
        this.state.setWidgetData(cfg.id, { status: 'success', data: cfg.data });
      }
    });

    effect(() => {
      const region = this.state.activeRegion();
      const cfg = this.config();
      if (cfg) {
        this.fetchData(cfg.id, region);
      }
    });
  }

  onBarClick(label: string): void {
    this.state.emitSelection(this.config().id, label);
    this.state.setFilter('category', label);
  }

  private fetchData(widgetId: string, region: string | null): void {
    this.state.setWidgetData(widgetId, { status: 'loading', data: null });
    setTimeout(() => {
      const seed = region ? region.length : 3;
      const mock: ChartDatum[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May'].map((label, i) => ({
        label,
        value: 20 + ((seed + i * 7) % 50),
      }));
      this.state.setWidgetData(widgetId, { status: 'success', data: mock });
    }, 300);
  }
}
