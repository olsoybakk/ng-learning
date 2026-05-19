import { Component, signal, OnDestroy } from '@angular/core';
import { Observable, Subject, defer, interval, share, shareReplay, timer } from 'rxjs';
import { map, take, takeUntil, tap } from 'rxjs/operators';
import { CodeBlockComponent } from '../../../shared/components/code-block/code-block';
import { DemoCardComponent } from '../../../shared/components/demo-card/demo-card';

@Component({
  selector: 'app-multicasting',
  standalone: true,
  imports: [CodeBlockComponent, DemoCardComponent],
  template: `
    <div class="page-header">
      <h1>📢 Multicasting</h1>
      <p>Share a single execution among multiple subscribers — critical for avoiding duplicate HTTP calls.</p>
    </div>

    <div class="grid-2">
      <app-demo-card title="Cold vs Hot Observables" description="Cold = each subscriber gets its own execution; Hot = shared execution">
        <div class="controls">
          <button class="btn-secondary" (click)="demoCold()">Cold (no share)</button>
          <button class="btn-primary" (click)="demoHot()">Hot (share)</button>
          <button class="btn-danger" (click)="coldHotLogs.set([])">Clear</button>
        </div>
        <div class="output-box mt-1" style="max-height:150px;overflow-y:auto">
          @for (l of coldHotLogs(); track $index) {
            <div class="output-line" [style.color]="l.color">{{ l.msg }}</div>
          }
        </div>
        <app-code-block [code]="coldHotCode" />
      </app-demo-card>

      <app-demo-card title="share()" description="Multicasts to all current subscribers — refCounts automatically">
        <div class="controls">
          <button class="btn-primary" (click)="addShareSub()">+ Subscriber</button>
          <button class="btn-danger" (click)="removeShareSub()">- Subscriber</button>
          <button class="btn-secondary" (click)="shareLogs.set([])">Clear</button>
        </div>
        <div class="output-box mt-1" style="max-height:130px;overflow-y:auto">
          <div style="color:var(--text-muted);font-size:0.8rem">Subscribers: {{ shareSubCount() }} | Single shared ticker</div>
          @for (l of shareLogs(); track $index) {
            <div class="output-line" [style.color]="l.color">{{ l.msg }}</div>
          }
        </div>
        <app-code-block [code]="shareCode" />
      </app-demo-card>

      <app-demo-card title="shareReplay(n)" description="Caches last N values — new subscribers get history. Use for HTTP responses">
        <div class="controls">
          <button class="btn-primary" (click)="fetchShared()">Fetch (check console for execution count)</button>
          <button class="btn-secondary" (click)="addLateReplaySub()">+ Late Subscriber</button>
        </div>
        <div class="output-box mt-1" style="max-height:130px;overflow-y:auto">
          <div style="color:var(--text-muted);font-size:0.8rem">API calls: {{ apiCallCount() }} | Subscribers: {{ replaySubCount() }}</div>
          @for (l of replayLogs(); track $index) {
            <div class="output-line" [style.color]="l.color">{{ l.msg }}</div>
          }
        </div>
        <app-code-block [code]="shareReplayCode" />
      </app-demo-card>

      <app-demo-card title="When to use each" description="Decision guide for multicasting operators">
        <div class="output-box" style="font-size:0.82rem;line-height:2">
          <div><span style="color:var(--yellow)">share()</span> → live streams (WebSocket, mouse events)</div>
          <div><span style="color:var(--green)">shareReplay(1)</span> → HTTP responses, config loading</div>
          <div><span style="color:var(--cyan)">shareReplay(n)</span> → pagination cache, last N events</div>
          <div><span style="color:var(--blue)">BehaviorSubject</span> → state management (NgRx stores)</div>
          <div><span style="color:var(--accent)">ReplaySubject</span> → audit logs, late-join streams</div>
        </div>
        <app-code-block [code]="guideCode" />
      </app-demo-card>
    </div>
  `
})
export class MulticastingComponent implements OnDestroy {
  private destroy$ = new Subject<void>();
  private shareUnsubs: (() => void)[] = [];

  coldHotLogs = signal<{ msg: string; color: string }[]>([]);
  shareLogs = signal<{ msg: string; color: string }[]>([]);
  replayLogs = signal<{ msg: string; color: string }[]>([]);

  shareSubCount = signal(0);
  replaySubCount = signal(0);
  apiCallCount = signal(0);

