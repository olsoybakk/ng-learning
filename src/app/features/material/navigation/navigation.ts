import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CodeBlockComponent } from '../../../shared/components/code-block/code-block';
import { DemoCardComponent } from '../../../shared/components/demo-card/demo-card';

@Component({
  selector: 'app-mat-navigation',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatTabsModule, MatExpansionModule, MatStepperModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    CodeBlockComponent, DemoCardComponent,
  ],
  template: `
    <div class="page-header">
      <h1>🗂️ Navigation</h1>
      <p>MatTabs, MatExpansionPanel (accordion), and MatStepper.</p>
    </div>

    <div class="grid-2">
      <app-demo-card title="MatTabGroup" description="Tab navigation with lazy content loading">
        <mat-tab-group [(selectedIndex)]="selectedTab" animationDuration="200ms">
          <mat-tab label="Overview">
            <div class="tab-content">
              <p>Angular Material provides a set of reusable, well-tested, and accessible UI components
                based on Material Design.</p>
              <p class="mt-1">Built for Angular apps, fully typed with TypeScript.</p>
            </div>
          </mat-tab>
          <mat-tab label="Components">
            <div class="tab-content">
              <ul class="component-list">
                <li>Form Controls — Input, Select, Checkbox, Radio</li>
                <li>Navigation — Tabs, Sidenav, Toolbar</li>
                <li>Layout — Grid List, Card, Divider</li>
                <li>Buttons — Button, Icon Button, FAB</li>
                <li>Popups — Dialog, Snackbar, Tooltip</li>
              </ul>
            </div>
          </mat-tab>
          <mat-tab label="Getting Started">
            <div class="tab-content">
              <code>npm install @angular/material</code>
              <p class="mt-1">Add <code>provideAnimationsAsync()</code> to your app config,
                then import individual component modules as needed.</p>
            </div>
          </mat-tab>
          <mat-tab label="Disabled" disabled>
            <div class="tab-content">This tab is disabled.</div>
          </mat-tab>
        </mat-tab-group>
        <div class="output-box mt-1">Active tab index: {{ selectedTab }}</div>
        <app-code-block [code]="tabCode" />
      </app-demo-card>

      <app-demo-card title="MatExpansionPanel" description="Accordion-style collapsible panels">
        <mat-accordion multi>
          @for (panel of panels; track panel.title) {
            <mat-expansion-panel [expanded]="panel.expanded">
              <mat-expansion-panel-header>
                <mat-panel-title>{{ panel.title }}</mat-panel-title>
                <mat-panel-description>{{ panel.description }}</mat-panel-description>
              </mat-expansion-panel-header>
              <p>{{ panel.content }}</p>
              @if (panel.hasAction) {
                <mat-action-row>
                  <button mat-button color="primary">Learn More</button>
                </mat-action-row>
              }
            </mat-expansion-panel>
          }
        </mat-accordion>
        <app-code-block [code]="expansionCode" />
      </app-demo-card>

      <app-demo-card title="MatStepper" description="Multi-step workflow with validation">
        <mat-stepper [linear]="isLinear()" #stepper>
          <mat-step [stepControl]="step1Ctrl" label="Account">
            <mat-form-field appearance="outline" style="width:100%;margin-top:12px">
              <mat-label>Email</mat-label>
              <input matInput [formControl]="step1Ctrl" placeholder="you@example.com" />
              @if (step1Ctrl.hasError('required') && step1Ctrl.touched) {
                <mat-error>Email is required</mat-error>
              }
              @if (step1Ctrl.hasError('email') && step1Ctrl.touched) {
                <mat-error>Invalid email</mat-error>
              }
            </mat-form-field>
            <div class="step-actions">
              <button mat-flat-button color="primary" matStepperNext>Next</button>
            </div>
          </mat-step>

          <mat-step [stepControl]="step2Ctrl" label="Profile">
            <mat-form-field appearance="outline" style="width:100%;margin-top:12px">
              <mat-label>Display Name</mat-label>
              <input matInput [formControl]="step2Ctrl" placeholder="Your name" />
              @if (step2Ctrl.hasError('required') && step2Ctrl.touched) {
                <mat-error>Name is required</mat-error>
              }
            </mat-form-field>
            <div class="step-actions">
              <button mat-stroked-button matStepperPrevious>Back</button>
              <button mat-flat-button color="primary" matStepperNext>Next</button>
            </div>
          </mat-step>

          <mat-step label="Confirm">
            <div class="step-summary">
              <p><strong>Email:</strong> {{ step1Ctrl.value || '—' }}</p>
              <p><strong>Name:</strong> {{ step2Ctrl.value || '—' }}</p>
            </div>
            <div class="step-actions">
              <button mat-stroked-button matStepperPrevious>Back</button>
              <button mat-flat-button color="primary" (click)="stepper.reset(); step1Ctrl.reset(); step2Ctrl.reset()">
                Reset
              </button>
            </div>
          </mat-step>
        </mat-stepper>

        <div class="controls mt-1">
          <mat-icon style="font-size:0.9rem;color:var(--text-muted)">info</mat-icon>
          <span style="font-size:0.85rem;color:var(--text-muted)">
            Linear mode: {{ isLinear() ? 'on (validates each step)' : 'off' }}
          </span>
          <button mat-stroked-button (click)="isLinear.update(v => !v)">Toggle linear</button>
        </div>
        <app-code-block [code]="stepperCode" />
      </app-demo-card>
    </div>
  `,
  styles: [`
    .tab-content { padding: 16px 0; font-size: 0.9rem; }
    .component-list { padding-left: 20px; display: flex; flex-direction: column; gap: 4px; }
    .step-actions { display: flex; gap: 8px; margin-top: 12px; }
    .step-summary { padding: 12px 0; display: flex; flex-direction: column; gap: 6px; }
    .step-summary p { font-size: 0.9rem; margin: 0; }
  `]
})
export class MatNavigationComponent {
  selectedTab = 0;
  isLinear = signal(true);

