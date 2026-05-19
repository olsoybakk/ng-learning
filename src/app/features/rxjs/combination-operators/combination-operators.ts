import { Component, signal, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject, combineLatest, concat, forkJoin, merge, of, timer, zip } from 'rxjs';
import { delay, map, take, takeUntil, withLatestFrom } from 'rxjs/operators';
import { CodeBlockComponent } from '../../../shared/components/code-block/code-block';
import { DemoCardComponent } from '../../../shared/components/demo-card/demo-card';

@Component({
  selector: 'app-combination-operators',
  standalone: true,
  imports: [CodeBlockComponent, DemoCardComponent],
  template: `
    <div class="page-header">
      <h1>🔗 Combination Operators</h1>
      <p>Combine multiple observables — essential for coordinating data from multiple sources.</p>
    </div>

    <div class="grid-2">
      <app-demo-card title="combineLatest" description="Emits when ANY source emits, combining all latest values">
        <div class="controls">
          <button class="btn-secondary" (click)="filter$.next('active')">Filter: active</button>
          <button class="btn-secondary" (click)="filter$.next('all')">Filter: all</button>
          <button class="btn-secondary" (click)="sort$.next('asc')">Sort: asc</button>
          <button class="btn-secondary" (click)="sort$.next('desc')">Sort: desc</button>
        </div>
        <div class="output-box mt-1">
          <div>filter: <span style="color:var(--cyan)">{{ combinedFilter() }}</span></div>
          <div>sort: <span style="color:var(--cyan)">{{ combinedSort() }}</span></div>
          <div>Combined result: <span style="color:var(--green)">?filter={{ combinedFilter() }}&sort={{ combinedSort() }}</span></div>
        </div>
        <app-code-block [code]="combineLatestCode" />
      </app-demo-card>

      <app-demo-card title="forkJoin" description="Waits for all to complete, then emits their last values — like Promise.all">
        <button class="btn-primary" (click)="runForkJoin()">Run forkJoin (parallel requests)</button>
        @if (forkJoinLoading()) { <div class="badge badge-yellow mt-1">⏳ Waiting for all...</div> }
        <div class="output-box mt-1">
          @if (forkJoinResult()) {
            <div>User: <span style="color:var(--green)">{{ forkJoinResult()?.user }}</span></div>
            <div>Posts: <span style="color:var(--cyan)">{{ forkJoinResult()?.posts }}</span></div>
            <div>Orders: <span style="color:var(--yellow)">{{ forkJoinResult()?.orders }}</span></div>
          } @else if (!forkJoinLoading()) {
            <span style="color:var(--text-muted)">Click to run</span>
          }
        </div>
        <app-code-block [code]="forkJoinCode" />
      </app-demo-card>

      <app-demo-card title="zip" description="Pairs values by position — emits only when all sources have emitted once">
        <button class="btn-primary" (click)="runZip()">Run zip</button>
        <div class="output-box mt-1" style="max-height:120px;overflow-y:auto">
          @for (l of zipLogs(); track $index) {
            <div class="output-line" [style.color]="l.color">{{ l.msg }}</div>
          }
        </div>
        <app-code-block [code]="zipCode" />
      </app-demo-card>

      <app-demo-card title="withLatestFrom" description="Combine trigger with latest value from another stream — no extra emissions">
        <div class="controls">
          <button class="btn-primary" (click)="userAction$.next('clicked')">Action (uses latest config)</button>
          <button class="btn-secondary" (click)="config$.next({ theme: 'dark', lang: 'en' })">Config: dark/en</button>
          <button class="btn-secondary" (click)="config$.next({ theme: 'light', lang: 'no' })">Config: light/no</button>
        </div>
        <div class="output-box mt-1" style="max-height:120px;overflow-y:auto">
          @for (l of withLatestLogs(); track $index) {
            <div class="output-line" [style.color]="l.color">{{ l.msg }}</div>
          }
        </div>
        <app-code-block [code]="withLatestFromCode" />
      </app-demo-card>

      <app-demo-card title="merge vs concat" description="merge = concurrent; concat = sequential in order">
        <button class="btn-primary" (click)="runMergeConcat()">Run Demo</button>
        <div class="output-box mt-1" style="max-height:140px;overflow-y:auto">
          @for (l of mergeConcatLogs(); track $index) {
            <div class="output-line" [style.color]="l.color">{{ l.msg }}</div>
          }
        </div>
        <app-code-block [code]="mergeConcatCode" />
      </app-demo-card>
    </div>
  `
})
export class CombinationOperatorsComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  filter$ = new BehaviorSubject<string>('all');
  sort$ = new BehaviorSubject<string>('asc');
  combinedFilter = signal('all');
  combinedSort = signal('asc');

  forkJoinLoading = signal(false);
  forkJoinResult = signal<{ user: string; posts: string; orders: string } | null>(null);

  zipLogs = signal<{ msg: string; color: string }[]>([]);
  withLatestLogs = signal<{ msg: string; color: string }[]>([]);
  mergeConcatLogs = signal<{ msg: string; color: string }[]>([]);

  userAction$ = new Subject<string>();
  config$ = new BehaviorSubject<{ theme: string; lang: string }>({ theme: 'dark', lang: 'en' });

  private addLog(sig: ReturnType<typeof signal<{ msg: string; color: string }[]>>, msg: string, color: string) {
    sig.update(l => [...l.slice(-8), { msg, color }]);
  }

  constructor() {
    combineLatest([this.filter$, this.sort$]).pipe(
      takeUntil(this.destroy$)
    ).subscribe(([f, s]) => {
      this.combinedFilter.set(f);
      this.combinedSort.set(s);
    });

    this.userAction$.pipe(
      withLatestFrom(this.config$),
      takeUntil(this.destroy$)
    ).subscribe(([action, config]) => {
      this.addLog(this.withLatestLogs, `Action "${action}" with config: theme=${config.theme}, lang=${config.lang}`, 'var(--green)');
    });
  }

  runForkJoin() {
    this.forkJoinLoading.set(true);
    this.forkJoinResult.set(null);
    forkJoin({
      user: of('Alice').pipe(delay(300)),
      posts: of('42 posts').pipe(delay(700)),
      orders: of('7 orders').pipe(delay(500)),
    }).subscribe(result => {
      this.forkJoinResult.set(result);
      this.forkJoinLoading.set(false);
    });
  }

  runZip() {
    this.zipLogs.set([]);
    const names$ = of('Alice', 'Bob', 'Charlie');
    const scores$ = of(95, 87, 72);
    const badges$ = of('gold', 'silver', 'bronze');

    zip(names$, scores$, badges$).subscribe(([name, score, badge]) => {
      this.addLog(this.zipLogs, `[${name}, ${score}, ${badge}]`, 'var(--cyan)');
    });
  }

  runMergeConcat() {
    this.mergeConcatLogs.set([]);
    const a$ = timer(0, 400).pipe(take(3), map(i => `A${i}`));
    const b$ = timer(200, 400).pipe(take(3), map(i => `B${i}`));

    this.addLog(this.mergeConcatLogs, '--- merge (interleaved) ---', 'var(--text-muted)');
    merge(a$.pipe(take(3)), b$.pipe(take(3))).subscribe(v => {
      this.addLog(this.mergeConcatLogs, v, v.startsWith('A') ? 'var(--green)' : 'var(--cyan)');
    });

    setTimeout(() => {
      this.addLog(this.mergeConcatLogs, '--- concat (sequential) ---', 'var(--text-muted)');
      concat(of('X1', 'X2', 'X3'), of('Y1', 'Y2', 'Y3')).subscribe(v => {
        this.addLog(this.mergeConcatLogs, v, v.startsWith('X') ? 'var(--yellow)' : 'var(--blue)');
      });
    }, 1500);
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

  combineLatestCode = `// Search page with multiple filters
const results$ = combineLatest([
  this.searchTerm$,    // emits when user types
  this.category$,      // emits when category changes
  this.sortOrder$,     // emits when sort changes
]).pipe(
  debounceTime(200),
  switchMap(([term, cat, sort]) => this.api.search(term, cat, sort))
);`;

  forkJoinCode = `// Load all data needed for a page
forkJoin({
  user:   this.http.get('/api/user'),
  posts:  this.http.get('/api/posts'),
  config: this.http.get('/api/config'),
}).subscribe(({ user, posts, config }) => {
  this.initPage(user, posts, config);
});
// All 3 requests run in parallel, completes when all done`;

  zipCode = `// Pair emissions by index position
const names$ = of('Alice', 'Bob', 'Charlie');
const ages$  = of(30, 25, 35);

zip(names$, ages$).subscribe(([name, age]) =>
  console.log(\`\${name} is \${age}\`) // Alice is 30, Bob is 25...
);`;

  withLatestFromCode = `// Use latest config on every button click
// (does NOT subscribe to config$ independently)
buttonClick$.pipe(
  withLatestFrom(this.currentUser$, this.config$),
).subscribe(([click, user, config]) => {
  this.api.doAction({ userId: user.id, ...config });
});`;

  mergeConcatCode = `// merge — all run simultaneously
merge(timer1$, timer2$, timer3$)
  .subscribe(v => console.log(v)); // interleaved

// concat — wait for each to complete
concat(step1$, step2$, step3$)
  .subscribe(v => console.log(v)); // strictly ordered

// race — first to emit wins
race(ws$, http$).subscribe(); // uses WebSocket if faster`;
}
