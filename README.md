# Angular & RxJS Learning Lab

[![Deploy to GitHub Pages](https://github.com/olsoybakk/ng-learning/actions/workflows/deploy.yml/badge.svg)](https://github.com/olsoybakk/ng-learning/actions/workflows/deploy.yml)

An interactive learning application showcasing modern Angular 21, RxJS, and Angular Material patterns through live demos and annotated code examples.

**Live demo → [olsoybakk.github.io/ng-learning](https://olsoybakk.github.io/ng-learning/)**

## Topics covered

**Angular**
- Signals — `signal()`, `computed()`, `effect()`, `toSignal()`, `linkedSignal()`
- Control Flow — `@if`, `@for`, `@switch`, `@defer`
- Reactive Forms — `FormControl`, `FormGroup`, `FormArray`, validators
- Pipes, Directives, HTTP Client, Change Detection

**RxJS**
- Subjects — `Subject`, `BehaviorSubject`, `ReplaySubject`, `AsyncSubject`
- Operators — transform, filter, combination, error handling, multicasting
- Custom pipeable operators

**Angular Material (M3)**
- Buttons & Indicators, Form Controls, Data Display, Navigation, Overlays & Feedback

## Getting started

```bash
npm install
npm start       # dev server → http://localhost:4200
npm run build   # production build
npm test        # Vitest unit tests
```

## Tech stack

| | |
|---|---|
| Framework | Angular 21.2 (standalone components, signals, zoneless-ready) |
| Reactive | RxJS 7.8 |
| UI library | Angular Material 21 (M3, violet palette) |
| Tests | Vitest via `@angular/build:unit-test` |
| Styling | SCSS + CSS custom properties, dark/light theme |
| Build | Esbuild via `@angular/build:application` |
| Deploy | GitHub Actions → GitHub Pages |
