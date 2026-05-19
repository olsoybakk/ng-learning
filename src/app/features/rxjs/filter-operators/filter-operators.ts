import { Component, signal, OnDestroy } from '@angular/core';
import { Subject, from, interval } from 'rxjs';
import {
  debounceTime, distinctUntilChanged, filter, first, last,
  skip, take, takeUntil, throttleTime
} from 'rxjs/operators';
import { CodeBlockComponent } from '../../../shared/components/code-block/code-block';
import { DemoCardComponent } from '../../../shared/components/demo-card/demo-card';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filter-operators',
  standalone: true,
  imports: [CodeBlockComponent, DemoCardComponent, FormsModule],
  template: `
    <div class="page-header">
      <h1>🔍 Filter Operators</h1>
      <p>Control which values pass through and when — essential for user input handling.</p>
    </div>

    <div class="grid-2">
      <app-demo-card title="debounceTime vs throttleTime" description="debounce waits for silence; throttle emits at most once per window">
        <input
          [value]="inputValue()"
          (input)="onInput($event)"
          placeholder="Type rapidly..."
          style="width:100%"
        />
        <div class="output-box mt-1">
          <div>Raw events: <span style="color:var(--red)">{{ rawCount() }}</span></div>
          <div>debounce(400ms): <span style="color:var(--green)">"{{ debounced() }}"</span></div>
          <div>throttle(400ms): <span style="color:var(--yellow)">"{{ throttled() }}"</span></div>
        </div>
        <app-code-block [code]="debounceCode" />
      </app-demo-card>

      <app-demo-card title="distinctUntilChanged" description="Only emits when value is different from the previous">
        <div class="controls">
          @for (v of ['A', 'A', 'B', 'B', 'A', 'C']; track $index) {
            <button class="btn-secondary" (click)="emitDistinct(v)">{{ v }}</button>
          }
          <button class="btn-danger" (click)="distinctLogs.set([])">Clear</button>
        </div>
        <div class="output-box mt-1" style="max-height:120px;overflow-y:auto">
          @for (l of distinctLogs(); track $index) {
            <div class="output-line" [style.color]="l.color">{{ l.msg }}</div>
          }
        </div>
        <app-code-block [code]="distinctCode" />
      </app-demo-card>

      <app-demo-card title="filter" description="Only passes values that satisfy the predicate">
        <div class="controls">
          @for (n of [1,2,3,4,5,6,7,8,9,10]; track n) {
            <button class="btn-secondary" style="padding:6px 10px;font-size:0.8rem" (click)="emitNumber(n)">{{ n }}</button>
          }
        </div>
        <div class="output-box mt-1">
          <div>All: <span style="color:var(--text-muted)">{{ allNumbers().join(', ') }}</span></div>
          <div>Even: <span style="color:var(--green)">{{ evenNumbers().join(', ') }}</span></div>
          <div>&gt;5: <span style="color:var(--cyan)">{{ bigNumbers().join(', ') }}</span></div>
        </div>
        <app-code-block [code]="filterCode" />
      </app-demo-card>

      <app-demo-card title="take, skip, first, last" description="Limit the number of emissions or select specific positions">
        <button class="btn-primary" (click)="runTakeSkip()">Run Demo</button>
        <div class="output-box mt-1" style="max-height:140px;overflow-y:auto">
          @for (l of takeSkipLogs(); track $index) {
            <div class="output-line" [style.color]="l.color">{{ l.msg }}</div>
          }
        </div>
        <app-code-block [code]="takeSkipCode" />
      </app-demo-card>

      <app-demo-card title="takeUntil" description="The idiomatic way to unsubscribe — complete when a signal fires">
        <div class="controls">
          <button class="btn-primary" [disabled]="timerRunning()" (click)="startTimer()">Start Timer</button>
          <button class="btn-danger" [disabled]="!timerRunning()" (click)="stopTimer()">Stop (takeUntil)</button>
        </div>
        <div class="output-box mt-1">
          <div>Ticks: <span style="color:var(--yellow)">{{ timerTicks() }}</span></div>
          <div style="color: {{ timerRunning() ? 'var(--green)' : 'var(--text-muted)' }}">
            {{ timerRunning() ? '● Running' : '■ Stopped' }}
          </div>
        </div>
        <app-code-block [code]="takeUntilCode" />
      </app-demo-card>
    </div>
  `
})
export class FilterOperatorsComponent implements OnDestroy {
  private destroy$ = new Subject<void>();
  private input$ = new Subject<string>();
  private timerStop$ = new Subject<void>();

  inputValue = signal('');
  rawCount = signal(0);
  debounced = signal('');
  throttled = signal('');

  distinctSource$ = new Subject<string>();
  distinctLogs = signal<{ msg: string; color: string }[]>([]);

