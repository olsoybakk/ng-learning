import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-demo-card',
  standalone: true,
  template: `
    <div class="demo-card">
      <div class="demo-card-header">
        <h3>{{ title }}</h3>
        @if (description) {
          <p>{{ description }}</p>
        }
      </div>
      <div class="demo-card-body">
        <ng-content />
      </div>
    </div>
  `,
  styles: [`
    .demo-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
    }
    .demo-card-header {
      padding: 16px 20px 12px;
      border-bottom: 1px solid var(--border);
      h3 { font-size: 1rem; color: var(--text); margin-bottom: 4px; }
      p { font-size: 0.85rem; color: var(--text-muted); margin: 0; }
    }
    .demo-card-body { padding: 16px 20px; }
  `]
})
export class DemoCardComponent {
  @Input() title = '';
  @Input() description = '';
}
