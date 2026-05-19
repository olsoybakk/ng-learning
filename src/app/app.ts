import { Component, signal, effect, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

interface NavGroup {
  title: string;
  tag: string;
  items: NavItem[];
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private doc = inject(DOCUMENT);

  sidebarOpen = signal(true);
  darkMode = signal(localStorage.getItem('theme') !== 'light');

  constructor() {
    effect(() => {
      this.doc.documentElement.classList.toggle('light', !this.darkMode());
      localStorage.setItem('theme', this.darkMode() ? 'dark' : 'light');
    });
  }

  navGroups: NavGroup[] = [
    {
      title: 'Angular',
      tag: 'tag-angular',
      items: [
        { label: 'Signals', path: '/angular/signals', icon: '⚡' },
        { label: 'Control Flow', path: '/angular/control-flow', icon: '🔀' },
        { label: 'Reactive Forms', path: '/angular/reactive-forms', icon: '📋' },
        { label: 'Pipes', path: '/angular/pipes', icon: '🔧' },
        { label: 'Directives', path: '/angular/directives', icon: '🎯' },
        { label: 'HTTP Client', path: '/angular/http-client', icon: '🌐' },
        { label: 'Change Detection', path: '/angular/change-detection', icon: '🔄' },
      ]
    },
    {
      title: 'RxJS',
      tag: 'tag-rxjs',
      items: [
        { label: 'Subjects', path: '/rxjs/subjects', icon: '📡' },
        { label: 'Transform Operators', path: '/rxjs/transform', icon: '🔁' },
        { label: 'Filter Operators', path: '/rxjs/filter', icon: '🔍' },
        { label: 'Combination Operators', path: '/rxjs/combination', icon: '🔗' },
        { label: 'Error Handling', path: '/rxjs/error-handling', icon: '🛡️' },
        { label: 'Multicasting', path: '/rxjs/multicasting', icon: '📢' },
        { label: 'Custom Operators', path: '/rxjs/custom-operators', icon: '🧩' },
      ]
    },
    {
      title: 'Angular Material',
      tag: 'tag-material',
      items: [
        { label: 'Buttons & Indicators', path: '/material/buttons', icon: '🔘' },
        { label: 'Form Controls', path: '/material/form-controls', icon: '📝' },
        { label: 'Data Display', path: '/material/data-display', icon: '📊' },
        { label: 'Navigation', path: '/material/navigation', icon: '🗂️' },
        { label: 'Overlays & Feedback', path: '/material/overlays', icon: '💬' },
      ]
    }
  ];
}
