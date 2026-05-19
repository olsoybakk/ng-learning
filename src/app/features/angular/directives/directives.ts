import {
  Component, Directive, ElementRef, HostBinding, HostListener,
  Input, OnInit, TemplateRef, ViewContainerRef, signal
} from '@angular/core';
import { CodeBlockComponent } from '../../../shared/components/code-block/code-block';
import { DemoCardComponent } from '../../../shared/components/demo-card/demo-card';
import { FormsModule } from '@angular/forms';

@Directive({
  selector: '[appHighlight]',
  standalone: true,
})
export class HighlightDirective {
  @Input('appHighlight') color = '#6c63ff';
  @Input() highlightScale = '1.02';

  @HostBinding('style.transition') transition = 'background 0.2s, transform 0.1s';

  @HostListener('mouseenter') onEnter() {
    this.el.nativeElement.style.background = this.color + '22';
    this.el.nativeElement.style.transform = `scale(${this.highlightScale})`;
  }

  @HostListener('mouseleave') onLeave() {
    this.el.nativeElement.style.background = '';
    this.el.nativeElement.style.transform = 'scale(1)';
  }

  constructor(private el: ElementRef) {}
}

@Directive({
  selector: '[appAutoFocus]',
  standalone: true,
})
export class AutoFocusDirective implements OnInit {
  constructor(private el: ElementRef) {}
  ngOnInit() { setTimeout(() => this.el.nativeElement.focus(), 0); }
}

@Directive({
  selector: '[appIf]',
  standalone: true,
})
export class AppIfDirective {
  private hasView = false;

  constructor(private tpl: TemplateRef<unknown>, private vcr: ViewContainerRef) {}

  @Input() set appIf(condition: boolean) {
    if (condition && !this.hasView) {
      this.vcr.createEmbeddedView(this.tpl);
      this.hasView = true;
    } else if (!condition && this.hasView) {
      this.vcr.clear();
      this.hasView = false;
    }
  }
}

@Component({
  selector: 'app-directives',
  standalone: true,
  imports: [CodeBlockComponent, DemoCardComponent, FormsModule, HighlightDirective, AutoFocusDirective, AppIfDirective],
  template: `
    <div class="page-header">
      <h1>🎯 Directives</h1>
      <p>Attribute directives with <code>HostBinding/HostListener</code> and structural directives with <code>TemplateRef</code>.</p>
    </div>

    <div class="grid-2">
      <app-demo-card title="Attribute Directive — appHighlight" description="Adds hover effects via HostListener and HostBinding">
        <div style="display:flex;flex-direction:column;gap:8px">
          <div appHighlight style="padding:12px;border:1px solid var(--border);border-radius:6px;cursor:pointer">
            Hover me (default purple highlight)
          </div>
          <div [appHighlight]="'#4ade80'" highlightScale="1.01" style="padding:12px;border:1px solid var(--border);border-radius:6px;cursor:pointer">
            Hover me (green highlight)
          </div>
          <div [appHighlight]="'#f87171'" style="padding:12px;border:1px solid var(--border);border-radius:6px;cursor:pointer">
            Hover me (red highlight)
          </div>
        </div>
        <app-code-block [code]="attributeCode" />
      </app-demo-card>

      <app-demo-card title="Structural Directive — *appIf" description="Custom reimplementation of *ngIf using TemplateRef + ViewContainerRef">
        <div class="controls">
          <button class="btn-primary" (click)="showContent.set(!showContent())">
            Toggle: {{ showContent() ? 'Hide' : 'Show' }}
          </button>
        </div>
        <div class="output-box mt-1">
          <div *appIf="showContent()" style="color:var(--green)">
            ✓ Content rendered via custom *appIf directive
          </div>
          <div *appIf="!showContent()" style="color:var(--text-muted)">
            — Content is hidden
          </div>
        </div>
        <app-code-block [code]="structuralCode" />
      </app-demo-card>

      <app-demo-card title="AutoFocus Directive" description="Sets focus on element after init via ElementRef">
        <input appAutoFocus placeholder="This input is auto-focused on mount" style="width:100%" />
        <app-code-block [code]="autoFocusCode" />
      </app-demo-card>

      <app-demo-card title="HostBinding & HostListener" description="Bind to host element properties and listen to host events">
        <div style="display:flex;flex-direction:column;gap:6px">
          <p style="font-size:0.85rem">The <code>appHighlight</code> directive uses these under the hood:</p>
          <div class="output-box">
            <div>&#64;HostBinding binds to host element style/class/attr</div>
            <div>&#64;HostListener listens to host element DOM events</div>
          </div>
        </div>
        <app-code-block [code]="hostCode" />
      </app-demo-card>
    </div>
  `
})
export class DirectivesComponent {
  showContent = signal(true);

  attributeCode = `@Directive({ selector: '[appHighlight]', standalone: true })
export class HighlightDirective {
  @Input('appHighlight') color = '#6c63ff';

  @HostBinding('style.transition') transition = 'background 0.2s';

  @HostListener('mouseenter') onEnter() {
    this.el.nativeElement.style.background = this.color + '22';
  }
  @HostListener('mouseleave') onLeave() {
    this.el.nativeElement.style.background = '';
  }

  constructor(private el: ElementRef) {}
}`;

  structuralCode = `@Directive({ selector: '[appIf]', standalone: true })
export class AppIfDirective {
  private hasView = false;

  constructor(
    private tpl: TemplateRef<unknown>,
    private vcr: ViewContainerRef
  ) {}

  @Input() set appIf(condition: boolean) {
    if (condition && !this.hasView) {
      this.vcr.createEmbeddedView(this.tpl);
      this.hasView = true;
    } else if (!condition && this.hasView) {
      this.vcr.clear();
      this.hasView = false;
    }
  }
}

// Usage: <div *appIf="isVisible">Content</div>`;

  autoFocusCode = `@Directive({ selector: '[appAutoFocus]', standalone: true })
export class AutoFocusDirective implements OnInit {
  constructor(private el: ElementRef) {}

  ngOnInit() {
    setTimeout(() => this.el.nativeElement.focus(), 0);
  }
}

// Usage: <input appAutoFocus />`;

  hostCode = `@Directive({ selector: '[appActive]' })
export class ActiveDirective {
  // Binds to host element's class
  @HostBinding('class.active') isActive = false;

  // Binds to host element's attribute
  @HostBinding('attr.aria-pressed') get ariaPressed() {
    return this.isActive;
  }

  // Listens to host element's click event
  @HostListener('click') toggle() {
    this.isActive = !this.isActive;
  }

  // Listen with event object
  @HostListener('keydown', ['$event'])
  onKey(event: KeyboardEvent) {
    if (event.key === 'Enter') this.isActive = true;
  }
}`;
}
