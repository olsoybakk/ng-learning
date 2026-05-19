import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule, MatChipSelectionChange } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { CodeBlockComponent } from '../../../shared/components/code-block/code-block';
import { DemoCardComponent } from '../../../shared/components/demo-card/demo-card';

@Component({
  selector: 'app-mat-buttons',
  standalone: true,
  imports: [
    MatButtonModule, MatIconModule, MatChipsModule,
    MatProgressBarModule, MatProgressSpinnerModule, MatBadgeModule,
    CodeBlockComponent, DemoCardComponent,
  ],
  template: `
    <div class="page-header">
      <h1>🔘 Buttons & Indicators</h1>
      <p>MatButton variants, icons, chips, progress indicators, and badges.</p>
    </div>

    <div class="grid-2">
      <app-demo-card title="Button Variants" description="Attribute directives on &lt;button&gt;">
        <div class="btn-row">
          <button mat-button>mat-button</button>
          <button mat-raised-button>mat-raised-button</button>
          <button mat-flat-button>mat-flat-button</button>
          <button mat-stroked-button>mat-stroked-button</button>
        </div>
        <div class="btn-row mt-1">
          <button mat-icon-button><mat-icon>favorite</mat-icon></button>
          <button mat-fab><mat-icon>add</mat-icon></button>
          <button mat-mini-fab><mat-icon>edit</mat-icon></button>
        </div>
        <div class="btn-row mt-1">
          <button mat-flat-button color="primary">Primary</button>
          <button mat-flat-button color="accent">Accent</button>
          <button mat-flat-button color="warn">Warn</button>
          <button mat-flat-button disabled>Disabled</button>
        </div>
        <app-code-block [code]="buttonCode" />
      </app-demo-card>

      <app-demo-card title="MatChips" description="Display and selection chip sets">
        <p class="chip-label">Display chips (non-interactive):</p>
        <mat-chip-set>
          <mat-chip>Angular</mat-chip>
          <mat-chip>Material</mat-chip>
          <mat-chip>TypeScript</mat-chip>
          <mat-chip>RxJS</mat-chip>
        </mat-chip-set>
        <p class="chip-label mt-1">Selection chips (multi-select):</p>
        <mat-chip-listbox multiple>
          @for (t of techChips; track t) {
            <mat-chip-option [value]="t" (selectionChange)="onChipChange(t, $event)">{{ t }}</mat-chip-option>
          }
        </mat-chip-listbox>
        <div class="output-box mt-1">Selected: {{ selectedChips().join(', ') || 'none' }}</div>
        <app-code-block [code]="chipsCode" />
      </app-demo-card>

      <app-demo-card title="Progress Indicators" description="MatProgressBar and MatProgressSpinner">
        <div class="controls">
          <button mat-stroked-button (click)="startProgress()">Start</button>
          <button mat-stroked-button (click)="resetProgress()">Reset</button>
          <span style="color:var(--text-muted);font-size:0.85rem">{{ progress() }}%</span>
        </div>
        <p style="margin:8px 0 4px;font-size:0.85rem;color:var(--text-muted)">Determinate:</p>
        <mat-progress-bar mode="determinate" [value]="progress()" />
        <p style="margin:8px 0 4px;font-size:0.85rem;color:var(--text-muted)">Indeterminate:</p>
        <mat-progress-bar [mode]="loading() ? 'indeterminate' : 'determinate'" [value]="0" />
        <div class="spinner-row mt-1">
          <div>
            <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:4px">Determinate</p>
            <mat-progress-spinner mode="determinate" [value]="progress()" diameter="48" />
          </div>
          <div>
            <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:4px">Indeterminate</p>
            <mat-spinner diameter="48" />
          </div>
        </div>
        <app-code-block [code]="progressCode" />
      </app-demo-card>

      <app-demo-card title="MatBadge" description="Notification count overlays">
        <div class="btn-row">
          <button mat-raised-button [matBadge]="notifications()" matBadgeColor="warn">
            <mat-icon>notifications</mat-icon>&nbsp;Inbox
          </button>
          <button mat-icon-button [matBadge]="cart()" matBadgeColor="accent" matBadgePosition="above after">
            <mat-icon>shopping_cart</mat-icon>
          </button>
          <button mat-icon-button [matBadge]="messages()" matBadgeColor="primary" matBadgePosition="below before">
            <mat-icon>mail</mat-icon>
          </button>
        </div>
        <div class="controls mt-1">
          <button mat-stroked-button (click)="notifications.update(n => n + 1)">+1 Inbox</button>
          <button mat-stroked-button (click)="cart.update(n => n + 1)">+1 Cart</button>
          <button mat-stroked-button (click)="messages.update(n => n + 1)">+1 Mail</button>
          <button mat-stroked-button (click)="notifications.set(0); cart.set(0); messages.set(0)">Clear</button>
        </div>
        <app-code-block [code]="badgeCode" />
      </app-demo-card>
    </div>
  `,
  styles: [`
    .btn-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
    .chip-label { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 6px; }
    .spinner-row { display: flex; gap: 24px; }
  `]
})
export class MatButtonsComponent {
  progress = signal(0);
  loading = signal(false);
  notifications = signal(3);
  cart = signal(2);
  messages = signal(5);
  selectedChips = signal<string[]>([]);

