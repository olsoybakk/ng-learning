import { Component, signal, OnDestroy } from '@angular/core';
import { Observable, OperatorFunction, Subject, interval, pipe } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, retry, catchError, takeUntil, tap, switchMap } from 'rxjs/operators';
import { of, EMPTY } from 'rxjs';
import { CodeBlockComponent } from '../../../shared/components/code-block/code-block';
import { DemoCardComponent } from '../../../shared/components/demo-card/demo-card';

function filterNil<T>(): OperatorFunction<T | null | undefined, T> {
  return filter((v): v is T => v != null);
}

function debug<T>(label: string): OperatorFunction<T, T> {
  return tap({
    next: v => console.log(`[${label}] next:`, v),
    error: e => console.error(`[${label}] error:`, e),
    complete: () => console.log(`[${label}] complete`),
  });
}

function pluck<T, K extends keyof T>(key: K): OperatorFunction<T, T[K]> {
  return map(obj => obj[key]);
}

function searchOperator<T>(
  searchFn: (term: string) => Observable<T>,
  debounce = 300
): OperatorFunction<string, T> {
  return pipe(
    debounceTime(debounce),
    distinctUntilChanged(),
    filter(t => t.length >= 2),
    switchMap(term => searchFn(term).pipe(catchError(() => EMPTY)))
  );
}

function rateLimit<T>(count: number, windowMs: number): OperatorFunction<T, T> {
  let emissions = 0;
  let windowStart = Date.now();
  return filter(() => {
    const now = Date.now();
    if (now - windowStart > windowMs) { emissions = 0; windowStart = now; }
    if (emissions < count) { emissions++; return true; }
    return false;
  });
}

@Component({
  selector: 'app-custom-operators',
  standalone: true,
  imports: [CodeBlockComponent, DemoCardComponent],
  template: `
    <div class="page-header">
      <h1>🧩 Custom Operators</h1>
      <p>Write reusable, composable operator functions using <code>OperatorFunction</code> and <code>pipe()</code>.</p>
    </div>

    <div class="grid-2">
      <app-demo-card title="filterNil — Type-safe null filter" description="Removes null/undefined and narrows the TypeScript type">
        <div class="controls">
          @for (v of [null, 1, undefined, 2, null, 3]; track $index) {
            <button class="btn-secondary" style="padding:6px 10px;font-size:0.8rem"
              (click)="emitNullable(v)">
              {{ v === null ? 'null' : v === undefined ? 'undefined' : v }}
            </button>
          }
        </div>
        <div class="output-box mt-1" style="max-height:120px;overflow-y:auto">
          <div style="color:var(--text-muted);font-size:0.8rem">After filterNil():</div>
          @for (v of nilFilteredLog(); track $index) {
            <div class="output-line" style="color:var(--green)">✓ {{ v }}</div>
          }
        </div>
        <app-code-block [code]="filterNilCode" />
      </app-demo-card>

      <app-demo-card title="debug() — Tap Wrapper" description="Non-invasive logging without breaking the pipe">
        <button class="btn-primary" (click)="runDebug()">Run (check console)</button>
        <div class="output-box mt-1">
          <div style="color:var(--text-muted);font-size:0.8rem">Open browser console to see [USER] logs</div>
          <div style="color:var(--green)">{{ debugResult() }}</div>
        </div>
        <app-code-block [code]="debugCode" />
      </app-demo-card>

      <app-demo-card title="pluck() — Extract Property" description="Type-safe property extraction with full inference">
        <div class="controls">
          @for (u of users; track u.id) {
            <button class="btn-secondary" (click)="emitUser(u)">{{ u.name }}</button>
          }
        </div>
        <div class="output-box mt-1">
          <div>Last name: <span style="color:var(--cyan)">{{ pluckedName() }}</span></div>
          <div>Last email: <span style="color:var(--cyan)">{{ pluckedEmail() }}</span></div>
        </div>
        <app-code-block [code]="pluckCode" />
      </app-demo-card>

      <app-demo-card title="searchOperator() — Composed Operator" description="Bundles debounce + distinct + minLength + switchMap into one reusable operator">
        <input
          [value]="searchInput()"
          (input)="onSearch($event)"
          placeholder="Type to search (min 2 chars)..."
          style="width:100%"
        />
        <div class="output-box mt-1">
          <div>Results: <span style="color:var(--green)">{{ searchResults().join(', ') || '—' }}</span></div>
        </div>
        <app-code-block [code]="searchOperatorCode" />
      </app-demo-card>

      <app-demo-card title="Anatomy of an Operator" description="Every operator is just a function: Observable → Observable">
        <app-code-block [code]="anatomyCode" />
      </app-demo-card>

      <app-demo-card title="pipe() — Compose Multiple Operators" description="Build composite operators from primitives">
        <app-code-block [code]="pipeComposeCode" />
      </app-demo-card>
    </div>
  `
})
export class CustomOperatorsComponent implements OnDestroy {
  private destroy$ = new Subject<void>();
  private nullable$ = new Subject<number | null | undefined>();
  private userSource$ = new Subject<{ id: number; name: string; email: string }>();
  private search$ = new Subject<string>();

