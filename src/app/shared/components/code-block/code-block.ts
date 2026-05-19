import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-code-block',
  standalone: true,
  template: `
    <div class="code-block">
      <div class="code-header">
        <span class="lang-label">{{ lang }}</span>
        <button class="copy-btn" (click)="copy()">{{ copied ? 'Copied!' : 'Copy' }}</button>
      </div>
      <pre><code [innerHTML]="highlighted"></code></pre>
    </div>
  `,
  styles: [`
    .code-block {
      background: var(--code-bg);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
      margin: 0.75rem 0;
    }
    .code-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 16px;
      background: var(--surface-2);
      border-bottom: 1px solid var(--border);
    }
    .lang-label {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-family: var(--font-mono);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .copy-btn {
      background: transparent;
      color: var(--text-muted);
      font-size: 0.75rem;
      padding: 2px 8px;
      border: 1px solid var(--border);
      border-radius: 4px;
    }
    .copy-btn:hover { color: var(--text); border-color: var(--accent); }
    pre {
      margin: 0;
      padding: 16px;
      overflow-x: auto;
      font-family: var(--font-mono);
      font-size: 0.82rem;
      line-height: 1.7;
    }
    code { background: transparent; padding: 0; color: var(--text); }
    :host ::ng-deep .kw { color: var(--code-kw); }
    :host ::ng-deep .fn { color: var(--code-fn); }
    :host ::ng-deep .str { color: var(--code-str); }
    :host ::ng-deep .num { color: var(--code-num); }
    :host ::ng-deep .cm { color: var(--code-cm); font-style: italic; }
    :host ::ng-deep .cls { color: var(--code-cls); }
    :host ::ng-deep .dec { color: var(--code-dec); }
    :host ::ng-deep .op { color: var(--code-op); }
  `]
})
export class CodeBlockComponent {
  @Input() code = '';
  @Input() lang = 'typescript';

  copied = false;

  get highlighted(): string {
    return this.highlight(this.code);
  }

  copy() {
    navigator.clipboard.writeText(this.code);
    this.copied = true;
    setTimeout(() => this.copied = false, 2000);
  }

  private highlight(code: string): string {
    const escaped = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    return escaped
      .replace(/(\/\/[^\n]*)/g, '<span class="cm">$1</span>')
      .replace(/\b(import|export|from|const|let|var|function|return|class|extends|implements|interface|type|enum|async|await|new|this|true|false|null|undefined|void|if|else|for|of|in|switch|case|break|default|throw|try|catch|finally|public|private|protected|readonly|static|abstract|override|declare|namespace|module|require|typeof|instanceof|keyof|infer|never|any|string|number|boolean|object|unknown|@)\b/g, '<span class="kw">$1</span>')
      .replace(/(@\w+)/g, '<span class="dec">$1</span>')
      .replace(/\b([A-Z][A-Za-z0-9]*)\b/g, '<span class="cls">$1</span>')
      .replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g, '<span class="str">$1</span>')
      .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="num">$1</span>');
  }
}
