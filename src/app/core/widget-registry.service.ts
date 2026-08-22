import { Injectable, Type } from '@angular/core';

/** A loader is a function returning a dynamic import promise, resolved to a component class. */
export type WidgetLoader = () => Promise<Type<unknown>>;

@Injectable({ providedIn: 'root' })
export class WidgetRegistryService {
  private loaders = new Map<string, WidgetLoader>();
  private resolvedCache = new Map<string, Type<unknown>>();

  /** Register a widget type against a lazy-loading function (code-split chunk). */
  registerLazy(type: string, loader: WidgetLoader): void {
    this.loaders.set(type, loader);
  }

  /** Resolve a widget type to its component class, loading (and caching) the chunk on first use. */
  async resolve(type: string): Promise<Type<unknown> | undefined> {
    if (this.resolvedCache.has(type)) {
      return this.resolvedCache.get(type);
    }
    const loader = this.loaders.get(type);
    if (!loader) {
      return undefined;
    }
    const componentType = await loader();
    this.resolvedCache.set(type, componentType);
    return componentType;
  }

  has(type: string): boolean {
    return this.loaders.has(type);
  }
}
