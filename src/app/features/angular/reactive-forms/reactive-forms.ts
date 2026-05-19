import { Component, OnInit } from '@angular/core';
import {
  AbstractControl, FormArray, FormControl, FormGroup,
  ReactiveFormsModule, ValidationErrors, Validators
} from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { CodeBlockComponent } from '../../../shared/components/code-block/code-block';
import { DemoCardComponent } from '../../../shared/components/demo-card/demo-card';
import { JsonPipe } from '@angular/common';

function strongPassword(control: AbstractControl): ValidationErrors | null {
  const v = control.value as string;
  if (!v) return null;
  const missing = [];
  if (!/[A-Z]/.test(v)) missing.push('uppercase');
  if (!/[0-9]/.test(v)) missing.push('number');
  if (v.length < 8) missing.push('8+ chars');
  return missing.length ? { strongPassword: missing.join(', ') } : null;
}

function asyncEmailValidator(control: AbstractControl): Observable<ValidationErrors | null> {
  const taken = ['admin@example.com', 'user@example.com'];
  return timer(600).pipe(
    switchMap(() => of(taken.includes(control.value) ? { emailTaken: true } : null))
  );
}

@Component({
  selector: 'app-reactive-forms',
  standalone: true,
  imports: [ReactiveFormsModule, CodeBlockComponent, DemoCardComponent, JsonPipe],
  template: `
    <div class="page-header">
      <h1>📋 Reactive Forms</h1>
      <p>Type-safe forms with <code>FormControl</code>, <code>FormGroup</code>, <code>FormArray</code>, and custom validators.</p>
    </div>

    <div class="grid-2">
      <app-demo-card title="FormControl & Validators" description="Built-in and custom synchronous validators">
        <div style="display:flex;flex-direction:column;gap:10px">
          <div>
            <input [formControl]="emailCtrl" placeholder="Email (try admin@example.com)" style="width:100%" />
            @if (emailCtrl.pending) { <div class="hint">⏳ Checking availability...</div> }
            @else if (emailCtrl.errors?.['required'] && emailCtrl.touched) { <div class="err">Required</div> }
            @else if (emailCtrl.errors?.['email'] && emailCtrl.touched) { <div class="err">Invalid email</div> }
            @else if (emailCtrl.errors?.['emailTaken']) { <div class="err">Email is already taken</div> }
            @else if (emailCtrl.valid && emailCtrl.dirty) { <div class="ok">✓ Available</div> }
          </div>
          <div>
            <input [formControl]="passwordCtrl" type="password" placeholder="Password" style="width:100%" />
            @if (passwordCtrl.errors?.['strongPassword'] && passwordCtrl.touched) {
              <div class="err">Missing: {{ passwordCtrl.errors?.['strongPassword'] }}</div>
            }
            @else if (passwordCtrl.valid && passwordCtrl.dirty) { <div class="ok">✓ Strong password</div> }
          </div>
        </div>
        <app-code-block [code]="controlCode" />
      </app-demo-card>

      <app-demo-card title="FormGroup — Registration Form" description="Grouped controls with cross-field validation">
        <form [formGroup]="registerForm" (ngSubmit)="onRegister()" style="display:flex;flex-direction:column;gap:8px">
          <input formControlName="username" placeholder="Username" />
          @if (f['username'].errors?.['minlength'] && f['username'].touched) {
            <div class="err">Min 3 characters</div>
          }
          <input formControlName="email" placeholder="Email" />
          <input formControlName="password" type="password" placeholder="Password" />
          <input formControlName="confirmPassword" type="password" placeholder="Confirm password" />
          @if (registerForm.errors?.['passwordMismatch'] && f['confirmPassword'].touched) {
            <div class="err">Passwords do not match</div>
          }
          <button type="submit" class="btn-primary" [disabled]="registerForm.invalid">Register</button>
        </form>
        @if (registerResult) {
          <div class="output-box mt-1">{{ registerResult }}</div>
        }
        <app-code-block [code]="groupCode" />
      </app-demo-card>

      <app-demo-card title="FormArray — Dynamic Fields" description="Add/remove controls at runtime">
        <form [formGroup]="skillsForm">
          <div formArrayName="skills" style="display:flex;flex-direction:column;gap:6px">
            @for (ctrl of skillsArray.controls; track $index) {
              <div style="display:flex;gap:6px">
                <input [formControlName]="$index" placeholder="Skill {{ $index + 1 }}" style="flex:1" />
                <button class="btn-danger" (click)="removeSkill($index)" style="padding:6px 10px">✕</button>
              </div>
            }
          </div>
          <button class="btn-success mt-2" (click)="addSkill()">+ Add Skill</button>
        </form>
        <div class="output-box mt-1">
          {{ skillsArray.value | json }}
        </div>
        <app-code-block [code]="arrayCode" />
      </app-demo-card>

      <app-demo-card title="valueChanges & statusChanges" description="React to form changes as Observables">
        <input [formControl]="liveCtrl" placeholder="Type anything..." style="width:100%" />
        <div class="output-box mt-1" style="max-height:130px;overflow-y:auto">
          @for (entry of liveLog; track $index) {
            <div class="output-line">{{ entry }}</div>
          }
        </div>
        <app-code-block [code]="changesCode" />
      </app-demo-card>
    </div>
  `,
  styles: [`
    .err { color: var(--red); font-size: 0.8rem; margin-top: 2px; }
    .ok { color: var(--green); font-size: 0.8rem; margin-top: 2px; }
    .hint { color: var(--yellow); font-size: 0.8rem; margin-top: 2px; }
  `]
})
export class ReactiveFormsComponent implements OnInit {
  emailCtrl = new FormControl('', { validators: [Validators.required, Validators.email], asyncValidators: [asyncEmailValidator], updateOn: 'blur' });
  passwordCtrl = new FormControl('', [Validators.required, strongPassword]);

