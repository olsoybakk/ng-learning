import { Component, Pipe, PipeTransform } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe, JsonPipe, PercentPipe, SlicePipe, TitleCasePipe } from '@angular/common';
import { CodeBlockComponent } from '../../../shared/components/code-block/code-block';
import { DemoCardComponent } from '../../../shared/components/demo-card/demo-card';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { interval } from 'rxjs';
import { map } from 'rxjs/operators';

@Pipe({ name: 'truncate', standalone: true })
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit = 30, ellipsis = '...'): string {
    return value.length > limit ? value.slice(0, limit) + ellipsis : value;
  }
}

@Pipe({ name: 'highlight', standalone: true })
export class HighlightPipe implements PipeTransform {
  transform(value: string, search: string): string {
    const trimmed = search.trim();
    if (!trimmed || trimmed.length > 100) return value;
    const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(${escaped})`, 'gi');
    return value.replace(re, '<mark>$1</mark>');
  }
}

@Pipe({ name: 'fileSize', standalone: true })
export class FileSizePipe implements PipeTransform {
  transform(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    while (bytes >= 1024 && i < units.length - 1) { bytes /= 1024; i++; }
    return `${bytes.toFixed(1)} ${units[i]}`;
  }
}

@Pipe({ name: 'timeAgo', standalone: true, pure: false })
export class TimeAgoPipe implements PipeTransform {
  transform(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  }
}

@Component({
  selector: 'app-pipes',
  standalone: true,
  imports: [
    CodeBlockComponent, DemoCardComponent, FormsModule, AsyncPipe,
    DatePipe, CurrencyPipe, DecimalPipe, PercentPipe, TitleCasePipe, SlicePipe, JsonPipe,
    TruncatePipe, HighlightPipe, FileSizePipe, TimeAgoPipe,
  ],
  template: `
    <div class="page-header">
      <h1>🔧 Pipes</h1>
      <p>Transform data in templates — built-in Angular pipes and custom pure/impure pipes.</p>
    </div>

    <div class="grid-2">
      <app-demo-card title="Built-in Pipes" description="date, currency, decimal, percent, titlecase, slice">
        <div class="output-box">
          <div>{{ now | date:'fullDate' }}</div>
          <div>{{ now | date:'HH:mm:ss' }}</div>
          <div>{{ 1234567.89 | currency:'USD':'symbol':'1.2-2' }}</div>
          <div>{{ 1234567.89 | number:'1.0-0' }}</div>
          <div>{{ 0.845 | percent:'1.1-2' }}</div>
          <div>{{ 'hello world from angular' | titlecase }}</div>
          <div>{{ [1,2,3,4,5,6,7,8] | slice:2:5 | json }}</div>
        </div>
        <app-code-block [code]="builtinCode" />
      </app-demo-card>

      <app-demo-card title="async pipe" description="Subscribes to Observables/Promises, auto-unsubscribes">
        <div class="output-box">
          <div style="font-size:1.3rem;color:var(--yellow)">{{ clock$ | async }}</div>
          <div style="font-size:0.8rem;color:var(--text-muted)">auto-subscribed, no ngOnDestroy needed</div>
        </div>
        <app-code-block [code]="asyncCode" />
      </app-demo-card>

      <app-demo-card title="Custom: truncate & fileSize" description="Pure pipes — run only when input changes">
        <div style="display:flex;flex-direction:column;gap:8px">
          <input [(ngModel)]="longText" placeholder="Enter long text..." />
          <div class="output-box">
            <div>Original ({{ longText.length }} chars)</div>
            <div style="color:var(--cyan)">Truncated(20): {{ longText | truncate:20 }}</div>
            <div style="color:var(--cyan)">Truncated(40): {{ longText | truncate:40:'→' }}</div>
          </div>
          <div class="output-box">
            <div>{{ 500 | fileSize }} | {{ 52000 | fileSize }} | {{ 1048576 | fileSize }} | {{ 1073741824 | fileSize }}</div>
          </div>
        </div>
        <app-code-block [code]="customPureCode" />
      </app-demo-card>

      <app-demo-card title="Custom: highlight & timeAgo (impure)" description="Impure pipes re-run on every change detection cycle">
        <div style="display:flex;flex-direction:column;gap:8px">
          <input [(ngModel)]="searchTerm" placeholder="Search term to highlight..." />
          <div class="output-box" [innerHTML]="sampleText | highlight:searchTerm"></div>
          <div class="output-box" style="display:flex;gap:16px;flex-wrap:wrap">
            @for (ts of timestamps; track $index) {
              <span>{{ ts | timeAgo }}</span>
            }
          </div>
        </div>
        <app-code-block [code]="impureCode" />
      </app-demo-card>
    </div>
  `,
  styles: [`:host ::ng-deep mark { background: rgba(251,191,36,0.3); color: var(--yellow); border-radius:2px; padding: 0 2px; }`]
})
export class PipesComponent {
  now = new Date();
  longText = 'This is a very long text that should be truncated by our custom pipe';
  searchTerm = 'Angular';
  sampleText = 'Angular pipes transform data in templates. Angular is awesome!';
  timestamps = [
    new Date(Date.now() - 15000),
    new Date(Date.now() - 180000),
    new Date(Date.now() - 7200000),
  ];

  clock$ = interval(1000).pipe(
    map(() => new Date().toLocaleTimeString())
  );

  builtinCode = `{{ date | date:'fullDate' }}
{{ date | date:'HH:mm:ss' }}
{{ 1234567 | currency:'USD' }}
{{ 1234567 | number:'1.0-0' }}
{{ 0.845 | percent:'1.1-2' }}
{{ 'hello world' | titlecase }}
{{ [1,2,3,4,5] | slice:1:3 | json }}`;

  asyncCode = `// No subscribe/unsubscribe needed!
clock$ = interval(1000).pipe(
  map(() => new Date().toLocaleTimeString())
);

// Template:
{{ clock$ | async }}

// Also works with Promises:
{{ userProfile$ | async }}`;

  customPureCode = `@Pipe({ name: 'truncate', standalone: true })
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit = 30, ellipsis = '...') {
    return value.length > limit
      ? value.slice(0, limit) + ellipsis
      : value;
  }
}

// Usage: {{ text | truncate:20:'…' }}`;

  impureCode = `// pure: false → re-runs every change detection cycle
@Pipe({ name: 'timeAgo', standalone: true, pure: false })
export class TimeAgoPipe implements PipeTransform {
  transform(date: Date): string {
    const s = Math.floor((Date.now() - date.getTime()) / 1000);
    if (s < 60) return s + 's ago';
    if (s < 3600) return Math.floor(s / 60) + 'm ago';
    return Math.floor(s / 3600) + 'h ago';
  }
}`;
}
