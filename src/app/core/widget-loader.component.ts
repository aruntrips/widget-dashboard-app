import { ChangeDetectionStrategy, Component, Type, effect, input, signal } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { WidgetRegistryService } from './widget-registry.service';
import { WidgetConfig } from './models/widget-config.model';

@Component({
  selector: 'app-widget-loader',
  imports: [NgComponentOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (componentType()) {
      <ng-container *ngComponentOutlet="componentType()!; inputs: { config: config() }" />
    } @else if (notFound()) {
      <div class="widget-fallback">
        Unknown widget type: <strong>{{ config().type }}</strong>
      </div>
    }
  `,
  styles: [
    `
      .widget-fallback {
        padding: var(--widget-padding);
        border: 1px dashed var(--widget-border);
        border-radius: var(--radius-md);
        color: var(--widget-muted-color);
        font-size: 0.9rem;
      }
    `,
  ],
})
export class WidgetLoaderComponent {
  /** Signal input (v17.1+ API, the v20 default convention) replacing @Input(). */
  config = input.required<WidgetConfig>();

  componentType = signal<Type<unknown> | undefined>(undefined);
  notFound = signal(false);

  constructor(private registry: WidgetRegistryService) {
    // Re-resolves whenever `config()` (specifically its type) changes,
    // replacing the old ngOnChanges lifecycle hook.
    effect(() => {
      const cfg = this.config();
      this.registry.resolve(cfg.type).then((resolved) => {
        this.componentType.set(resolved);
        this.notFound.set(!resolved);
      });
    });
  }
}
