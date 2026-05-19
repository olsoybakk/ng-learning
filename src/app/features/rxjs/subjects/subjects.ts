import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { AsyncSubject, BehaviorSubject, ReplaySubject, Subject } from 'rxjs';
import { CodeBlockComponent } from '../../../shared/components/code-block/code-block';
import { DemoCardComponent } from '../../../shared/components/demo-card/demo-card';

@Component({
  selector: 'app-subjects',
  standalone: true,
  imports: [CodeBlockComponent, DemoCardComponent],
  template: `
    <div class="page-header">
      <h1>📡 Subjects</h1>
      <p>Subjects are both Observables and Observers — multicast to many subscribers simultaneously.</p>
    </div>

    <div class="grid-2">
      <app-demo-card title="Subject" description="Hot observable — new subscribers miss past values">
        <div class="controls">
          <button class="btn-primary" (click)="emitToSubject()">Emit</button>
          <button class="btn-secondary" (click)="addSubjectSubscriber()">+ Subscriber</button>
          <button class="btn-danger" (click)="clearSubjectLogs()">Clear</button>
        </div>
        <div class="output-box mt-1" style="max-height:140px;overflow-y:auto">
          @for (log of subjectLogs(); track $index) {
            <div class="output-line" [style.color]="log.color">{{ log.msg }}</div>
          }
        </div>
        <app-code-block [code]="subjectCode" />
      </app-demo-card>

      <app-demo-card title="BehaviorSubject" description="Requires initial value — new subscribers get latest value immediately">
        <div class="controls">
          <button class="btn-primary" (click)="emitBehavior('A')">Emit A</button>
          <button class="btn-primary" (click)="emitBehavior('B')">Emit B</button>
          <button class="btn-secondary" (click)="addBehaviorSubscriber()">+ Late Subscriber</button>
        </div>
        <div class="output-box mt-1" style="max-height:140px;overflow-y:auto">
          <div style="color:var(--yellow)">Current value: {{ behavior$.getValue() }}</div>
          @for (log of behaviorLogs(); track $index) {
            <div class="output-line" [style.color]="log.color">{{ log.msg }}</div>
          }
        </div>
        <app-code-block [code]="behaviorCode" />
      </app-demo-card>

      <app-demo-card title="ReplaySubject" description="Buffers N past values — new subscribers receive the buffer">
        <div class="controls">
          <button class="btn-primary" (click)="emitReplay()">Emit</button>
          <button class="btn-secondary" (click)="addReplaySubscriber()">+ Late Sub (gets last 3)</button>
          <button class="btn-danger" (click)="clearReplayLogs()">Clear</button>
        </div>
        <div class="output-box mt-1" style="max-height:140px;overflow-y:auto">
          @for (log of replayLogs(); track $index) {
            <div class="output-line" [style.color]="log.color">{{ log.msg }}</div>
          }
        </div>
        <app-code-block [code]="replayCode" />
      </app-demo-card>

      <app-demo-card title="AsyncSubject" description="Only emits the last value, on complete — great for single-value async ops">
        <div class="controls">
          <button class="btn-primary" (click)="emitAsync()">Emit Value</button>
          <button class="btn-success" (click)="completeAsync()">Complete</button>
          <button class="btn-secondary" (click)="addAsyncSubscriber()">+ Subscriber</button>
        </div>
        <div class="output-box mt-1" style="max-height:140px;overflow-y:auto">
          @for (log of asyncLogs(); track $index) {
            <div class="output-line" [style.color]="log.color">{{ log.msg }}</div>
          }
        </div>
        <app-code-block [code]="asyncCode" />
      </app-demo-card>
    </div>
  `
})
export class SubjectsComponent implements OnDestroy {
  // Subject
  private subject$ = new Subject<number>();
  private subjectCount = 0;
  private subjectSubCount = 0;
  subjectLogs = signal<{ msg: string; color: string }[]>([]);

  // BehaviorSubject
  behavior$ = new BehaviorSubject<string>('initial');
  private behaviorSubCount = 0;
  behaviorLogs = signal<{ msg: string; color: string }[]>([]);

  // ReplaySubject
  private replay$ = new ReplaySubject<number>(3);
  private replayCount = 0;
  private replaySubCount = 0;
  replayLogs = signal<{ msg: string; color: string }[]>([]);

  // AsyncSubject
  private async$ = new AsyncSubject<string>();
  private asyncCount = 0;
  private asyncSubCount = 0;
  private asyncCompleted = false;
  asyncLogs = signal<{ msg: string; color: string }[]>([]);

