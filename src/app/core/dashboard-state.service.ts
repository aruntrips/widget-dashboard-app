import { Injectable, computed, signal } from '@angular/core';
import { DashboardFilters, WidgetDataEntry } from './models/widget-config.model';

@Injectable({ providedIn: 'root' })
export class DashboardStateService {
  // --- Shared filters (cross-widget input) ---
  private _filters = signal<DashboardFilters>({ region: null, category: null });
  readonly filters = this._filters.asReadonly();

  // --- Per-widget data cache (keyed by widget id) ---
  private _widgetData = signal<Record<string, WidgetDataEntry>>({});
  readonly widgetData = this._widgetData.asReadonly();

  // --- Cross-widget selection (e.g. clicking a chart bar highlights a table row) ---
  private _selection = signal<{ widgetId: string; value: unknown } | null>(null);
  readonly selection = this._selection.asReadonly();

  readonly activeRegion = computed(() => this._filters().region);

  setFilter<K extends keyof DashboardFilters>(key: K, value: DashboardFilters[K]): void {
    this._filters.update((f) => ({ ...f, [key]: value }));
  }

  setWidgetData(widgetId: string, entry: WidgetDataEntry): void {
    this._widgetData.update((map) => ({ ...map, [widgetId]: entry }));
  }

  getWidgetEntry(widgetId: string) {
    return computed(() => this._widgetData()[widgetId]);
  }

  emitSelection(widgetId: string, value: unknown): void {
    this._selection.set({ widgetId, value });
  }
}