  step1Ctrl = new FormControl('', [Validators.required, Validators.email]);
  step2Ctrl = new FormControl('', [Validators.required]);

  panels = [
    {
      title: 'What is Material Design?',
      description: 'Design system',
      content: 'Material Design is a design language developed by Google in 2014. It uses grid-based layouts, responsive animations, and depth effects such as lighting and shadows.',
      expanded: true,
      hasAction: true,
    },
    {
      title: 'Material 3 (M3)',
      description: 'Latest version',
      content: 'Material Design 3 is the latest and most expressive version. It includes dynamic color, updated typography, and refreshed component designs. Angular Material v17+ uses M3 by default.',
      expanded: false,
      hasAction: true,
    },
    {
      title: 'Angular Material CDK',
      description: 'Behaviour primitives',
      content: 'The Component Dev Kit (CDK) provides low-level tools for building UI components: Overlay, Portal, DragDrop, Virtual Scrolling, A11y utilities, and more.',
      expanded: false,
      hasAction: false,
    },
  ];

  tabCode = `<mat-tab-group [(selectedIndex)]="activeTab" animationDuration="200ms">
  <mat-tab label="Tab 1">
    <ng-template matTabContent>
      <!-- Lazy content — only rendered when tab is active -->
      <p>Tab content</p>
    </ng-template>
  </mat-tab>
  <mat-tab label="Disabled" disabled />
</mat-tab-group>`;

  expansionCode = `<!-- multi: allow multiple panels open simultaneously -->
<mat-accordion multi>
  <mat-expansion-panel [expanded]="true">
    <mat-expansion-panel-header>
      <mat-panel-title>Title</mat-panel-title>
      <mat-panel-description>Subtitle</mat-panel-description>
    </mat-expansion-panel-header>
    <p>Panel body content</p>
    <mat-action-row>
      <button mat-button color="primary">Action</button>
    </mat-action-row>
  </mat-expansion-panel>
</mat-accordion>`;

  stepperCode = `<mat-stepper [linear]="true" #stepper>
  <mat-step [stepControl]="step1Ctrl" label="Step 1">
    <input matInput [formControl]="step1Ctrl" />
    <button mat-button matStepperNext>Next</button>
  </mat-step>

  <mat-step label="Confirm">
    <button mat-button matStepperPrevious>Back</button>
    <button mat-button (click)="stepper.reset()">Reset</button>
  </mat-step>
</mat-stepper>

// linear=true: each step must be valid before proceeding
// matStepperNext / matStepperPrevious: built-in navigation directives`;
}
