import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { WidgetConfig } from '../../core/models/widget-config.model';
import { DashboardStateService } from '../../core/dashboard-state.service';

interface KpiData {
  value: number;
  trend: 'up' | 'down' | 'flat';
  deltaPct: number;
}

@Component({
  selector: 'app-kpi-widget',
  template: `
    <div class="kpi-widget" [style.--widget-accent]="accentOverride()">
      <div class="kpi-title">{{ config().title }}</div>

      @if (loading()) {
        <div class="kpi-loading">Loading…</div>
      } @else if (error()) {
        <div class="kpi-error">{{ error() }}</div>
      } @else {
        <div class="kpi-value">{{ value() | number: '1.0-0' }}</div>
        <div class="kpi-trend" [class.up]="trend() === 'up'" [class.down]="trend() === 'down'">
          {{ trend() === 'up' ? '▲' : trend() === 'down' ? '▼' : '—' }} {{ deltaPct() }}%
        </div>
      }
    </div>
  `,
  styles: [
    `
      .kpi-widget {
        background: var(--widget-bg);
        border: 1px solid var(--widget-border);
        border-radius: var(--radius-md);
        box-shadow: var(--widget-shadow);
        padding: var(--widget-padding);
        border-left: 4px solid var(--widget-accent, var(--color-primary));
        min-width: 180px;
      }
      .kpi-title {
        font-size: 0.85rem;
        color: var(--widget-muted-color);
        margin-bottom: 6px;
      }
      .kpi-value {
        font-size: 2rem;
        font-weight: 600;
        color: var(--widget-title-color);
      }
      .kpi-trend {
        font-size: 0.85rem;
        margin-top: 4px;
        color: var(--widget-muted-color);
      }
      .kpi-trend.up {
        color: var(--color-success);
      }
      .kpi-trend.down {
        color: var(--color-danger);
      }
      .kpi-loading,
      .kpi-error {
        font-size: 0.9rem;
        color: var(--widget-muted-color);
      }
      .kpi-error {
        color: var(--color-danger);
      }
    `,
  ],
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KpiWidgetComponent {
  /** Signal input (v17.1+ API, the v20 default convention) replacing @Input(). */
  config = input.required<WidgetConfig>();

  private state = inject(DashboardStateService);

  private entry = computed(() => this.state.widgetData()[this.config().id]);
  loading = computed(() => this.entry()?.status === 'loading' || !this.entry());
  error = computed(() => this.entry()?.error);
  private data = computed(() => this.entry()?.data as KpiData | undefined);
  value = computed(() => this.data()?.value ?? 0);
  trend = computed(() => this.data()?.trend ?? 'flat');
  deltaPct = computed(() => this.data()?.deltaPct ?? 0);

  accentOverride = computed(() => (this.config().settings?.['accentColor'] as string) ?? null);

  constructor() {
    // Seed with dashboard-supplied initial data the first time config is available (no spinner flash)
    effect(() => {
      const cfg = this.config();
      if (cfg.data && !this.entry()) {
        this.state.setWidgetData(cfg.id, { status: 'success', data: cfg.data });
      }
    });

    let initialized = false;
    effect(() => {
      const region = this.state.activeRegion();
      const cfg = this.config();
      if (!cfg) {
        return;
      }

      // Preserve data supplied by the dashboard on the initial render.
      if (!initialized) {
        initialized = true;
        if (cfg.data || this.entry()?.status === 'success') {
          return;
        }
      }

      this.fetchData(cfg.id, region);
    });
  }

  private fetchData(widgetId: string, region: string | null): void {
    this.state.setWidgetData(widgetId, { status: 'loading', data: null });
    // Simulated async fetch — replace with a real WidgetDataService/HTTP call.
    setTimeout(() => {
      const base = 45000 + (region ? region.length * 1000 : 0);
      const mock: KpiData = { value: base, trend: base % 2 === 0 ? 'up' : 'down', deltaPct: 3.2 };
      this.state.setWidgetData(widgetId, { status: 'success', data: mock });
    }, 300);
  }
}
