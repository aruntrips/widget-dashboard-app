import { signal } from '@angular/core';
import { DashboardFilters, WidgetDataEntry } from '../core/models/widget-config.model';

/**
 * Builds a stub matching DashboardStateService's public shape, for use in
 * widget unit tests. Keeping this in one place means a future change to the
 * real service's shape only needs to be updated here, not in every spec.
 */
export function createMockDashboardState(
  overrides: {
    filters?: DashboardFilters;
    widgetData?: Record<string, WidgetDataEntry>;
    selection?: { widgetId: string; value: unknown } | null;
  } = {}
) {
  const filters = signal<DashboardFilters>(overrides.filters ?? { region: null, category: null });
  const widgetData = signal<Record<string, WidgetDataEntry>>(overrides.widgetData ?? {});
  const selection = signal<{ widgetId: string; value: unknown } | null>(overrides.selection ?? null);

  return {
    filters: filters.asReadonly(),
    widgetData: widgetData.asReadonly(),
    selection: selection.asReadonly(),
    activeRegion: () => filters().region,
    setFilter: jasmine.createSpy('setFilter'),
    setWidgetData: jasmine.createSpy('setWidgetData').and.callFake((id: string, entry: WidgetDataEntry) => {
      widgetData.update((map) => ({ ...map, [id]: entry }));
    }),
    emitSelection: jasmine.createSpy('emitSelection').and.callFake((widgetId: string, value: unknown) => {
      selection.set({ widgetId, value });
    }),
    getWidgetEntry: (id: string) => () => widgetData()[id],
  };
}
