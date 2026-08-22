# Widget Dashboard App

A working Angular (v20, standalone components + signal inputs) scaffold demonstrating the
**widget/dynamic-registry architecture**: a shell app that renders pluggable, lazily-loaded
widgets from a config array, with shared cross-widget state and CSS-token-based theming.

## Setup

This was built without network access, so `node_modules` isn't included. From the project root:

```bash
npm install
npm start        # serves on http://localhost:4200
npm test         # runs unit tests (Karma + Jasmine)
npm run lint     # ESLint + angular-eslint
npm run format   # Prettier, writes changes
```

Requires Node 20.11+ / 22+ and npm 10+ (Angular 20's minimum supported Node baseline).

## CI/CD

A GitHub Actions pipeline (`.github/workflows/ci.yml`) runs on every push/PR to
`main`:

1. **Lint & format** — `eslint .` (with `angular-eslint`'s recommended +
   template-accessibility rules) and `prettier --check .`
2. **Unit tests** — `ng test` in headless Chrome with coverage
3. **Production build** — only runs once lint and tests pass

This mirrors a real team's quality gate: nothing merges to `main` without
passing lint, formatting, and tests first — the same setup described in the
"CI/CD & Code Quality Setup" service line of this project's author.

## Code quality conventions

- Every component uses `ChangeDetectionStrategy.OnPush` — enforced by an
  ESLint rule (`@angular-eslint/prefer-on-push-component-change-detection`),
  not just convention. Combined with signal inputs, this means Angular only
  re-renders a component when one of its signals actually changes.
- ESLint config: `eslint.config.js` (flat config, `angular-eslint` +
  `typescript-eslint` recommended rulesets, plus template accessibility
  checks).
- Prettier config: `.prettierrc.json` (single quotes, 110-char print width,
  Angular HTML parser for template files).

Requires Node 20.11+ / 22+ and npm 10+ (Angular 20's minimum supported Node baseline).

## Notes on the v18 → v20 upgrade

- All `@angular/*` packages bumped to `^20.0.0`, `zone.js` to `~0.15.0`, `typescript` to `~5.8.0`.
- `standalone: true` removed from every `@Component` — standalone has been the default since v19,
  so the flag is now redundant.
- Every widget's `@Input()` was converted to the signal-based `input()` API (`config = input.required<WidgetConfig>()`),
  which has been the recommended pattern since v17.1 and is the v20 convention. Templates and
  internal logic now read `this.config()` instead of `this.config`.
- `WidgetLoaderComponent` no longer implements `OnChanges` — it uses an `effect()` that reacts to
  the `config` signal directly, which is the more idiomatic replacement for input-driven lifecycle
  hooks.
- Test specs were updated to use `fixture.componentRef.setInput(...)` everywhere (this already
  works with signal inputs, but the widget-loader spec previously set `fixture.componentInstance.config`
  directly, which only worked with decorator-based inputs).

If you'd rather run the actual guided migration schematics locally instead of applying these
diffs by hand, this is the real command:

```bash
npx @angular/cli@20 update @angular/core@20 @angular/cli@20
```

Run it one major version at a time if you're starting from something older than 19
(`ng update` won't skip majors), and commit between each step so you can bisect if something breaks.

## Architecture at a glance

```
src/app/
  core/
    models/widget-config.model.ts   // the WidgetConfig contract every widget implements
    widget-registry.service.ts      // type -> lazy-loaded component map
    widget-loader.component.ts      // dynamic host, renders whatever type a config asks for
    dashboard-state.service.ts      // shared signals: filters, per-widget data cache, selection
    register-widgets.ts             // one place to register every widget type + its import()
    theme/theme.service.ts          // runtime light/dark theme switching
  widgets/
    kpi-widget/                     // metric card, supports per-instance accent override
    chart-widget/                   // SVG bar chart, emits selection on bar click
    table-widget/                   // reacts to another widget's selection, zero direct coupling
  dashboard/
    dashboard.component.ts          // owns the WidgetConfig[] array, renders via WidgetLoaderComponent
  widget-testing/
    mock-dashboard-state.ts         // shared stub factory so every widget spec stays consistent
```

## What this demonstrates

- **Dynamic widget rendering** — `WidgetLoaderComponent` uses `NgComponentOutlet` + the registry
  to render any widget type from a plain config object, with each widget type code-split into
  its own lazy chunk via `import()`.
- **Cross-widget communication without direct coupling** — click a bar in the chart widget and
  the table widget highlights the matching row, purely by both reading `DashboardStateService`'s
  `selection` signal. Neither widget references the other.
- **Shared, filter-driven refetching** — changing the region dropdown updates a shared `filters`
  signal; every widget's `effect()` reacts and refetches automatically.
- **CSS custom-property theming** — every widget consumes semantic tokens (`--widget-bg`,
  `--widget-accent`, etc.) defined once in `src/styles.css`. Toggling the theme button flips
  `data-theme` on `<html>`, and every widget re-themes with zero widget-level code. The KPI
  widgets also show the **per-instance override** pattern via `config.settings.accentColor`.
- **Isolated, mockable widget tests** — each widget's spec stubs `DashboardStateService` via the
  shared `createMockDashboardState()` helper rather than depending on the real service, keeping
  tests fast and widgets testable in isolation.

## Extending it

To add a new widget type:
1. Create `src/app/widgets/my-widget/my-widget.component.ts` implementing `WidgetConfig` as its
   `@Input()`.
2. Add one line to `register-widgets.ts`:
   ```ts
   registry.registerLazy('my-widget', () =>
     import('../widgets/my-widget/my-widget.component').then((m) => m.MyWidgetComponent)
   );
   ```
3. Add a `{ id, type: 'my-widget', title }` entry to the `widgets` signal in
   `dashboard.component.ts` (or, in a real app, return it from your backend's dashboard-layout
   endpoint).

No changes to the dashboard shell or loader are needed.
