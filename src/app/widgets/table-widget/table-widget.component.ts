import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { WidgetConfig } from '../../core/models/widget-config.model';
import { DashboardStateService } from '../../core/dashboard-state.service';

interface TableRow {
  month: string;
  orders: number;
  revenue: number;
}

@Component({
  selector: 'app-table-widget',
  template: `
    <div class="table-widget">
      <div class="table-title">
        {{ config().title }}
        @if (highlightedMonth()) {
          <span class="table-filter-badge">filtered: {{ highlightedMonth() }}</span>
        }
      </div>

      @if (loading()) {
        <div class="table-loading">Loading…</div>
      } @else {
        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th>Orders</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            @for (row of visibleRows(); track row.month) {
              <tr [class.highlighted]="row.month === highlightedMonth()">
                <td>{{ row.month }}</td>
                <td>{{ row.orders }}</td>
                <td>${{ row.revenue }}</td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>
  `,
  styles: [
    `
      .table-widget {
        background: var(--widget-bg);
        border: 1px solid var(--widget-border);
        border-radius: var(--radius-md);
        box-shadow: var(--widget-shadow);
        padding: var(--widget-padding);
        min-width: 300px;
      }
      .table-title {
        font-size: 0.85rem;
        color: var(--widget-muted-color);
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .table-filter-badge {
        font-size: 0.7rem;
        background: var(--widget-accent, var(--color-primary));
        color: var(--color-primary-contrast);
        padding: 2px 8px;
        border-radius: 999px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.85rem;
        color: var(--widget-title-color);
      }
      th {
        text-align: left;
        color: var(--widget-muted-color);
        font-weight: 500;
        padding: 4px 6px;
        border-bottom: 1px solid var(--widget-border);
      }
      td {
        padding: 4px 6px;
        border-bottom: 1px solid var(--widget-border);
      }
      tr.highlighted td {
        background: color-mix(in srgb, var(--widget-accent, var(--color-primary)) 12%, transparent);
        font-weight: 600;
      }
      .table-loading {
        font-size: 0.9rem;
        color: var(--widget-muted-color);
      }
    `,
  ],
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableWidgetComponent {
  /** Signal input (v17.1+ API, the v20 default convention) replacing @Input(). */
  config = input.required<WidgetConfig>();

  private state = inject(DashboardStateService);

  private entry = computed(() => this.state.widgetData()[this.config().id]);
  loading = computed(() => this.entry()?.status === 'loading' || !this.entry());
  private rows = computed(() => (this.entry()?.data as TableRow[] | undefined) ?? []);

  /** Reacts to a selection emitted by ANY widget (e.g. the chart) with zero direct coupling. */
  highlightedMonth = computed(() => {
    const sel = this.state.selection();
    return sel && sel.widgetId !== this.config().id ? (sel.value as string) : null;
  });

  visibleRows = computed(() => this.rows());

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

  private fetchData(widgetId: string, region: string | null): void {
    this.state.setWidgetData(widgetId, { status: 'loading', data: null });
    setTimeout(() => {
      const seed = region ? region.length : 3;
      const mock: TableRow[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May'].map((month, i) => ({
        month,
        orders: 10 + ((seed + i * 3) % 40),
        revenue: 1000 + ((seed + i * 5) % 40) * 120,
      }));
      this.state.setWidgetData(widgetId, { status: 'success', data: mock });
    }, 300);
  }
}
