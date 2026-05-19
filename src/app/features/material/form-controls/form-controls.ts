import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CodeBlockComponent } from '../../../shared/components/code-block/code-block';
import { DemoCardComponent } from '../../../shared/components/demo-card/demo-card';

@Component({
  selector: 'app-mat-form-controls',
  standalone: true,
  imports: [
    FormsModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatCheckboxModule, MatRadioModule, MatSliderModule,
    MatSlideToggleModule, MatButtonModule, MatIconModule,
    CodeBlockComponent, DemoCardComponent,
  ],
  template: `
    <div class="page-header">
      <h1>📝 Form Controls</h1>
      <p>MatFormField, MatInput, MatSelect, MatCheckbox, MatRadio, MatSlider, and MatSlideToggle.</p>
    </div>

    <div class="grid-2">
      <app-demo-card title="MatFormField & MatInput" description="Text inputs with floating labels, hints, and validation">
        <div class="field-col">
          <mat-form-field appearance="outline">
            <mat-label>Username</mat-label>
            <input matInput [formControl]="usernameCtrl" placeholder="Enter username" />
            <mat-icon matPrefix>person</mat-icon>
            @if (usernameCtrl.hasError('required') && usernameCtrl.touched) {
              <mat-error>Username is required</mat-error>
            }
            @if (usernameCtrl.hasError('minlength') && usernameCtrl.touched) {
              <mat-error>Minimum 3 characters</mat-error>
            }
            <mat-hint>Must be at least 3 characters</mat-hint>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput type="email" [formControl]="emailCtrl" placeholder="you@example.com" />
            <mat-icon matSuffix>mail</mat-icon>
            @if (emailCtrl.hasError('email') && emailCtrl.touched) {
              <mat-error>Invalid email address</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Bio</mat-label>
            <textarea matInput [formControl]="bioCtrl" rows="3" placeholder="Tell us about yourself"></textarea>
            <mat-hint align="end">{{ bioCtrl.value?.length || 0 }}/200</mat-hint>
          </mat-form-field>
        </div>
        <app-code-block [code]="inputCode" />
      </app-demo-card>

      <app-demo-card title="MatSelect" description="Dropdown selection with single and multiple modes">
        <div class="field-col">
          <mat-form-field appearance="outline">
            <mat-label>Framework</mat-label>
            <mat-select [formControl]="frameworkCtrl">
              @for (f of frameworks; track f.value) {
                <mat-option [value]="f.value">{{ f.label }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Technologies (multi)</mat-label>
            <mat-select [formControl]="techCtrl" multiple>
              @for (t of technologies; track t) {
                <mat-option [value]="t">{{ t }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>
        <div class="output-box">
          Framework: {{ frameworkCtrl.value || '—' }}<br>
          Selected: {{ techCtrl.value?.join(', ') || '—' }}
        </div>
        <app-code-block [code]="selectCode" />
      </app-demo-card>

      <app-demo-card title="MatCheckbox & MatRadio" description="Boolean toggles and exclusive selection">
        <div class="toggle-col">
          <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:6px">Checkboxes:</p>
          @for (option of checkOptions; track option.label) {
            <mat-checkbox [(ngModel)]="option.checked" color="primary">{{ option.label }}</mat-checkbox>
          }

          <p style="color:var(--text-muted);font-size:0.85rem;margin:12px 0 6px">Radio group:</p>
          <mat-radio-group [formControl]="radioCtrl" class="radio-group">
            @for (r of radioOptions; track r.value) {
              <mat-radio-button [value]="r.value" color="primary">{{ r.label }}</mat-radio-button>
            }
          </mat-radio-group>
        </div>
        <div class="output-box mt-1">
          Checked: {{ checkedLabels() }}<br>
          Radio: {{ radioCtrl.value || '—' }}
        </div>
        <app-code-block [code]="checkRadioCode" />
      </app-demo-card>

      <app-demo-card title="MatSlider & MatSlideToggle" description="Range input and boolean toggle">
        <div class="toggle-col">
          <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:6px">
            Slider: <strong style="color:var(--accent)">{{ sliderValue() }}</strong>
          </p>
          <mat-slider min="0" max="100" step="5" discrete style="width:100%">
            <input matSliderThumb (valueChange)="sliderValue.set($event)" [value]="sliderValue()" />
          </mat-slider>

          <p style="color:var(--text-muted);font-size:0.85rem;margin:12px 0 6px">Range slider:</p>
          <mat-slider min="0" max="100" step="1" style="width:100%">
            <input matSliderStartThumb (valueChange)="rangeStart.set($event)" />
            <input matSliderEndThumb (valueChange)="rangeEnd.set($event)" />
          </mat-slider>

          <div style="margin:12px 0;display:flex;flex-direction:column;gap:8px">
            <mat-slide-toggle color="primary" [(ngModel)]="darkMode">Dark mode</mat-slide-toggle>
            <mat-slide-toggle color="accent" [(ngModel)]="notifications">Notifications</mat-slide-toggle>
            <mat-slide-toggle color="warn" [disabled]="true">Disabled toggle</mat-slide-toggle>
          </div>
        </div>
        <div class="output-box">
          Slider: {{ sliderValue() }} | Range: {{ rangeStart() }}–{{ rangeEnd() }}<br>
          Dark: {{ darkMode }} | Notifications: {{ notifications }}
        </div>
        <app-code-block [code]="sliderCode" />
      </app-demo-card>
    </div>
  `,
  styles: [`
    .field-col { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }
    .field-col mat-form-field { width: 100%; }
    .toggle-col { display: flex; flex-direction: column; }
    .radio-group { display: flex; flex-direction: column; gap: 4px; }
  `]
})
export class MatFormControlsComponent {
  // Input controls
  usernameCtrl = new FormControl('', [Validators.required, Validators.minLength(3)]);
  emailCtrl = new FormControl('', [Validators.email]);
  bioCtrl = new FormControl('', [Validators.maxLength(200)]);

