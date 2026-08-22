export interface WidgetConfig {
  id: string;
  type: string; // e.g. 'kpi' | 'chart' | 'table' — used as the registry lookup key
  title: string;
  data?: unknown; // optional pre-fetched initial data, embedded by the dashboard
  settings?: Record<string, unknown>; // per-instance customization (e.g. accent color)
}

export type WidgetStatus = 'idle' | 'loading' | 'success' | 'error';

export interface WidgetDataEntry {
  status: WidgetStatus;
  data: unknown;
  error?: string;
}

export interface DashboardFilters {
  region: string | null;
  category: string | null;
}