  private sharedTicker$ = interval(600).pipe(
    map(i => i + 1),
    tap(i => { if (i === 1) this.log(this.shareLogs, '📡 Shared source started (single execution)', 'var(--accent)'); }),
    share(),
    takeUntil(this.destroy$)
  );

  private shared$ = defer(() => {
    this.apiCallCount.update(c => c + 1);
    return timer(400).pipe(map(() => `Data (api call #${this.apiCallCount()})`));
  }).pipe(shareReplay(1));

  private log(sig: ReturnType<typeof signal<{ msg: string; color: string }[]>>, msg: string, color: string) {
    sig.update(l => [...l.slice(-9), { msg, color }]);
  }

  demoCold() {
    this.coldHotLogs.set([]);
    const cold$ = timer(0, 300).pipe(take(3), map(i => i + 1));
    this.log(this.coldHotLogs, 'Cold: 2 subscribers, 2 executions', 'var(--text-muted)');
    cold$.subscribe(v => this.log(this.coldHotLogs, `  Sub A: ${v}`, 'var(--green)'));
    setTimeout(() => cold$.subscribe(v => this.log(this.coldHotLogs, `  Sub B: ${v}`, 'var(--cyan)')), 150);
  }

  demoHot() {
    this.coldHotLogs.set([]);
    const hot$ = timer(0, 300).pipe(take(3), map(i => i + 1), share());
    this.log(this.coldHotLogs, 'Hot (share): 2 subscribers, 1 execution', 'var(--text-muted)');
    hot$.subscribe(v => this.log(this.coldHotLogs, `  Sub A: ${v}`, 'var(--green)'));
    setTimeout(() => hot$.subscribe(v => this.log(this.coldHotLogs, `  Sub B: ${v} (late — missed first)`, 'var(--cyan)')), 150);
  }

  addShareSub() {
    const id = this.shareSubCount() + 1;
    this.shareSubCount.set(id);
    const colors = ['var(--green)', 'var(--cyan)', 'var(--yellow)', 'var(--blue)'];
    const color = colors[(id - 1) % colors.length];
    const sub = this.sharedTicker$.subscribe(v =>
      this.log(this.shareLogs, `Sub #${id}: tick ${v}`, color)
    );
    this.shareUnsubs.push(() => { sub.unsubscribe(); this.shareSubCount.update(c => c - 1); });
  }

  removeShareSub() {
    const unsub = this.shareUnsubs.pop();
    if (unsub) unsub();
  }

  fetchShared() {
    this.replaySubCount.update(c => c + 1);
    const subId = this.replaySubCount();
    this.shared$.subscribe(v => this.log(this.replayLogs, `Sub #${subId}: ${v}`, 'var(--green)'));
  }

  addLateReplaySub() {
    this.replaySubCount.update(c => c + 1);
    const subId = this.replaySubCount();
    this.shared$.subscribe(v => this.log(this.replayLogs, `Late sub #${subId} got cached: ${v}`, 'var(--yellow)'));
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

  coldHotCode = `// Cold: each subscriber triggers a new HTTP request
const cold$ = this.http.get('/api/data');
cold$.subscribe(a => ...); // Request 1
cold$.subscribe(b => ...); // Request 2 — duplicate!

// Hot: shared, single request
const hot$ = cold$.pipe(share());
hot$.subscribe(a => ...); // Request 1
hot$.subscribe(b => ...); // Same request, no duplicate`;

  shareCode = `const ticker$ = interval(1000).pipe(share());

// Both subscribers share ONE interval
ticker$.subscribe(v => console.log('A:', v));
ticker$.subscribe(v => console.log('B:', v));

// When last subscriber unsubscribes, source stops
// When new subscriber joins after all left, source restarts`;

  shareReplayCode = `// Cache HTTP response for all subscribers
const config$ = this.http.get<Config>('/api/config').pipe(
  shareReplay(1) // cache latest 1 value
);

// First subscriber triggers the HTTP call
config$.subscribe(c => this.apply(c));

// Second subscriber gets cached value immediately
// — no second HTTP request!
config$.subscribe(c => this.display(c));`;

  guideCode = `// Service pattern with shareReplay
@Injectable({ providedIn: 'root' })
export class ConfigService {
  readonly config$ = this.http
    .get<Config>('/api/config')
    .pipe(shareReplay({ bufferSize: 1, refCount: true }));
    // refCount: true → re-fetches when resubscribed after all unsub
    // refCount: false → keeps cache forever (good for app config)
}`;
}
