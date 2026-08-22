import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { WidgetLoaderComponent } from '../core/widget-loader.component';
import { WidgetRegistryService } from '../core/widget-registry.service';
import { registerWidgets } from '../core/register-widgets';
import { DashboardStateService } from '../core/dashboard-state.service';
import { ThemeService } from '../core/theme/theme.service';
import { WidgetConfig } from '../core/models/widget-config.model';

@Component({
  selector: 'app-dashboard',
  imports: [WidgetLoaderComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  private registry = inject(WidgetRegistryService);
  private state = inject(DashboardStateService);
  private themeService = inject(ThemeService);

  theme = this.themeService.theme;

  /**
   * In a real app this array comes from one bootstrap API call
   * (see: dashboard bootstrap pattern) rather than being hardcoded.
   */
  widgets = signal<WidgetConfig[]>([
    { id: 'kpi-revenue', type: 'kpi', title: 'Total Revenue' },
    { id: 'kpi-orders', type: 'kpi', title: 'Orders', settings: { accentColor: '#16a34a' } },
    { id: 'chart-sales', type: 'chart', title: 'Monthly Sales' },
    { id: 'table-breakdown', type: 'table', title: 'Monthly Breakdown' },
  ]);

  ngOnInit(): void {
    registerWidgets(this.registry);
  }

  onRegionChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.state.setFilter('region', value || null);
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }
}
