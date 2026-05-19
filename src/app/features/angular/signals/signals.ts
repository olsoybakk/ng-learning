import { Component, computed, effect, signal, OnInit, OnDestroy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { interval, Subject, takeUntil } from 'rxjs';
import { map } from 'rxjs/operators';
import { CodeBlockComponent } from '../../../shared/components/code-block/code-block';
import { DemoCardComponent } from '../../../shared/components/demo-card/demo-card';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signals',
  standalone: true,
  imports: [CodeBlockComponent, DemoCardComponent, FormsModule, DecimalPipe],
  template: `
    <div class="page-header">
      <h1>⚡ Signals</h1>
      <p>Angular's reactive primitive for fine-grained reactivity without Zone.js overhead.</p>
    </div>

    <div class="grid-2">
      <app-demo-card title="signal() — Writable Signal" description="Basic mutable reactive state">
        <div class="controls">
          <button class="btn-secondary" (click)="count.set(count() - 1)">−</button>
          <span class="value-display">{{ count() }}</span>
          <button class="btn-secondary" (click)="count.set(count() + 1)">+</button>
          <button class="btn-primary" (click)="count.update(v => v * 2)">×2</button>
          <button class="btn-danger" (click)="count.set(0)">Reset</button>
        </div>
        <app-code-block [code]="signalCode" />
      </app-demo-card>

      <app-demo-card title="computed() — Derived Signal" description="Automatically recalculates when dependencies change">
        <div class="controls">
          <input type="number" [(ngModel)]="priceValue" (ngModelChange)="price.set($event)" style="width:100px" />
          <input type="number" [(ngModel)]="taxValue" (ngModelChange)="taxRate.set($event)" style="width:80px" placeholder="Tax %" />
        </div>
        <div class="output-box mt-1">
          <div>Price: {{ price() | number:'1.2-2' }} USD</div>
          <div>Tax ({{ taxRate() }}%): {{ tax() | number:'1.2-2' }} USD</div>
          <div style="color:var(--yellow);font-weight:600">Total: {{ total() | number:'1.2-2' }} USD</div>
        </div>
        <app-code-block [code]="computedCode" />
      </app-demo-card>

      <app-demo-card title="effect() — Side Effects" description="Runs automatically when tracked signals change">
        <div class="controls">
          <input [(ngModel)]="searchInput" (ngModelChange)="searchTerm.set($event)" placeholder="Type to trigger effect..." style="flex:1" />
        </div>
        <div class="output-box mt-1">
          @for (log of effectLog; track $index) {
            <div class="output-line">{{ log }}</div>
          }
        </div>
        <app-code-block [code]="effectCode" />
      </app-demo-card>

      <app-demo-card title="toSignal() & toObservable()" description="Bridge between Signals and Observables">
        <div class="output-box">
          <div>Timer (from Observable): <span style="color:var(--yellow)">{{ timer() }}</span>s</div>
          <div>Count signal → Observable emissions: <span style="color:var(--cyan)">{{ obsEmissions }}</span></div>
        </div>
        <app-code-block [code]="interopCode" />
      </app-demo-card>

      <app-demo-card title="linkedSignal()" description="Writable computed — resets when source changes">
        <div class="controls">
          <select [(ngModel)]="selectedCategory" (ngModelChange)="category.set($event)" style="flex:1">
            @for (c of categories; track c) { <option>{{ c }}</option> }
          </select>
        </div>
        <p class="mt-1" style="font-size:0.85rem">Selected item resets to first of category:</p>
        <div class="controls mt-1">
          @for (item of itemsForCategory(); track item) {
            <button class="btn-secondary" [class.btn-primary]="selectedItem() === item"
              (click)="selectedItem.set(item)">{{ item }}</button>
          }
        </div>
        <div class="output-box mt-1">Category: {{ category() }} → Item: {{ selectedItem() }}</div>
        <app-code-block [code]="linkedSignalCode" />
      </app-demo-card>
    </div>
  `,
  styles: [`
    .value-display {
      font-family: var(--font-mono);
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--accent);
      min-width: 48px;
      text-align: center;
    }
  `]
})
export class SignalsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // signal()
  count = signal(0);

  // computed()
  priceValue = 100;
  taxValue = 10;
  price = signal(100);
  taxRate = signal(10);
  tax = computed(() => (this.price() * this.taxRate()) / 100);
  total = computed(() => this.price() + this.tax());

  // effect()
  searchInput = '';
  searchTerm = signal('');
  effectLog: string[] = [];

  // toSignal / toObservable
  timer = toSignal(interval(1000).pipe(map(i => i + 1)), { initialValue: 0 });
  obsEmissions = 0;

  // linkedSignal
  categories = ['Fruits', 'Veggies', 'Grains'];
  itemsMap: Record<string, string[]> = {
    Fruits: ['Apple', 'Banana', 'Cherry'],
    Veggies: ['Carrot', 'Broccoli', 'Spinach'],
    Grains: ['Rice', 'Wheat', 'Oats'],
  };
  selectedCategory = 'Fruits';
  category = signal('Fruits');
  itemsForCategory = computed(() => this.itemsMap[this.category()]);
  // linkedSignal resets to first item whenever category changes
  selectedItem = signal(this.itemsMap['Fruits'][0]);

  constructor() {
    effect(() => {
      const term = this.searchTerm();
      if (term) {
        this.effectLog = [`[${new Date().toLocaleTimeString()}] Searched: "${term}"`, ...this.effectLog.slice(0, 4)];
      }
    });

    // Reset selectedItem when category changes
    effect(() => {
      const items = this.itemsForCategory();
      this.selectedItem.set(items[0]);
    });
  }

  ngOnInit() {
    toObservable(this.count).pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.obsEmissions++;
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  signalCode = `const count = signal(0);

count.set(5);            // set a new value
count.update(v => v + 1); // derive from current
count();                  // read the value → 6`;

  computedCode = `const price = signal(100);
const taxRate = signal(10);

const tax = computed(() => (price() * taxRate()) / 100);
const total = computed(() => price() + tax());
// total() automatically updates when price or taxRate changes`;

  effectCode = `const searchTerm = signal('');

effect(() => {
  // Runs whenever searchTerm changes
  console.log('Searching for:', searchTerm());
  // cleanup runs before next execution
});`;

  interopCode = `import { toSignal, toObservable } from '@angular/core/rxjs-interop';

// Observable → Signal
const timer = toSignal(interval(1000), { initialValue: 0 });

// Signal → Observable
const count$ = toObservable(count);
count$.subscribe(v => console.log('count changed:', v));`;

  linkedSignalCode = `import { linkedSignal } from '@angular/core';

const category = signal('Fruits');
const items = computed(() => itemsMap[category()]);

// linkedSignal resets whenever items (source) changes
const selectedItem = linkedSignal(() => items()[0]);

// Still writable — user can override
selectedItem.set('Banana');
// But when category changes → resets to items()[0]`;
}
