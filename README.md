# Widget Dashboard App

A working Angular 20 application demonstrating a **widget-based dynamic registry architecture**: a shell app renders pluggable, lazily loaded widgets from configuration, with shared cross-widget state and CSS-token-based theming.

The project combines two related concerns:

* a reference implementation of a widget-based Angular architecture
* a practical study of the changes involved in moving that application from Angular 18 to Angular 20

The widget architecture provides the real application context for the upgrade work, while the upgrade provides a concrete example of how modern Angular APIs and conventions affect an existing application.

## Setup

From the project root:

```bash
npm install
npm start        # serves on http://localhost:4200
npm test         # runs unit tests
npm run lint     # ESLint + angular-eslint
npm run format   # Prettier, writes changes
```

Requires Node 20.11+ or 22+ and npm 10+.

## CI/CD

A GitHub Actions pipeline (`.github/workflows/ci.yml`) runs on every push and pull request to `main`.

1. **Lint & format** — ESLint, `angular-eslint`, and Prettier
2. **Unit tests** — Karma/Jasmine in headless Chrome with coverage
3. **Production build** — runs only after lint and tests pass

The pipeline makes these checks an automated quality gate rather than a local convention.

## Code quality conventions

* Every component uses `ChangeDetectionStrategy.OnPush`, enforced by `@angular-eslint/prefer-on-push-component-change-detection`.
* ESLint uses the flat configuration with `angular-eslint` and `typescript-eslint`.
* Template accessibility rules are enabled.
* Prettier enforces consistent formatting.

## Notes on the Angular 18 → 20 upgrade

The repository is published in its Angular 20 state; the public commit history does not attempt to preserve every intermediate Angular major as a separate migration commit.

The upgrade work included:

* upgrading the Angular framework and CLI packages to v20
* updating TypeScript and `zone.js`
* removing explicit `standalone: true` declarations
* converting widget inputs from decorator-based `@Input()` to the signal-based `input()` API
* replacing `OnChanges` handling in `WidgetLoaderComponent` with reactive `effect()` logic
* updating tests to use `fixture.componentRef.setInput(...)`

The resulting application is therefore useful as a concrete reference for the architectural and code-level changes involved in modernizing an Angular application.

For a project currently on Angular 18, perform the upgrade through the supported intermediate major rather than treating the command below as an 18 → 20 shortcut:

```bash
npx @angular/cli@19 update @angular/core@19 @angular/cli@19
npx @angular/cli@20 update @angular/core@20 @angular/cli@20
```

Commit between major-version upgrades so that changes can be isolated and diagnosed if something breaks.

## Architecture at a glance

```text
src/app/
  core/
    models/widget-config.model.ts    # WidgetConfig contract
    widget-registry.service.ts       # widget type → lazy component map
    widget-loader.component.ts       # dynamic widget host
    dashboard-state.service.ts       # shared signal-based state
    register-widgets.ts              # widget registrations + lazy imports
    theme/theme.service.ts           # runtime theme switching

  widgets/
    kpi-widget/                      # metric card
    chart-widget/                    # SVG bar chart
    table-widget/                    # selection-aware table

  dashboard/
    dashboard.component.ts            # owns the widget configuration

  widget-testing/
    mock-dashboard-state.ts          # shared test stub factory
```

The important boundary is:

**configuration → registry → lazy widget → shared state**

Individual widgets do not need direct knowledge of one another.

## What this demonstrates

### Dynamic widget rendering

`WidgetLoaderComponent` uses `NgComponentOutlet` and the registry to render a widget from configuration.

Each widget type is lazy-loaded through `import()` and can therefore be code-split independently.

### Cross-widget communication without direct coupling

The chart widget updates selection through `DashboardStateService`.

The table widget reacts to the same `selection` signal without referencing the chart widget directly.

### Shared reactive state

Dashboard filters are held in signals. Widgets react to changes in the shared filter state and update their data accordingly.

### CSS-token-based theming

Widgets consume semantic CSS custom properties such as `--widget-bg` and `--widget-accent`.

Changing `data-theme` on `<html>` switches the theme without requiring widget-specific theme logic.

The KPI widget also demonstrates a per-instance styling override through its configuration.

### Isolated widget tests

Widget tests use `createMockDashboardState()` to provide a consistent stub for `DashboardStateService`, keeping individual widgets testable in isolation.

## Extending it

To add a new widget type:

1. Create `src/app/widgets/my-widget/my-widget.component.ts` using the `WidgetConfig` contract and signal inputs.

2. Register it in `register-widgets.ts`:

```typescript
registry.registerLazy('my-widget', () =>
  import('../widgets/my-widget/my-widget.component').then((m) => m.MyWidgetComponent)
);
```

3. Add a configuration entry to the dashboard:

```typescript
{ id: 'widget-4', type: 'my-widget', title: 'My Widget' }
```

No changes to the dashboard shell or loader are required.

In a production application, the widget configuration could instead come from a backend dashboard-layout endpoint.

## Key takeaway

A widget architecture becomes useful when its boundaries are explicit:

**configuration → registry → lazy widget → shared state**

The dashboard shell does not need to know how individual widgets work, and widgets do not need direct knowledge of one another.

That makes the architecture easier to extend, test, and evolve independently.