  registerForm = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl(''),
  }, { validators: this.matchPasswords });

  registerResult = '';

  skillsForm = new FormGroup({
    skills: new FormArray([new FormControl('TypeScript'), new FormControl('Angular')])
  });

  liveCtrl = new FormControl('');
  liveLog: string[] = [];

  get f() { return this.registerForm.controls; }
  get skillsArray() { return this.skillsForm.get('skills') as FormArray; }

  ngOnInit() {
    this.liveCtrl.valueChanges.subscribe(v => {
      this.liveLog = [`value: "${v}" | status: ${this.liveCtrl.status}`, ...this.liveLog.slice(0, 6)];
    });
  }

  matchPasswords(group: AbstractControl): ValidationErrors | null {
    const pw = (group as FormGroup).get('password')?.value;
    const cpw = (group as FormGroup).get('confirmPassword')?.value;
    return pw && cpw && pw !== cpw ? { passwordMismatch: true } : null;
  }

  onRegister() {
    if (this.registerForm.valid) {
      this.registerResult = `✓ Registered: ${this.f['username'].value}`;
    }
  }

  addSkill() { this.skillsArray.push(new FormControl('')); }
  removeSkill(i: number) { this.skillsArray.removeAt(i); }

  controlCode = `const emailCtrl = new FormControl('', {
  validators: [Validators.required, Validators.email],
  asyncValidators: [asyncEmailValidator],
  updateOn: 'blur'
});

function asyncEmailValidator(ctrl): Observable<ValidationErrors | null> {
  return timer(600).pipe(
    switchMap(() => checkEmailAvailability(ctrl.value))
  );
}`;

  groupCode = `const form = new FormGroup({
  username: new FormControl('', [Validators.required, Validators.minLength(3)]),
  password: new FormControl('', [Validators.required]),
  confirmPassword: new FormControl(''),
}, { validators: matchPasswords });

function matchPasswords(group: FormGroup) {
  const { password, confirmPassword } = group.controls;
  return password.value !== confirmPassword.value
    ? { passwordMismatch: true } : null;
}`;

  arrayCode = `const skills = new FormArray([
  new FormControl('TypeScript'),
  new FormControl('Angular'),
]);

// Add
skills.push(new FormControl('RxJS'));

// Remove
skills.removeAt(0);

// Access value
skills.value; // ['Angular', 'RxJS']`;

  changesCode = `const ctrl = new FormControl('');

ctrl.valueChanges
  .pipe(debounceTime(300), distinctUntilChanged())
  .subscribe(value => search(value));

ctrl.statusChanges
  .subscribe(status => console.log(status));
  // 'VALID' | 'INVALID' | 'PENDING' | 'DISABLED'`;
}