  nilFilteredLog = signal<(number)[]>([]);
  debugResult = signal('');
  pluckedName = signal('—');
  pluckedEmail = signal('—');
  searchInput = signal('');
  searchResults = signal<string[]>([]);

  users = [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' },
    { id: 3, name: 'Charlie', email: 'charlie@example.com' },
  ];

  constructor() {
    this.nullable$.pipe(filterNil(), takeUntil(this.destroy$))
      .subscribe(v => this.nilFilteredLog.update(l => [...l.slice(-4), v]));

    this.userSource$.pipe(pluck('name'), takeUntil(this.destroy$))
      .subscribe(name => this.pluckedName.set(name));
    this.userSource$.pipe(pluck('email'), takeUntil(this.destroy$))
      .subscribe(email => this.pluckedEmail.set(email));

    this.search$.pipe(
      searchOperator(term => {
        const results = ['Angular', 'RxJS', 'TypeScript', 'Signals', 'Observable', 'HttpClient', 'Reactive Forms']
          .filter(s => s.toLowerCase().includes(term.toLowerCase()));
        return of(results);
      }),
      takeUntil(this.destroy$)
    ).subscribe(results => this.searchResults.set(results as string[]));
  }

  emitNullable(v: number | null | undefined) { this.nullable$.next(v); }

  emitUser(u: { id: number; name: string; email: string }) { this.userSource$.next(u); }

  onSearch(e: Event) {
    const v = (e.target as HTMLInputElement).value;
    this.searchInput.set(v);
    this.search$.next(v);
  }

  runDebug() {
    of({ id: 1, name: 'Alice' }).pipe(
      debug('USER'),
      map(u => u.name.toUpperCase())
    ).subscribe(name => this.debugResult.set(`Result: ${name}`));
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

  filterNilCode = `function filterNil<T>(): OperatorFunction<T | null | undefined, T> {
  return filter((v): v is T => v != null);
}

// Usage — TypeScript knows result is T (not T | null | undefined)
userIds$.pipe(
  filterNil(),
  switchMap(id => this.http.get(\`/users/\${id}\`)) // id is never null here
)`;

  debugCode = `function debug<T>(label: string): OperatorFunction<T, T> {
  return tap({
    next: v => console.log(\`[\${label}] next:\`, v),
    error: e => console.error(\`[\${label}] error:\`, e),
    complete: () => console.log(\`[\${label}] complete\`),
  });
}

// Insert anywhere in a pipe without side effects
this.users$.pipe(
  debug('before-filter'),
  filter(u => u.active),
  debug('after-filter'),
).subscribe();`;

  pluckCode = `function pluck<T, K extends keyof T>(key: K): OperatorFunction<T, T[K]> {
  return map(obj => obj[key]);
}

// Full type inference
users$.pipe(pluck('email')); // Observable<string>
users$.pipe(pluck('id'));    // Observable<number>`;

  searchOperatorCode = `// Bundle common search logic into a reusable operator
function searchOperator<T>(
  searchFn: (term: string) => Observable<T>,
  debounce = 300
): OperatorFunction<string, T> {
  return pipe(
    debounceTime(debounce),
    distinctUntilChanged(),
    filter(t => t.length >= 2),
    switchMap(term =>
      searchFn(term).pipe(catchError(() => EMPTY))
    )
  );
}

// Usage
searchInput$.pipe(
  searchOperator(term => this.api.search(term))
).subscribe(results => this.results = results);`;

  anatomyCode = `// Every operator: (source$: Observable<In>) => Observable<Out>
type OperatorFunction<In, Out> =
  (source: Observable<In>) => Observable<Out>;

// Minimal custom operator
function double(): OperatorFunction<number, number> {
  return source$ =>
    new Observable(subscriber => {
      return source$.subscribe({
        next: v => subscriber.next(v * 2),
        error: e => subscriber.error(e),
        complete: () => subscriber.complete(),
      });
    });
}

// Simpler with existing operators
function double(): OperatorFunction<number, number> {
  return map(v => v * 2);
}`;

  pipeComposeCode = `import { pipe } from 'rxjs';

// Build a composite operator from primitives
function normalizeAndDebounce() {
  return pipe(
    map((s: string) => s.trim().toLowerCase()),
    debounceTime(300),
    distinctUntilChanged(),
    filter(s => s.length >= 2)
  );
}

// Reuse across the app
searchA$.pipe(normalizeAndDebounce()).subscribe();
searchB$.pipe(normalizeAndDebounce()).subscribe();`;
}