  private colors = ['var(--green)', 'var(--cyan)', 'var(--yellow)', 'var(--blue)'];

  private addLog(sig: ReturnType<typeof signal<{ msg: string; color: string }[]>>, msg: string, color = 'var(--text)') {
    sig.update(logs => [{ msg, color }, ...logs.slice(0, 9)]);
  }

  emitToSubject() {
    const val = ++this.subjectCount;
    this.addLog(this.subjectLogs, `📤 Emit: ${val}`, 'var(--accent)');
    this.subject$.next(val);
  }

  addSubjectSubscriber() {
    const id = ++this.subjectSubCount;
    const color = this.colors[id % this.colors.length];
    this.addLog(this.subjectLogs, `👂 Sub #${id} subscribed (misses past values)`, color);
    this.subject$.subscribe(v => this.addLog(this.subjectLogs, `  Sub #${id} received: ${v}`, color));
  }

  clearSubjectLogs() { this.subjectLogs.set([]); }

  emitBehavior(val: string) {
    this.addLog(this.behaviorLogs, `📤 Emit: ${val}`, 'var(--accent)');
    this.behavior$.next(val);
  }

  addBehaviorSubscriber() {
    const id = ++this.behaviorSubCount;
    const color = this.colors[id % this.colors.length];
    this.addLog(this.behaviorLogs, `👂 Sub #${id} subscribed`, color);
    this.behavior$.subscribe(v => this.addLog(this.behaviorLogs, `  Sub #${id} received: "${v}"`, color));
  }

  emitReplay() {
    const val = ++this.replayCount;
    this.addLog(this.replayLogs, `📤 Emit: ${val}`, 'var(--accent)');
    this.replay$.next(val);
  }

  addReplaySubscriber() {
    const id = ++this.replaySubCount;
    const color = this.colors[id % this.colors.length];
    this.addLog(this.replayLogs, `👂 Sub #${id} subscribed (gets last 3)`, color);
    this.replay$.subscribe(v => this.addLog(this.replayLogs, `  Sub #${id} received: ${v}`, color));
  }

  clearReplayLogs() { this.replayLogs.set([]); }

  emitAsync() {
    if (this.asyncCompleted) return;
    const val = `value-${++this.asyncCount}`;
    this.addLog(this.asyncLogs, `📤 Emit: ${val} (buffered until complete)`, 'var(--accent)');
    this.async$.next(val);
  }

  completeAsync() {
    if (this.asyncCompleted) return;
    this.asyncCompleted = true;
    this.addLog(this.asyncLogs, `✓ complete() called — now emitting last value`, 'var(--green)');
    this.async$.complete();
  }

  addAsyncSubscriber() {
    const id = ++this.asyncSubCount;
    const color = this.colors[id % this.colors.length];
    this.addLog(this.asyncLogs, `👂 Sub #${id} subscribed`, color);
    this.async$.subscribe({
      next: v => this.addLog(this.asyncLogs, `  Sub #${id} received: "${v}"`, color),
      complete: () => this.addLog(this.asyncLogs, `  Sub #${id} completed`, color),
    });
  }

  ngOnDestroy() {
    this.subject$.complete();
    this.behavior$.complete();
    this.replay$.complete();
  }

  subjectCode = `const subject$ = new Subject<number>();

// Subscriber A (subscribed first)
subject$.subscribe(v => console.log('A:', v));

subject$.next(1); // A: 1

// Subscriber B (subscribed after emissions)
subject$.subscribe(v => console.log('B:', v));

subject$.next(2); // A: 2, B: 2 (B missed 1)`;

  behaviorCode = `const state$ = new BehaviorSubject({ count: 0 });

// Late subscriber immediately gets current value
state$.subscribe(v => console.log('got:', v));
// → { count: 0 }

state$.next({ count: 1 });
// → { count: 1 }

// Read synchronously
const current = state$.getValue();`;

  replayCode = `const replay$ = new ReplaySubject<number>(3); // buffer 3

replay$.next(1);
replay$.next(2);
replay$.next(3);
replay$.next(4);

// Late subscriber gets last 3 values
replay$.subscribe(v => console.log(v));
// → 2, 3, 4`;

  asyncCode = `const result$ = new AsyncSubject<string>();

result$.next('ignored');
result$.next('also ignored');
result$.next('final');    // only this will be emitted

result$.complete();
// Now all subscribers get: 'final'

// Useful for: HTTP request results, one-shot computations`;
}