  // Select controls
  frameworkCtrl = new FormControl<string | null>(null);
  techCtrl = new FormControl<string[]>([]);
  frameworks = [
    { value: 'angular', label: 'Angular' },
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue' },
    { value: 'svelte', label: 'Svelte' },
  ];
  technologies = ['TypeScript', 'RxJS', 'Signals', 'NgRx', 'Vitest', 'SCSS'];

  // Checkbox
  checkOptions = [
    { label: 'TypeScript', checked: true },
    { label: 'SCSS', checked: true },
    { label: 'Testing', checked: false },
  ];

  checkedLabels = signal('');

  constructor() {
    // Update checked signal reactively isn't needed here since it's template-driven
  }

  get checkedLabelsStr() {
    return this.checkOptions.filter(o => o.checked).map(o => o.label).join(', ') || '—';
  }

  // Radio
  radioCtrl = new FormControl<string | null>(null);
  radioOptions = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ];

  // Slider
  sliderValue = signal(40);
  rangeStart = signal(20);
  rangeEnd = signal(80);

  // Slide toggles
  darkMode = true;
  notifications = false;

  inputCode = `<mat-form-field appearance="outline">
  <mat-label>Username</mat-label>
  <input matInput [formControl]="usernameCtrl" />
  <mat-icon matPrefix>person</mat-icon>
  @if (usernameCtrl.hasError('required') && usernameCtrl.touched) {
    <mat-error>Username is required</mat-error>
  }
  <mat-hint>Minimum 3 characters</mat-hint>
</mat-form-field>

// appearances: fill | outline | standard`;

  selectCode = `<mat-form-field appearance="outline">
  <mat-label>Framework</mat-label>
  <mat-select [formControl]="frameworkCtrl">
    <mat-option value="angular">Angular</mat-option>
  </mat-select>
</mat-form-field>

<!-- Multiple selection -->
<mat-select [formControl]="techCtrl" multiple>
  <mat-option value="rxjs">RxJS</mat-option>
</mat-select>`;

  checkRadioCode = `<mat-checkbox [(ngModel)]="checked" color="primary">
  Option label
</mat-checkbox>

<mat-radio-group [formControl]="radioCtrl">
  <mat-radio-button value="a" color="primary">Option A</mat-radio-button>
  <mat-radio-button value="b" color="primary">Option B</mat-radio-button>
</mat-radio-group>`;

  sliderCode = `<!-- Single thumb -->
<mat-slider min="0" max="100" step="5" discrete>
  <input matSliderThumb (valueChange)="value.set($event)" />
</mat-slider>

<!-- Range slider (two thumbs) -->
<mat-slider min="0" max="100">
  <input matSliderStartThumb (valueChange)="start.set($event)" />
  <input matSliderEndThumb (valueChange)="end.set($event)" />
</mat-slider>

<mat-slide-toggle color="primary" [(ngModel)]="enabled">
  Enable feature
</mat-slide-toggle>`;
}
