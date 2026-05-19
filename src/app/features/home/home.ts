import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page-header">
      <h1>Angular & RxJS Learning Lab</h1>
      <p>Interactive examples and demos showcasing modern Angular and RxJS patterns.</p>
    </div>

    <div class="section">
      <h2>Angular Features</h2>
      <div class="card-grid">
        @for (card of angularCards; track card.path) {
          <a class="feature-card angular-card" [routerLink]="card.path">
            <div class="card-icon">{{ card.icon }}</div>
            <div>
              <h3>{{ card.title }}</h3>
              <p>{{ card.desc }}</p>
            </div>
          </a>
        }
      </div>
    </div>

    <div class="section">
      <h2>RxJS Features</h2>
      <div class="card-grid">
        @for (card of rxjsCards; track card.path) {
          <a class="feature-card rxjs-card" [routerLink]="card.path">
            <div class="card-icon">{{ card.icon }}</div>
            <div>
              <h3>{{ card.title }}</h3>
              <p>{{ card.desc }}</p>
            </div>
          </a>
        }
      </div>
    </div>

    <div class="section">
      <h2>Angular Material</h2>
      <div class="card-grid">
        @for (card of materialCards; track card.path) {
          <a class="feature-card material-card" [routerLink]="card.path">
            <div class="card-icon">{{ card.icon }}</div>
            <div>
              <h3>{{ card.title }}</h3>
              <p>{{ card.desc }}</p>
            </div>
          </a>
        }
      </div>
    </div>
  `,
  styles: [`
    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }
    .feature-card {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      padding: 16px;
      border-radius: var(--radius);
      border: 1px solid var(--border);
      background: var(--surface);
      text-decoration: none;
      transition: border-color 0.15s, transform 0.1s;
      h3 { font-size: 0.95rem; margin-bottom: 4px; }
      p { font-size: 0.82rem; margin: 0; line-height: 1.5; }
    }
    .feature-card:hover { text-decoration: none; transform: translateY(-1px); }
    .angular-card:hover { border-color: #ff6b7a; }
    .rxjs-card:hover { border-color: #a78bfa; }
    .material-card:hover { border-color: #67c082; }
    .card-icon { font-size: 1.5rem; flex-shrink: 0; margin-top: 2px; }
  `]
})
export class HomeComponent {
  angularCards = [
    { icon: '⚡', title: 'Signals', path: '/angular/signals', desc: 'signal(), computed(), effect(), toSignal(), toObservable()' },
    { icon: '🔀', title: 'Control Flow', path: '/angular/control-flow', desc: '@if, @for, @switch, @defer with loading/error blocks' },
    { icon: '📋', title: 'Reactive Forms', path: '/angular/reactive-forms', desc: 'FormControl, FormGroup, FormArray, validators, async validators' },
    { icon: '🔧', title: 'Pipes', path: '/angular/pipes', desc: 'Built-in pipes and writing custom pure/impure pipes' },
    { icon: '🎯', title: 'Directives', path: '/angular/directives', desc: 'Custom attribute and structural directives with host bindings' },
    { icon: '🌐', title: 'HTTP Client', path: '/angular/http-client', desc: 'HttpClient, interceptors, typed responses, error handling' },
    { icon: '🔄', title: 'Change Detection', path: '/angular/change-detection', desc: 'Default vs OnPush, markForCheck, signals integration' },
  ];

  materialCards = [
    { icon: '🔘', title: 'Buttons & Indicators', path: '/material/buttons', desc: 'MatButton variants, chips, progress bar/spinner, and badge' },
    { icon: '📝', title: 'Form Controls', path: '/material/form-controls', desc: 'MatInput, MatSelect, MatCheckbox, MatRadio, MatSlider, MatSlideToggle' },
    { icon: '📊', title: 'Data Display', path: '/material/data-display', desc: 'MatTable with sort and pagination, MatCard, MatList' },
    { icon: '🗂️', title: 'Navigation', path: '/material/navigation', desc: 'MatTabGroup, MatExpansionPanel accordion, MatStepper' },
    { icon: '💬', title: 'Overlays & Feedback', path: '/material/overlays', desc: 'MatTooltip, MatMenu, MatSnackBar, MatDialog' },
  ];

  rxjsCards = [
    { icon: '📡', title: 'Subjects', path: '/rxjs/subjects', desc: 'Subject, BehaviorSubject, ReplaySubject, AsyncSubject' },
    { icon: '🔁', title: 'Transform Operators', path: '/rxjs/transform', desc: 'map, switchMap, mergeMap, concatMap, exhaustMap, scan' },
    { icon: '🔍', title: 'Filter Operators', path: '/rxjs/filter', desc: 'filter, debounceTime, throttleTime, distinctUntilChanged, take' },
    { icon: '🔗', title: 'Combination Operators', path: '/rxjs/combination', desc: 'combineLatest, forkJoin, zip, withLatestFrom, merge, concat' },
    { icon: '🛡️', title: 'Error Handling', path: '/rxjs/error-handling', desc: 'catchError, retry, retryWhen, throwError, EMPTY' },
    { icon: '📢', title: 'Multicasting', path: '/rxjs/multicasting', desc: 'share, shareReplay, multicast, publish, refCount' },
    { icon: '🧩', title: 'Custom Operators', path: '/rxjs/custom-operators', desc: 'Writing reusable pipeable operators with TypeScript' },
  ];
}
