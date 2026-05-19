import { Component, signal } from '@angular/core';
import { CodeBlockComponent } from '../../../shared/components/code-block/code-block';
import { DemoCardComponent } from '../../../shared/components/demo-card/demo-card';

@Component({
  selector: 'app-control-flow',
  standalone: true,
  imports: [CodeBlockComponent, DemoCardComponent],
  template: `
    <div class="page-header">
      <h1>🔀 Control Flow</h1>
      <p>Angular's built-in control flow syntax — <code>&#64;if</code>, <code>&#64;for</code>, <code>&#64;switch</code>, and <code>&#64;defer</code>.</p>
    </div>

    <div class="grid-2">
      <app-demo-card title="@if / @else if / @else" description="Conditional rendering with type-narrowing">
        <div class="controls">
          <button class="btn-secondary" (click)="ifStatus.set('loading')">Loading</button>
          <button class="btn-success" (click)="ifStatus.set('success')">Success</button>
          <button class="btn-danger" (click)="ifStatus.set('error')">Error</button>
          <button class="btn-secondary" (click)="ifStatus.set('idle')">Idle</button>
        </div>
        <div class="output-box mt-1">
          @if (ifStatus() === 'loading') {
            <span style="color:var(--yellow)">⏳ Loading...</span>
          } @else if (ifStatus() === 'success') {
            <span style="color:var(--green)">✓ Data loaded successfully</span>
          } @else if (ifStatus() === 'error') {
            <span style="color:var(--red)">✗ An error occurred</span>
          } @else {
            <span style="color:var(--text-muted)">— Idle, press a button</span>
          }
        </div>
        <app-code-block [code]="ifCode" />
      </app-demo-card>

      <app-demo-card title="@for with @empty" description="Iteration with track for performance, fallback for empty lists">
        <div class="controls">
          <button class="btn-primary" (click)="addItem()">+ Add Item</button>
          <button class="btn-danger" (click)="clearItems()">Clear</button>
        </div>
        <div class="output-box mt-1" style="max-height:160px;overflow-y:auto">
          @for (item of items(); track item.id) {
            <div class="output-line" style="display:flex;justify-content:space-between;align-items:center">
              <span>{{ $index + 1 }}. {{ item.name }} (id: {{ item.id }})</span>
              <button style="background:transparent;color:var(--red);padding:0 4px;font-size:0.8rem"
                (click)="removeItem(item.id)">✕</button>
            </div>
          } @empty {
            <span style="color:var(--text-muted)">No items — list is empty</span>
          }
        </div>
        <app-code-block [code]="forCode" />
      </app-demo-card>

      <app-demo-card title="@switch" description="Multi-branch matching — cleaner than nested @if">
        <div class="controls">
          @for (role of ['guest', 'user', 'admin', 'superadmin']; track role) {
            <button class="btn-secondary" [class.btn-primary]="currentRole() === role"
              (click)="currentRole.set(role)">{{ role }}</button>
          }
        </div>
        <div class="output-box mt-1">
          @switch (currentRole()) {
            @case ('guest') { <span style="color:var(--text-muted)">👤 Guest — read-only access</span> }
            @case ('user') { <span style="color:var(--blue)">🙋 User — standard access</span> }
            @case ('admin') { <span style="color:var(--yellow)">🔑 Admin — manage users</span> }
            @case ('superadmin') { <span style="color:var(--red)">👑 Superadmin — full control</span> }
            @default { <span>Unknown role</span> }
          }
        </div>
        <app-code-block [code]="switchCode" />
      </app-demo-card>

      <app-demo-card title="@defer — Lazy Loading" description="Defer rendering until idle, visible, or interaction">
        <div class="controls">
          <button class="btn-primary" (click)="showDeferred.set(!showDeferred())">
            {{ showDeferred() ? 'Hide' : 'Show Deferred Content' }}
          </button>
        </div>
        @if (showDeferred()) {
          <div class="output-box mt-1">
            @defer (on immediate) {
              <div>
                <div style="color:var(--green)">✓ Deferred chunk loaded!</div>
                <div style="font-size:0.8rem;color:var(--text-muted)">This component was lazy-loaded</div>
              </div>
            } @placeholder {
              <span style="color:var(--text-muted)">Placeholder shown while loading...</span>
            } @loading (minimum 500ms) {
              <span style="color:var(--yellow)">⏳ Loading deferred block...</span>
            } @error {
              <span style="color:var(--red)">Failed to load</span>
            }
          </div>
        }
        <app-code-block [code]="deferCode" />
      </app-demo-card>
    </div>
  `
})
export class ControlFlowComponent {
  ifStatus = signal<'idle' | 'loading' | 'success' | 'error'>('idle');
  currentRole = signal('guest');
  showDeferred = signal(false);

  private idCounter = 1;
  items = signal<{ id: number; name: string }[]>([
    { id: this.idCounter++, name: 'Item Alpha' },
    { id: this.idCounter++, name: 'Item Beta' },
  ]);

  addItem() {
    const id = this.idCounter++;
    this.items.update(list => [...list, { id, name: `Item ${id}` }]);
  }

  removeItem(id: number) {
    this.items.update(list => list.filter(i => i.id !== id));
  }

  clearItems() { this.items.set([]); }

  ifCode = `@if (status === 'loading') {
  <spinner />
} @else if (status === 'error') {
  <error-message [msg]="error" />
} @else {
  <data-view [data]="data" />
}`;

  forCode = `@for (item of items; track item.id) {
  <li>{{ $index + 1 }}. {{ item.name }}</li>
  <!-- $index, $first, $last, $even, $odd, $count available -->
} @empty {
  <li>No items found</li>
}`;

  switchCode = `@switch (userRole) {
  @case ('admin')  { <admin-panel /> }
  @case ('user')   { <user-dashboard /> }
  @default         { <login-page /> }
}`;

  deferCode = `<!-- Defer until visible in viewport -->
@defer (on viewport) {
  <heavy-chart [data]="data" />
} @placeholder {
  <div class="skeleton" />
} @loading (minimum 300ms) {
  <spinner />
} @error {
  <p>Failed to load component</p>
}

<!-- Other triggers: on idle | on interaction | on timer(2s) -->
<!-- when someCondition | prefetch on idle -->`;
}
