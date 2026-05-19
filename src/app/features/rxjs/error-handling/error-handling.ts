import { Component, signal, OnDestroy } from '@angular/core';
import { EMPTY, Observable, Subject, of, throwError, timer } from 'rxjs';
import { catchError, delay, finalize, map, retry, retryWhen, switchMap, takeUntil, tap } from 'rxjs/operators';
import { CodeBlockComponent } from '../../../shared/components/code-block/code-block';
import { DemoCardComponent } from '../../../shared/components/demo-card/demo-card';

function unreliableApi(failRate = 0.7): Observable<string> {
  return timer(500).pipe(
    map(() => {
      if (Math.random() < failRate) throw new Error('Network error (simulated)');
      return 'API response: success!';
    })
  );
}

@Component({
  selector: 'app-error-handling',
  standalone: true,
  imports: [CodeBlockComponent, DemoCardComponent],
  template: `
    <div class="page-header">
      <h1>🛡️ Error Handling</h1>
      <p>Streams should never die unexpectedly — learn to catch, retry, and recover gracefully.</p>
    </div>

    <div class="grid-2">
      <app-demo-card title="catchError" description="Intercept errors and return a fallback observable">
        <div class="controls">
          <button class="btn-primary" (click)="runCatchError(false)">Run (may fail)</button>
          <button class="btn-danger" (click)="runCatchError(true)">Force Error</button>
        </div>
        @if (catchLoading()) { <div class="badge badge-yellow mt-1">⏳ Loading...</div> }
        <div class="output-box mt-1">
          @if (catchResult()) {
            <div [style.color]="catchResult()!.startsWith('✗') ? 'var(--red)' : 'var(--green)'">{{ catchResult() }}</div>
          }
        </div>
        <app-code-block [code]="catchErrorCode" />
      </app-demo-card>

      <app-demo-card title="retry(n)" description="Automatically re-subscribe N times on error">
        <div class="controls">
          <button class="btn-primary" (click)="runRetry()">Run with retry(3)</button>
        </div>
        <div class="output-box mt-1" style="max-height:150px;overflow-y:auto">
          @for (l of retryLogs(); track $index) {
            <div class="output-line" [style.color]="l.color">{{ l.msg }}</div>
          }
        </div>
        <app-code-block [code]="retryCode" />
      </app-demo-card>

      <app-demo-card title="retryWhen — Exponential Backoff" description="Custom retry strategy: 1s, 2s, 4s delays before each retry">
        <div class="controls">
          <button class="btn-primary" [disabled]="backoffRunning()" (click)="runBackoff()">Run with Backoff</button>
          <button class="btn-danger" (click)="stopBackoff()">Stop</button>
        </div>
        <div class="output-box mt-1" style="max-height:150px;overflow-y:auto">
          @for (l of backoffLogs(); track $index) {
            <div class="output-line" [style.color]="l.color">{{ l.msg }}</div>
          }
        </div>
        <app-code-block [code]="retryWhenCode" />
      </app-demo-card>

      <app-demo-card title="EMPTY & throwError" description="EMPTY completes immediately; throwError creates a failing observable">
        <div class="controls">
          <button class="btn-secondary" (click)="runEmpty()">EMPTY</button>
          <button class="btn-danger" (click)="runThrowError()">throwError</button>
        </div>
        <div class="output-box mt-1" style="max-height:120px;overflow-y:auto">
          @for (l of emptyThrowLogs(); track $index) {
            <div class="output-line" [style.color]="l.color">{{ l.msg }}</div>
          }
        </div>
        <app-code-block [code]="emptyThrowCode" />
      </app-demo-card>

      <app-demo-card title="finalize" description="Always runs on complete or error — like a try/finally">
        <div class="controls">
          <button class="btn-primary" (click)="runFinalize(false)">Run (success)</button>
          <button class="btn-danger" (click)="runFinalize(true)">Run (error)</button>
        </div>
        <div class="output-box mt-1" style="max-height:120px;overflow-y:auto">
          @for (l of finalizeLogs(); track $index) {
            <div class="output-line" [style.color]="l.color">{{ l.msg }}</div>
          }
        </div>
        <app-code-block [code]="finalizeCode" />
      </app-demo-card>
    </div>
  `
})
export class ErrorHandlingComponent implements OnDestroy {
  private destroy$ = new Subject<void>();
  private backoffStop$ = new Subject<void>();

  catchLoading = signal(false);
  catchResult = signal<string | null>(null);
  retryLogs = signal<{ msg: string; color: string }[]>([]);
  backoffLogs = signal<{ msg: string; color: string }[]>([]);
  backoffRunning = signal(false);
  emptyThrowLogs = signal<{ msg: string; color: string }[]>([]);
  finalizeLogs = signal<{ msg: string; color: string }[]>([]);

  private log(sig: ReturnType<typeof signal<{ msg: string; color: string }[]>>, msg: string, color: string) {
    sig.update(l => [...l.slice(-8), { msg, color }]);
  }

  runCatchError(forceError: boolean) {
    this.catchLoading.set(true);
    this.catchResult.set(null);
    const src$ = forceError ? throwError(() => new Error('Forced error')) : unreliableApi(0.5);
    src$.pipe(
      catchError(err => of(`✗ Caught: ${err.message} — using fallback`)),
      finalize(() => this.catchLoading.set(false))
    ).subscribe(result => this.catchResult.set(result));
  }

