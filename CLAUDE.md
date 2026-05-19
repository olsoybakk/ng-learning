# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**NgLearning** is an interactive Angular 21.2 learning application with live demos for Angular features and RxJS patterns. It is structured as a standalone-component SPA with lazy-loaded feature routes organized into two categories: Angular topics and RxJS topics.

## Commands

```bash
npm start        # Dev server → http://localhost:4200
npm run build    # Production build
npm run watch    # Watch mode (development config)
npm test         # Run unit tests with Vitest (via Angular CLI)
```

## Architecture

### Structure

```
src/app/
├── app.ts / app.routes.ts / app.config.ts  # Root component, routing, providers
├── features/
│   ├── home/
│   ├── angular/    # signals, control-flow, reactive-forms, pipes, directives, http-client, change-detection
│   ├── rxjs/       # subjects, transform-operators, filter-operators, combination-operators,
│   │               # error-handling, multicasting, custom-operators
│   └── material/   # buttons, form-controls, data-display, navigation, overlays
└── shared/components/
    ├── code-block/ # Syntax-highlighted code display with copy button (regex-based, no external lib)
    └── demo-card/  # Card wrapper using ng-content
```

### Key Patterns

- **Standalone components throughout** — no NgModules anywhere.
- **Lazy-loaded routes** via `loadComponent()`.
- **Signals for UI state, RxJS for async** — local state (counters, flags, logs) uses `signal()` / `computed()`; HTTP calls and timer-based flows use RxJS observables.
- **`inject()` over constructor injection** — all service dependencies use the `inject()` function.
- **Functional HTTP interceptors** (`HttpInterceptorFn`), not class-based.

### Design System

All styling uses CSS custom properties defined in `src/styles.scss` under `:root` (dark theme). Key tokens:
- Surfaces: `--bg`, `--surface`, `--surface-2`, `--border`
- Accent/semantic: `--accent`, `--green`, `--yellow`, `--red`, `--blue`, `--cyan`
- Typography: `--text`, `--text-muted`, `--font-mono`

Global utility classes in `styles.scss`: `.btn-primary/secondary/success/danger`, `.controls`, `.output-box`, `.output-line`, `.page-header`, `.grid-2`, `.mt-1/.mt-2`.

## Angular Material

Installed as `@angular/material@^21` + `@angular/animations@^21`. Theme is configured via SCSS in `src/styles.scss` using `mat.define-theme()` (M3 dark, violet palette, Inter font). `provideAnimationsAsync()` is registered in `app.config.ts`.

Material Icons font is loaded in `index.html` (ligature-based, classic icon set).

**Topic components** under `src/app/features/material/`:
| Route | Component | Key imports |
|---|---|---|
| `/material/buttons` | MatButtonsComponent | MatButtonModule, MatIconModule, MatChipsModule, MatProgressBarModule, MatBadgeModule |
| `/material/form-controls` | MatFormControlsComponent | MatFormFieldModule, MatInputModule, MatSelectModule, MatCheckboxModule, MatRadioModule, MatSliderModule, MatSlideToggleModule |
| `/material/data-display` | MatDataDisplayComponent | MatTableModule + MatTableDataSource, MatSortModule, MatPaginatorModule, MatCardModule, MatListModule |
| `/material/navigation` | MatNavigationComponent | MatTabsModule, MatExpansionModule, MatStepperModule |
| `/material/overlays` | MatOverlaysComponent | MatTooltipModule, MatMenuModule, MatSnackBar (service), MatDialog (service) |

**Non-obvious patterns:**
- `MatTableDataSource` with `MatSort` and `MatPaginator` requires `@ViewChild` + wiring in `ngAfterViewInit`.
- Dialog components (passed to `MatDialog.open()`) must be standalone and can be defined in the same file as the opener. They receive data via `inject(MAT_DIALOG_DATA)` and return results via `[mat-dialog-close]="value"`.
- `MatSlider` in M3 uses `<input matSliderThumb />` inside `<mat-slider>` for single thumb, and `matSliderStartThumb` / `matSliderEndThumb` for range.
- The material section uses `FormsModule` (for `ngModel` on mat-checkbox, mat-slide-toggle) alongside `ReactiveFormsModule`.

## Testing

Uses Vitest via Angular's `@angular/build:unit-test` builder (no separate `vitest.config.ts`). Tests live alongside source as `*.spec.ts`.

## Notes

- No ESLint configured; TypeScript strict mode is the primary guard.
- The Angular/RxJS sections use no external UI library — vanilla CSS and regex-based highlighting. The Material section is the exception, using `@angular/material`.
- Material component styles come from the global M3 dark theme in `styles.scss`, not from component-level style budgets.
