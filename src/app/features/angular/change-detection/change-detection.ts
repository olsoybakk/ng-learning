import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component,
  Input, OnInit, computed, inject, signal
} from '@angular/core';
import { CodeBlockComponent } from '../../../shared/components/code-block/code-block';
import { DemoCardComponent } from '../../../shared/components/demo-card/demo-card';

@Component({
  selector: 'app-onpush-child',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div style="padding:10px;border:1px solid var(--border);border-radius:6px;font-size:0.85rem">
      <div style="color:var(--text-muted);font-size:0.75rem;margin-bottom:4px">OnPush Child</div>
      <div>Input: <span style="color:var(--cyan)">{{ data }}</span></div>
      <div>Renders: <span style="color:var(--yellow)">{{ renderCount }}</span></div>
    </div>
  `
})
export class OnPushChildComponent {
  @Input() data = '';
  renderCount = 0;
  ngOnChanges() { this.renderCount++; }
}

@Component({
  selector: 'app-default-child',
  standalone: true,
  template: `
    <div style="padding:10px;border:1px solid var(--border);border-radius:6px;font-size:0.85rem">
      <div style="color:var(--text-muted);font-size:0.75rem;margin-bottom:4px">Default Child</div>
      <div>Input: <span style="color:var(--cyan)">{{ data }}</span></div>
      <div>Renders: <span style="color:var(--yellow)">{{ renderCount }}</span></div>
    </div>
  `
})
export class DefaultChildComponent {
  @Input() data = '';
  renderCount = 0;
  ngDoCheck() { this.renderCount++; }
}

@Component({
  selector: 'app-change-detection',
  standalone: true,
  imports: [CodeBlockComponent, DemoCardComponent, OnPushChildComponent, DefaultChildComponent],
  template: `
    <div class="page-header">
      <h1>🔄 Change Detection</h1>
      <p>Default vs OnPush strategies, <code>ChangeDetectorRef</code>, and Signals as the future.</p>
    </div>

    <div class="grid-2">
      <app-demo-card title="Default vs OnPush" description="OnPush only checks when inputs change or markForCheck() is called">
        <div class="controls">
          <button class="btn-primary" (click)="triggerParentRender()">Parent re-render</button>
          <button class="btn-success" (click)="updateData()">Update Input</button>
        </div>
        <p style="font-size:0.82rem;color:var(--text-muted)">Parent renders: <strong style="color:var(--text)">{{ parentRenders }}</strong></p>
        <div style="display:flex;flex-direction:column;gap:8px;margin-top:8px">
          <app-default-child [data]="childData" />
          <app-onpush-child [data]="childData" />
        </div>
        <app-code-block [code]="onPushCode" />
      </app-demo-card>

      <app-demo-card title="markForCheck() & detach()" description="Manual control over change detection">
        <div class="controls">
          <button class="btn-secondary" (click)="detachCD()">detach()</button>
          <button class="btn-secondary" (click)="reattachCD()">reattach()</button>
          <button class="btn-primary" (click)="manualCheck()">markForCheck()</button>
        </div>
        <div class="output-box mt-1">
          <div>Status: <span [style.color]="cdDetached ? 'var(--red)' : 'var(--green)'">{{ cdDetached ? 'Detached' : 'Attached' }}</span></div>
          <div>Async counter: <span style="color:var(--yellow)">{{ asyncCounter }}</span></div>
          <div style="font-size:0.8rem;color:var(--text-muted)">Counter updates but view only refreshes when attached</div>
        </div>
        <app-code-block [code]="cdrCode" />
      </app-demo-card>

      <app-demo-card title="Signals + OnPush = Zoneless" description="Signals notify Angular directly — no Zone.js needed">
        <div class="controls">
          <button class="btn-primary" (click)="sigCount.update(v => v + 1)">Increment Signal</button>
          <button class="btn-secondary" (click)="sigCount.set(0)">Reset</button>
        </div>
        <div class="output-box mt-1">
          <div>Count: <span style="color:var(--accent);font-size:1.2rem;font-weight:700">{{ sigCount() }}</span></div>
          <div>Double: <span style="color:var(--cyan)">{{ sigDouble() }}</span></div>
        </div>
        <app-code-block [code]="signalCDCode" />
      </app-demo-card>

      <app-demo-card title="ChangeDetection Strategies" description="When each component in the tree is checked">
        <div class="output-box" style="font-size:0.82rem;line-height:2">
          <div><span style="color:var(--yellow)">Default</span> — checks entire subtree on every event</div>
          <div><span style="color:var(--green)">OnPush</span> — checks only when:</div>
          <div style="padding-left:16px">1. &#64;Input reference changes</div>
          <div style="padding-left:16px">2. Event fires in component</div>
          <div style="padding-left:16px">3. async pipe emits</div>
          <div style="padding-left:16px">4. markForCheck() called</div>
          <div style="padding-left:16px">5. Signal changes</div>
        </div>
        <app-code-block [code]="strategyCode" />
      </app-demo-card>
    </div>
  `
})
export class ChangeDetectionComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);

  parentRenders = 0;
  childData = 'initial';
  cdDetached = false;
  asyncCounter = 0;
  private interval?: ReturnType<typeof setInterval>;

  sigCount = signal(0);
  sigDouble = computed(() => this.sigCount() * 2);

  ngOnInit() {
    this.interval = setInterval(() => { this.asyncCounter++; }, 500);
  }

  ngOnDestroy() { clearInterval(this.interval); }

  triggerParentRender() { this.parentRenders++; }
  updateData() { this.childData = `updated at ${new Date().toLocaleTimeString()}`; this.parentRenders++; }
  detachCD() { this.cdDetached = true; this.cdr.detach(); }
  reattachCD() { this.cdDetached = false; this.cdr.reattach(); }
  manualCheck() { this.cdr.markForCheck(); }

  onPushCode = `@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyComponent {
  @Input() data!: string; // only rechecks when reference changes
}`;

  cdrCode = `constructor(private cdr: ChangeDetectorRef) {}

// Detach from CD tree — component won't update
this.cdr.detach();

// Reattach
this.cdr.reattach();

// Schedule a single check (works while detached)
this.cdr.markForCheck();

// Run synchronously
this.cdr.detectChanges();`;

  signalCDCode = `// Signals integrate natively with OnPush
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CounterComponent {
  count = signal(0);
  double = computed(() => this.count() * 2);

  // Angular knows to re-render when signals change
  // No Zone.js required!
}`;

  strategyCode = `// app.config.ts — fully zoneless app
export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    // ... rest of providers
  ]
};`;
}