  runRetry() {
    this.retryLogs.set([]);
    let attempt = 0;
    new Observable<string>(sub => {
      attempt++;
      this.log(this.retryLogs, `Attempt #${attempt}`, 'var(--yellow)');
      if (attempt < 3) {
        setTimeout(() => sub.error(new Error(`Fail on attempt ${attempt}`)), 300);
      } else {
        setTimeout(() => { sub.next('Success!'); sub.complete(); }, 300);
      }
    }).pipe(
      retry(5),
      catchError(err => { this.log(this.retryLogs, `Final error: ${err.message}`, 'var(--red)'); return EMPTY; })
    ).subscribe({
      next: v => this.log(this.retryLogs, `✓ ${v}`, 'var(--green)'),
      complete: () => this.log(this.retryLogs, 'Completed', 'var(--text-muted)'),
    });
  }

  runBackoff() {
    this.backoffLogs.set([]);
    this.backoffRunning.set(true);
    this.backoffStop$ = new Subject<void>();
    let attempt = 0;

    new Observable<string>(sub => {
      attempt++;
      this.log(this.backoffLogs, `Attempt #${attempt}`, 'var(--yellow)');
      if (attempt < 4) {
        setTimeout(() => sub.error(new Error(`Error on attempt ${attempt}`)), 200);
      } else {
        setTimeout(() => { sub.next(`Success after ${attempt} attempts!`); sub.complete(); }, 200);
      }
    }).pipe(
      retryWhen(errors => errors.pipe(
        switchMap((err, i) => {
          const wait = Math.pow(2, i) * 500;
          this.log(this.backoffLogs, `  ↩ Retrying in ${wait}ms...`, 'var(--text-muted)');
          return timer(wait);
        }),
        takeUntil(this.backoffStop$)
      )),
      takeUntil(this.backoffStop$)
    ).subscribe({
      next: v => { this.log(this.backoffLogs, `✓ ${v}`, 'var(--green)'); this.backoffRunning.set(false); },
      error: err => { this.log(this.backoffLogs, `✗ ${err.message}`, 'var(--red)'); this.backoffRunning.set(false); },
    });
  }

  stopBackoff() {
    this.backoffStop$.next();
    this.backoffStop$.complete();
    this.backoffRunning.set(false);
    this.log(this.backoffLogs, 'Stopped by user', 'var(--text-muted)');
  }

  runEmpty() {
    this.log(this.emptyThrowLogs, 'EMPTY.subscribe({ ... })', 'var(--accent)');
    EMPTY.subscribe({
      next: () => this.log(this.emptyThrowLogs, '  next (never called)', 'var(--green)'),
      complete: () => this.log(this.emptyThrowLogs, '  complete ← called immediately', 'var(--text-muted)'),
    });
  }

  runThrowError() {
    this.log(this.emptyThrowLogs, 'throwError(...).subscribe({ ... })', 'var(--accent)');
    throwError(() => new Error('something went wrong')).subscribe({
      next: () => this.log(this.emptyThrowLogs, '  next (never called)', 'var(--green)'),
      error: e => this.log(this.emptyThrowLogs, `  error: ${e.message}`, 'var(--red)'),
    });
  }

  runFinalize(fail: boolean) {
    this.finalizeLogs.set([]);
    this.log(this.finalizeLogs, 'Starting...', 'var(--accent)');
    (fail ? throwError(() => new Error('boom')) : of('result')).pipe(
      delay(300),
      tap(v => this.log(this.finalizeLogs, `next: ${v}`, 'var(--green)')),
      catchError(e => { this.log(this.finalizeLogs, `caught: ${e.message}`, 'var(--red)'); return EMPTY; }),
      finalize(() => this.log(this.finalizeLogs, 'finalize: always runs!', 'var(--yellow)'))
    ).subscribe({ complete: () => this.log(this.finalizeLogs, 'complete', 'var(--text-muted)') });
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

  catchErrorCode = `this.http.get('/api/data').pipe(
  catchError((err: HttpErrorResponse) => {
    if (err.status === 404) return of(null);      // fallback value
    if (err.status === 401) return EMPTY;          // silently complete
    return throwError(() => err);                  // re-throw
  })
).subscribe();`;

  retryCode = `this.http.get('/api/flaky').pipe(
  retry(3),          // retry up to 3 times
  catchError(err => of(fallbackData))
).subscribe();

// retry with delay (RxJS 7+)
retry({ count: 3, delay: 1000 })`;

  retryWhenCode = `// Exponential backoff: 1s, 2s, 4s...
source$.pipe(
  retryWhen(errors =>
    errors.pipe(
      switchMap((err, i) => {
        if (i >= 3) throw err; // give up after 3
        return timer(Math.pow(2, i) * 1000);
      })
    )
  )
)`;

  emptyThrowCode = `// EMPTY — immediately completes, no values
EMPTY.subscribe({ complete: () => console.log('done') });

// Use in catchError as "ignore this error silently"
catchError(() => EMPTY)

// throwError — creates a failing observable
throwError(() => new Error('reason'))

// Use to propagate specific error types
catchError(err =>
  err.status === 503
    ? throwError(() => new ServiceUnavailableError())
    : of(null)
)`;

  finalizeCode = `this.loading = true;

this.http.get('/api/data').pipe(
  finalize(() => this.loading = false) // always runs!
).subscribe({
  next: data => this.data = data,
  error: err => this.error = err
});
// loading = false whether success or error`;
}
