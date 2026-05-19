import { Component, inject, signal } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { CodeBlockComponent } from '../../../shared/components/code-block/code-block';
import { DemoCardComponent } from '../../../shared/components/demo-card/demo-card';

// ─── Dialog component (defined inline, opened via MatDialog service) ───────────
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>{{ data.message }}</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">Cancel</button>
      <button mat-flat-button color="primary" [mat-dialog-close]="true" cdkFocusInitial>Confirm</button>
    </mat-dialog-actions>
  `,
})
export class ConfirmDialogComponent {
  readonly data = inject<{ title: string; message: string }>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);
}

// ─── Main overlays page component ─────────────────────────────────────────────
@Component({
  selector: 'app-mat-overlays',
  standalone: true,
  imports: [
    MatTooltipModule, MatMenuModule, MatSnackBarModule,
    MatDialogModule, MatButtonModule, MatIconModule, MatDividerModule,
    CodeBlockComponent, DemoCardComponent,
  ],
  template: `
    <div class="page-header">
      <h1>💬 Overlays & Feedback</h1>
      <p>MatTooltip, MatMenu, MatSnackBar, and MatDialog.</p>
    </div>

    <div class="grid-2">
      <app-demo-card title="MatTooltip" description="Simple hover/focus tooltips via directive">
        <div class="overlay-demo">
          <button mat-raised-button
            matTooltip="Default tooltip (top)"
            matTooltipPosition="above">
            Above
          </button>
          <button mat-raised-button
            matTooltip="Tooltip on the right"
            matTooltipPosition="right">
            Right
          </button>
          <button mat-raised-button
            matTooltip="Tooltip below the button"
            matTooltipPosition="below">
            Below
          </button>
          <button mat-raised-button
            matTooltip="Tooltip on the left"
            matTooltipPosition="left">
            Left
          </button>
          <button mat-icon-button
            matTooltip="Delayed tooltip (500ms)"
            [matTooltipShowDelay]="500"
            color="primary">
            <mat-icon>help_outline</mat-icon>
          </button>
        </div>
        <app-code-block [code]="tooltipCode" />
      </app-demo-card>

      <app-demo-card title="MatMenu" description="Context and dropdown menus with nested support">
        <div class="overlay-demo">
          <!-- Basic menu -->
          <button mat-raised-button [matMenuTriggerFor]="basicMenu">
            <mat-icon>more_vert</mat-icon> Options
          </button>
          <mat-menu #basicMenu="matMenu">
            <button mat-menu-item (click)="menuLog('Edit')"><mat-icon>edit</mat-icon>Edit</button>
            <button mat-menu-item (click)="menuLog('Duplicate')"><mat-icon>content_copy</mat-icon>Duplicate</button>
            <mat-divider />
            <button mat-menu-item (click)="menuLog('Delete')" style="color:var(--red)">
              <mat-icon style="color:var(--red)">delete</mat-icon>Delete
            </button>
          </mat-menu>

          <!-- Menu with nested sub-menu -->
          <button mat-raised-button [matMenuTriggerFor]="nestedMenu">
            <mat-icon>share</mat-icon> Share
          </button>
          <mat-menu #nestedMenu="matMenu">
            <button mat-menu-item (click)="menuLog('Copy link')"><mat-icon>link</mat-icon>Copy link</button>
            <button mat-menu-item [matMenuTriggerFor]="socialMenu">
              <mat-icon>share</mat-icon>Share to...
            </button>
          </mat-menu>
          <mat-menu #socialMenu="matMenu">
            <button mat-menu-item (click)="menuLog('Twitter')"><mat-icon>tag</mat-icon>Twitter/X</button>
            <button mat-menu-item (click)="menuLog('LinkedIn')"><mat-icon>work</mat-icon>LinkedIn</button>
          </mat-menu>
        </div>

        @if (menuHistory().length > 0) {
          <div class="output-box mt-1">
            @for (entry of menuHistory(); track $index) {
              <div class="output-line">Clicked: {{ entry }}</div>
            }
          </div>
        }
        <app-code-block [code]="menuCode" />
      </app-demo-card>

      <app-demo-card title="MatSnackBar" description="Brief notification messages with optional action">
        <div class="overlay-demo">
          <button mat-raised-button (click)="openSnack('simple')">Simple</button>
          <button mat-raised-button color="primary" (click)="openSnack('action')">With Action</button>
          <button mat-raised-button color="warn" (click)="openSnack('error')">Error</button>
          <button mat-raised-button (click)="openSnack('long')">Long Duration</button>
        </div>
        @if (snackResult()) {
          <div class="output-box mt-1">Result: {{ snackResult() }}</div>
        }
        <app-code-block [code]="snackCode" />
      </app-demo-card>

      <app-demo-card title="MatDialog" description="Modal dialogs with data passing and result handling">
        <div class="overlay-demo">
          <button mat-raised-button color="primary" (click)="openDialog('confirm')">
            Confirm Dialog
          </button>
          <button mat-raised-button (click)="openDialog('delete')">
            Delete Warning
          </button>
          <button mat-raised-button color="accent" (click)="openDialog('info')">
            Info Dialog
          </button>
        </div>
        @if (dialogResult() !== null) {
          <div class="output-box mt-1">
            Dialog result: <strong>{{ dialogResult() ? 'Confirmed ✓' : 'Cancelled ✗' }}</strong>
          </div>
        }
        <app-code-block [code]="dialogCode" />
      </app-demo-card>
    </div>
  `,
  styles: [`
    .overlay-demo { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 12px; }
  `]
})
export class MatOverlaysComponent {
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  menuHistory = signal<string[]>([]);
  snackResult = signal('');
  dialogResult = signal<boolean | null>(null);

  menuLog(action: string) {
    this.menuHistory.update(h => [action, ...h.slice(0, 3)]);
  }

  openSnack(type: string) {
    const configs: Record<string, { message: string; action?: string; panelClass?: string; duration: number }> = {
      simple: { message: 'Operation completed successfully', duration: 3000 },
      action: { message: 'Item archived', action: 'Undo', duration: 5000 },
      error: { message: 'Something went wrong!', action: 'Retry', panelClass: 'snack-error', duration: 4000 },
      long: { message: 'This message stays for 8 seconds', duration: 8000 },
    };
    const cfg = configs[type];
    const ref = this.snackBar.open(cfg.message, cfg.action, {
      duration: cfg.duration,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
    });
    if (cfg.action) {
      ref.onAction().subscribe(() => this.snackResult.set(`Action "${cfg.action}" clicked`));
    }
    ref.afterDismissed().subscribe(info => {
      if (!info.dismissedByAction) this.snackResult.set('Dismissed by timeout');
    });
  }

  openDialog(variant: string) {
    const configs: Record<string, { title: string; message: string }> = {
      confirm: { title: 'Confirm Action', message: 'Are you sure you want to proceed with this action?' },
      delete: { title: 'Delete Item?', message: 'This will permanently delete the item. This action cannot be undone.' },
      info: { title: 'About This Demo', message: 'This dialog is a standalone Angular component opened via the MatDialog service with data passed via MAT_DIALOG_DATA injection token.' },
    };
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: configs[variant],
      width: '400px',
    });
    ref.afterClosed().subscribe(result => {
      if (result !== undefined) this.dialogResult.set(result);
    });
  }

  tooltipCode = `<!-- Position: above | below | left | right | before | after -->
