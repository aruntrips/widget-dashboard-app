import { TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WidgetRegistryService } from './widget-registry.service';

@Component({ selector: 'app-fake-widget', template: 'fake', changeDetection: ChangeDetectionStrategy.OnPush })
class FakeWidgetComponent {}

describe('WidgetRegistryService', () => {
  let registry: WidgetRegistryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    registry = TestBed.inject(WidgetRegistryService);
  });

  it('resolves a registered lazy type', async () => {
    registry.registerLazy('fake', async () => FakeWidgetComponent);
    const resolved = await registry.resolve('fake');
    expect(resolved).toBe(FakeWidgetComponent);
  });

  it('returns undefined for an unregistered type', async () => {
    const resolved = await registry.resolve('nonexistent');
    expect(resolved).toBeUndefined();
  });

  it('reports registration via has()', () => {
    registry.registerLazy('fake', async () => FakeWidgetComponent);
    expect(registry.has('fake')).toBeTrue();
    expect(registry.has('other')).toBeFalse();
  });

  it('caches a resolved component and only calls the loader once', async () => {
    const loader = jasmine.createSpy('loader').and.resolveTo(FakeWidgetComponent);
    registry.registerLazy('fake', loader);

    await registry.resolve('fake');
    await registry.resolve('fake');

    expect(loader).toHaveBeenCalledTimes(1);
  });
});
