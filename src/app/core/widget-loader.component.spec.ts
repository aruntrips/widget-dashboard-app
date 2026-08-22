import { TestBed } from '@angular/core/testing';
import { Component, input } from '@angular/core';
import { WidgetLoaderComponent } from './widget-loader.component';
import { WidgetRegistryService } from './widget-registry.service';

@Component({ selector: 'fake-widget', template: '<span>fake widget rendered</span>' })
class FakeWidgetComponent {
  config = input<unknown>();
}

describe('WidgetLoaderComponent', () => {
  let registry: WidgetRegistryService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [WidgetLoaderComponent] });
    registry = TestBed.inject(WidgetRegistryService);
  });

  it('renders the resolved component for a registered type', async () => {
    registry.registerLazy('fake', async () => FakeWidgetComponent);

    const fixture = TestBed.createComponent(WidgetLoaderComponent);
    fixture.componentRef.setInput('config', { id: 'w1', type: 'fake', title: 'Fake' });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('fake widget rendered');
  });

  it('renders a fallback message for an unregistered type', async () => {
    const fixture = TestBed.createComponent(WidgetLoaderComponent);
    fixture.componentRef.setInput('config', { id: 'w2', type: 'unknown-type', title: 'Unknown' });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Unknown widget type');
    expect(fixture.nativeElement.textContent).toContain('unknown-type');
  });
});