  techChips = ['Angular', 'Material', 'RxJS', 'Signals', 'CDK'];
  private selectedSet = new Set<string>();

  onChipChange(label: string, event: MatChipSelectionChange) {
    if (event.selected) this.selectedSet.add(label);
    else this.selectedSet.delete(label);
    this.selectedChips.set([...this.selectedSet]);
  }

  private timer?: ReturnType<typeof setInterval>;

  startProgress() {
    this.loading.set(true);
    this.progress.set(0);
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.progress.update(p => {
        if (p >= 100) { clearInterval(this.timer); this.loading.set(false); return 100; }
        return p + 5;
      });
    }, 100);
  }

  resetProgress() {
    clearInterval(this.timer);
    this.progress.set(0);
    this.loading.set(false);
  }

  buttonCode = `<!-- Attribute directives on <button> or <a> -->
<button mat-button>Text</button>
<button mat-raised-button>Elevated</button>
<button mat-flat-button>Filled</button>
<button mat-stroked-button>Outlined</button>
<button mat-icon-button><mat-icon>favorite</mat-icon></button>
<button mat-fab><mat-icon>add</mat-icon></button>

<!-- Semantic color tokens -->
<button mat-flat-button color="primary">Primary</button>
<button mat-flat-button color="accent">Accent</button>
<button mat-flat-button color="warn">Warn</button>`;

  chipsCode = `<!-- Non-interactive display chips -->
<mat-chip-set>
  <mat-chip>Angular</mat-chip>
</mat-chip-set>

<!-- Selectable chips -->
<mat-chip-listbox multiple>
  <mat-chip-option value="angular"
    (selectionChange)="onChipChange('angular', $event)">
    Angular
  </mat-chip-option>
</mat-chip-listbox>`;

  progressCode = `<!-- Progress bar modes: determinate | indeterminate | buffer | query -->
<mat-progress-bar mode="determinate" [value]="progress()" />
<mat-progress-bar mode="indeterminate" />

<!-- Spinner -->
<mat-progress-spinner mode="determinate" [value]="progress()" diameter="48" />
<mat-spinner diameter="48" /> <!-- shorthand for indeterminate spinner -->`;

  badgeCode = `<!-- matBadge directive on any element -->
<button mat-raised-button [matBadge]="count()" matBadgeColor="warn">
  <mat-icon>notifications</mat-icon> Inbox
</button>

<!-- Position: above/below + before/after -->
<!-- Color: primary | accent | warn -->
<button mat-icon-button [matBadge]="cart()"
  matBadgeColor="accent"
  matBadgePosition="above after">
  <mat-icon>shopping_cart</mat-icon>
</button>`;
}