  numbers$ = new Subject<number>();
  allNumbers = signal<number[]>([]);
  evenNumbers = signal<number[]>([]);
  bigNumbers = signal<number[]>([]);

  takeSkipLogs = signal<{ msg: string; color: string }[]>([]);

  timerRunning = signal(false);
  timerTicks = signal(0);

  constructor() {
    this.input$.pipe(
      debounceTime(400),
      takeUntil(this.destroy$)
    ).subscribe(v => this.debounced.set(v));

    this.input$.pipe(
      throttleTime(400),
      takeUntil(this.destroy$)
    ).subscribe(v => this.throttled.set(v));

    this.distinctSource$.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(v => {
      this.distinctLogs.update(l => [{ msg: `✓ Passed through: "${v}"`, color: 'var(--green)' }, ...l.slice(0, 8)]);
    });

    this.numbers$.pipe(takeUntil(this.destroy$)).subscribe(n => this.allNumbers.update(a => [...a, n]));
    this.numbers$.pipe(filter(n => n % 2 === 0), takeUntil(this.destroy$)).subscribe(n => this.evenNumbers.update(a => [...a, n]));
    this.numbers$.pipe(filter(n => n > 5), takeUntil(this.destroy$)).subscribe(n => this.bigNumbers.update(a => [...a, n]));
  }

  onInput(e: Event) {
    const v = (e.target as HTMLInputElement).value;
    this.inputValue.set(v);
    this.rawCount.update(c => c + 1);
    this.input$.next(v);
  }

  emitDistinct(v: string) {
    this.distinctLogs.update(l => [{ msg: `📤 Emitting: "${v}"`, color: 'var(--accent)' }, ...l.slice(0, 8)]);
    this.distinctSource$.next(v);
  }

  emitNumber(n: number) { this.numbers$.next(n); }

  runTakeSkip() {
    this.takeSkipLogs.set([]);
    const src = from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

    const add = (msg: string, color: string) =>
      this.takeSkipLogs.update(l => [...l, { msg, color }]);

    add('Source: [1..10]', 'var(--text-muted)');

    src.pipe(take(3)).subscribe({ complete: () => {}, next: v => add(`take(3): ${v}`, 'var(--green)') });
    src.pipe(skip(7)).subscribe({ complete: () => {}, next: v => add(`skip(7): ${v}`, 'var(--cyan)') });
    src.pipe(first(x => x > 5)).subscribe({ complete: () => {}, next: v => add(`first(>5): ${v}`, 'var(--yellow)') });
    src.pipe(last(x => x % 3 === 0)).subscribe({ complete: () => {}, next: v => add(`last(%3==0): ${v}`, 'var(--blue)') });
  }

  startTimer() {
    this.timerStop$ = new Subject<void>();
    this.timerTicks.set(0);
    this.timerRunning.set(true);
    interval(500).pipe(takeUntil(this.timerStop$)).subscribe(() => {
      this.timerTicks.update(t => t + 1);
    });
  }

  stopTimer() {
    this.timerRunning.set(false);
    this.timerStop$.next();
    this.timerStop$.complete();
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

  debounceCode = `// Search — wait until user stops typing
searchInput$.pipe(
  debounceTime(300),        // wait 300ms after last keystroke
  distinctUntilChanged(),   // skip if same value
  switchMap(q => api.search(q))
).subscribe();

// Scroll handler — emit at most once per 100ms
scroll$.pipe(throttleTime(100)).subscribe(updateUI);`;

  distinctCode = `const form$ = formControl.valueChanges;

form$.pipe(
  distinctUntilChanged()
).subscribe(value => this.save(value));

// With custom comparator:
users$.pipe(
  distinctUntilChanged((a, b) => a.id === b.id)
).subscribe();`;

  filterCode = `numbers$.pipe(
  filter(n => n % 2 === 0) // only even numbers
).subscribe();

// Type guard filter
events$.pipe(
  filter((e): e is ClickEvent => e.type === 'click')
).subscribe(e => e.target); // narrowed type`;

  takeSkipCode = `from([1,2,3,4,5]).pipe(
  take(3)    // → 1, 2, 3 then complete
);

from([1,2,3,4,5]).pipe(
  skip(2)    // → 3, 4, 5
);

from([1,2,3,4,5]).pipe(
  first(x => x > 3) // → 4 then complete
);

from([1,2,3,4,5]).pipe(
  last(x => x % 2 === 0) // → 4 (waits for complete)
);`;

  takeUntilCode = `// Best practice for cleanup in components
private destroy$ = new Subject<void>();

ngOnInit() {
  interval(1000).pipe(
    takeUntil(this.destroy$)
  ).subscribe(tick => this.tick = tick);
}

ngOnDestroy() {
  this.destroy$.next();    // triggers takeUntil
  this.destroy$.complete(); // cleanup
}`;
}
