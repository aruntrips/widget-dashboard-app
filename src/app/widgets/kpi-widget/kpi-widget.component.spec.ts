import { TestBed } from '@angular/core/testing';
import { KpiWidgetComponent } from './kpi-widget.component';
import { DashboardStateService } from '../../core/dashboard-state.service';
import { createMockDashboardState } from '../../widget-testing/mock-dashboard-state';

describe('KpiWidgetComponent', () => {
  it('shows loading state before data arrives', () => {
    const stateStub = createMockDashboardState();

    TestBed.configureTestingModule({
      imports: [KpiWidgetComponent],
      providers: [{ provide: DashboardStateService, useValue: stateStub }],
    });

    const fixture = TestBed.createComponent(KpiWidgetComponent);
    fixture.componentRef.setInput('config', { id: 'kpi-1', type: 'kpi', title: 'Revenue' });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Loading');
  });

  it('renders the value once widget data resolves to success', () => {
    const stateStub = createMockDashboardState({
      widgetData: { 'kpi-1': { status: 'success', data: { value: 4200, trend: 'up', deltaPct: 5 } } },
    });

    TestBed.configureTestingModule({
      imports: [KpiWidgetComponent],
      providers: [{ provide: DashboardStateService, useValue: stateStub }],
    });

    const fixture = TestBed.createComponent(KpiWidgetComponent);
    fixture.componentRef.setInput('config', { id: 'kpi-1', type: 'kpi', title: 'Revenue' });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('4,200');
    expect(fixture.nativeElement.textContent).toContain('5%');
  });

  it('applies a per-instance accent color override from config.settings', () => {
    const stateStub = createMockDashboardState({
      widgetData: { 'kpi-1': { status: 'success', data: { value: 100, trend: 'flat', deltaPct: 0 } } },
    });

    TestBed.configureTestingModule({
      imports: [KpiWidgetComponent],
      providers: [{ provide: DashboardStateService, useValue: stateStub }],
    });

    const fixture = TestBed.createComponent(KpiWidgetComponent);
    fixture.componentRef.setInput('config', {
      id: 'kpi-1',
      type: 'kpi',
      title: 'Orders',
      settings: { accentColor: '#16a34a' },
    });
    fixture.detectChanges();

    const host = fixture.nativeElement.querySelector('.kpi-widget') as HTMLElement;
    expect(host.style.getPropertyValue('--widget-accent')).toBe('#16a34a');
  });
});