<button mat-raised-button
  matTooltip="Helpful hint"
  matTooltipPosition="above">
  Hover me
</button>

<!-- Delay, disable, or customize -->
<button [matTooltipShowDelay]="500"
  [matTooltipHideDelay]="200"
  matTooltip="Delayed tooltip">
  Delayed
</button>`;

  menuCode = `<button mat-button [matMenuTriggerFor]="menu">Open Menu</button>

<mat-menu #menu="matMenu">
  <button mat-menu-item>
    <mat-icon>edit</mat-icon> Edit
  </button>
  <!-- Nested sub-menu -->
  <button mat-menu-item [matMenuTriggerFor]="subMenu">
    More...
  </button>
</mat-menu>

<mat-menu #subMenu="matMenu">
  <button mat-menu-item>Option A</button>
</mat-menu>`;

  snackCode = `private snackBar = inject(MatSnackBar);

// Basic
this.snackBar.open('Message', undefined, { duration: 3000 });

// With action button
const ref = this.snackBar.open('Archived', 'Undo', {
  duration: 5000,
  horizontalPosition: 'end',
  verticalPosition: 'bottom',
});

ref.onAction().subscribe(() => console.log('Undo clicked'));
ref.afterDismissed().subscribe(info => console.log(info));`;

  dialogCode = `// 1. Define a standalone dialog component
@Component({
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: \`
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>{{ data.message }}</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">Cancel</button>
      <button mat-flat-button [mat-dialog-close]="true">Confirm</button>
    </mat-dialog-actions>
  \`,
})
class ConfirmDialogComponent {
  readonly data = inject<{title: string}>(MAT_DIALOG_DATA);
}

// 2. Open it from a parent component
private dialog = inject(MatDialog);

openDialog() {
  const ref = this.dialog.open(ConfirmDialogComponent, {
    data: { title: 'Confirm?', message: 'Are you sure?' },
    width: '400px',
  });
  ref.afterClosed().subscribe(result => console.log(result)); // true | false | undefined
}`;
}
