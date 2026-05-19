import { Component, signal, OnDestroy } from '@angular/core';
import {
  Subject, interval, of, from, timer, Observable
} from 'rxjs';
import {
  map, switchMap, mergeMap, concatMap, exhaustMap,
  scan, reduce, take, delay, tap
} from 'rxjs/operators';
import { CodeBlockComponent } from '../../../shared/components/code-block/code-block';
import { DemoCardComponent } from '../../../shared/components/demo-card/demo-card';

function fakeApiCall(id: number): Observable<string> {
  const duration = Math.random() * 800 + 200;
  return timer(duration).pipe(map(() => `result-${id} (${Math.round(duration)}ms)`));
}

@Component({
  selector: 'app-transform-operators',
  standalone: true,
  imports: [CodeBlockComponent, DemoCardComponent],
  template: `
    <div class="page-header">
      <h1>🔁 Transform Operators</h1>
      <p>The most critical operators — understanding <strong>switchMap</strong>, <strong>mergeMap</strong>, <strong>concatMap</strong>, and <strong>exhaustMap</strong> is key to mastering RxJS.</p>
    </div>

    <div class="grid-2">
      <app-demo-card title="switchMap — Cancel previous" description="Cancels in-flight inner observable when new value arrives. Use for: search, navigation">
        <div class="controls">
          <button class="btn-primary" (click)="switchTrigger$.next(++switchCount)">Trigger (rapid → cancels prev)</button>
          <button class="btn-danger" (click)="switchLogs.set([])">Clear</button>
        </div>
        <div class="output-box mt-1" style="max-height:130px;overflow-y:auto">
          @for (l of switchLogs(); track $index) {
            <div class="output-line" [style.color]="l.color">{{ l.msg }}</div>
          }
        </div>
        <app-code-block [code]="switchMapCode" />
      </app-demo-card>

      <app-demo-card title="mergeMap — Concurrent" description="Runs all inner observables concurrently. Use for: parallel HTTP calls, uploads">
        <div class="controls">
          <button class="btn-primary" (click)="mergeTrigger$.next(++mergeCount)">Trigger (concurrent)</button>
          <button class="btn-danger" (click)="mergeLogs.set([])">Clear</button>
        </div>
        <div class="output-box mt-1" style="max-height:130px;overflow-y:auto">
          @for (l of mergeLogs(); track $index) {
            <div class="output-line" [style.color]="l.color">{{ l.msg }}</div>
          }
        </div>
        <app-code-block [code]="mergeMapCode" />
      </app-demo-card>

      <app-demo-card title="concatMap — Sequential" description="Queues inner observables, runs in order. Use for: ordered mutations, animations">
        <div class="controls">
          <button class="btn-primary" (click)="concatTrigger$.next(++concatCount)">Trigger (queued)</button>
          <button class="btn-danger" (click)="concatLogs.set([])">Clear</button>
        </div>
        <div class="output-box mt-1" style="max-height:130px;overflow-y:auto">
          @for (l of concatLogs(); track $index) {
            <div class="output-line" [style.color]="l.color">{{ l.msg }}</div>
          }
        </div>
        <app-code-block [code]="concatMapCode" />
      </app-demo-card>

      <app-demo-card title="exhaustMap — Ignore while busy" description="Ignores new triggers while inner is running. Use for: form submit, login">
        <div class="controls">
          <button class="btn-primary" (click)="exhaustTrigger$.next(++exhaustCount)">Submit (ignores while busy)</button>
          <button class="btn-danger" (click)="exhaustLogs.set([])">Clear</button>
        </div>
        <div class="output-box mt-1" style="max-height:130px;overflow-y:auto">
          @for (l of exhaustLogs(); track $index) {
            <div class="output-line" [style.color]="l.color">{{ l.msg }}</div>
          }
        </div>
        <app-code-block [code]="exhaustMapCode" />
      </app-demo-card>

      <app-demo-card title="scan — Running Accumulator" description="Like Array.reduce but emits each intermediate value">
        <div class="controls">
          <button class="btn-success" (click)="scanSubject$.next(1)">+1</button>
          <button class="btn-danger" (click)="scanSubject$.next(-1)">-1</button>
          <button class="btn-secondary" (click)="scanSubject$.next(0); scanReset$.next(0)">Reset</button>
        </div>
        <div class="output-box mt-1">
          <div>Running total: <span style="color:var(--accent);font-size:1.3rem;font-weight:700">{{ scanTotal() }}</span></div>
          <div style="font-size:0.8rem;color:var(--text-muted)">History: {{ scanHistory().join(' → ') }}</div>
        </div>
        <app-code-block [code]="scanCode" />
      </app-demo-card>

      <app-demo-card title="map — Transform Values" description="Pure transformation of each emitted value">
        <div class="output-box">
          <div>from([1,2,3,4,5])</div>
          <div style="color:var(--text-muted)">  |> map(x => x * x)</div>
          <div style="color:var(--cyan)">  = [{{ squares.join(', ') }}]</div>
          <br/>
          <div>of('Hello', 'World')</div>
          <div style="color:var(--text-muted)">  |> map(s => s.toUpperCase())</div>
          <div style="color:var(--cyan)">  = [{{ uppercased.join(', ') }}]</div>
        </div>
        <app-code-block [code]="mapCode" />
      </app-demo-card>
    </div>
  `
})
export class TransformOperatorsComponent implements OnDestroy {
  switchTrigger$ = new Subject<number>();
  mergeTrigger$ = new Subject<number>();
  concatTrigger$ = new Subject<number>();
  exhaustTrigger$ = new Subject<number>();
  scanSubject$ = new Subject<number>();
  scanReset$ = new Subject<number>();

