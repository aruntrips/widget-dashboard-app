import { WidgetRegistryService } from './widget-registry.service';

/**
 * Registers every known widget type against a dynamic import().
 * Each entry becomes its own lazy-loaded chunk in the production build —
 * adding a new widget type means adding one line here, nothing else.
 */
export function registerWidgets(registry: WidgetRegistryService): void {
  registry.registerLazy('kpi', () =>
    import('../widgets/kpi-widget/kpi-widget.component').then((m) => m.KpiWidgetComponent)
  );

  registry.registerLazy('chart', () =>
    import('../widgets/chart-widget/chart-widget.component').then((m) => m.ChartWidgetComponent)
  );

  registry.registerLazy('table', () =>
    import('../widgets/table-widget/table-widget.component').then((m) => m.TableWidgetComponent)
  );
}