  switchCount = 0;
  mergeCount = 0;
  concatCount = 0;
  exhaustCount = 0;

  switchLogs = signal<{ msg: string; color: string }[]>([]);
  mergeLogs = signal<{ msg: string; color: string }[]>([]);
  concatLogs = signal<{ msg: string; color: string }[]>([]);
  exhaustLogs = signal<{ msg: string; color: string }[]>([]);

  scanTotal = signal(0);
  scanHistory = signal<number[]>([0]);

  squares: number[] = [];
  uppercased: string[] = [];

  private log(sig: ReturnType<typeof signal<{ msg: string; color: string }[]>>, msg: string, color: string) {
    sig.update(l => [{ msg, color }, ...l.slice(0, 8)]);
  }

  constructor() {
    // switchMap
    this.switchTrigger$.pipe(
      tap(id => this.log(this.switchLogs, `▶ #${id} started (cancels prev)`, 'var(--accent)')),
      switchMap(id => fakeApiCall(id).pipe(
        tap(() => this.log(this.switchLogs, `✓ #${id} complete`, 'var(--green)'))
      ))
    ).subscribe(result => this.log(this.switchLogs, `  → ${result}`, 'var(--cyan)'));

    // mergeMap
    this.mergeTrigger$.pipe(
      tap(id => this.log(this.mergeLogs, `▶ #${id} started (concurrent)`, 'var(--accent)')),
      mergeMap(id => fakeApiCall(id).pipe(
        tap(() => this.log(this.mergeLogs, `✓ #${id} complete`, 'var(--green)'))
      ))
    ).subscribe(result => this.log(this.mergeLogs, `  → ${result}`, 'var(--cyan)'));

    // concatMap
    this.concatTrigger$.pipe(
      tap(id => this.log(this.concatLogs, `▶ #${id} queued`, 'var(--yellow)')),
      concatMap(id => fakeApiCall(id).pipe(
        tap(() => this.log(this.concatLogs, `✓ #${id} complete`, 'var(--green)'))
      ))
    ).subscribe(result => this.log(this.concatLogs, `  → ${result}`, 'var(--cyan)'));

    // exhaustMap
    this.exhaustTrigger$.pipe(
      tap(id => this.log(this.exhaustLogs, `▶ #${id} attempted`, 'var(--yellow)')),
      exhaustMap(id => fakeApiCall(id).pipe(
        tap(() => this.log(this.exhaustLogs, `✓ #${id} done`, 'var(--green)'))
      ))
    ).subscribe(result => this.log(this.exhaustLogs, `  → ${result}`, 'var(--cyan)'));

    // scan
    this.scanSubject$.pipe(
      scan((acc, val) => val === 0 ? 0 : acc + val, 0)
    ).subscribe(total => {
      this.scanTotal.set(total);
      this.scanHistory.update(h => [...h.slice(-6), total]);
    });

    // map examples
    from([1, 2, 3, 4, 5]).pipe(map(x => x * x)).subscribe(v => this.squares.push(v));
    of('Hello', 'World').pipe(map(s => s.toUpperCase())).subscribe(v => this.uppercased.push(v));
  }

  ngOnDestroy() {
    [this.switchTrigger$, this.mergeTrigger$, this.concatTrigger$, this.exhaustTrigger$, this.scanSubject$].forEach(s => s.complete());
  }

  switchMapCode = `// typeahead search — cancel stale requests
searchInput$.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(term => this.api.search(term)) // cancels previous
).subscribe(results => this.results = results);`;

  mergeMapCode = `// upload multiple files in parallel
selectedFiles$.pipe(
  mergeMap(file => this.upload(file)) // all concurrent
).subscribe(progress => this.updateProgress(progress));`;

  concatMapCode = `// ordered DB writes — previous must finish first
actions$.pipe(
  concatMap(action => this.db.save(action)) // sequential queue
).subscribe();`;

  exhaustMapCode = `// prevent double-submit on login
loginBtn$.pipe(
  exhaustMap(() => this.auth.login(creds)) // ignores clicks while in-flight
).subscribe(user => this.router.navigate(['/home']));`;

  scanCode = `// running total
clicks$.pipe(
  scan((total, n) => total + n, 0)
).subscribe(total => this.displayTotal(total));

// collect into array
events$.pipe(
  scan((acc, e) => [...acc, e], [])
).subscribe(history => this.history = history);`;

  mapCode = `from([1, 2, 3]).pipe(
  map(x => x * x)          // [1, 4, 9]
);

http.get('/user').pipe(
  map(res => res.data),     // pluck nested field
  map(user => ({            // transform shape
    name: user.full_name,
    email: user.email_address
  }))
);`;
}
